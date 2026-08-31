from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape
from zipfile import ZIP_DEFLATED, ZipFile

from django.http import FileResponse
from django.utils.text import slugify
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import HRFlowable, Image as ReportLabImage, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from sygmebec_backend.apps.accounts.permissions import IsSecretaireOrPlus
from .models import Lettre
from .serializers import LettreSerializer


class LettreViewSet(viewsets.ModelViewSet):
    queryset = Lettre.objects.select_related('membre', 'membre__statut', 'cree_par').all()
    serializer_class = LettreSerializer
    permission_classes = [IsSecretaireOrPlus]
    filterset_fields = ['type_lettre', 'membre']
    search_fields = ['reference', 'objet', 'destinataire', 'membre__nom', 'membre__prenom']
    ordering_fields = ['date_emission', 'reference', 'created_at']

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)

    @action(detail=True, methods=['get'])
    def telecharger(self, request, pk=None):
        return self.exporter(request, pk)

    @action(detail=True, methods=['get'])
    def exporter(self, request, pk=None):
        lettre = self.get_object()
        # ``format`` is reserved by Django REST Framework for renderer selection.
        # Using it for a DOCX export makes DRF return 404 before this action runs.
        file_format = request.query_params.get('export_format', request.query_params.get('format', 'pdf')).lower()
        if file_format == 'docx':
            return FileResponse(self._generate_docx(lettre), as_attachment=True, filename=self._download_filename(lettre, 'docx'), content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        if file_format != 'pdf':
            return Response({'format': 'Utilisez le format pdf ou docx.'}, status=status.HTTP_400_BAD_REQUEST)
        return FileResponse(self._generate_pdf(lettre), as_attachment=True, filename=self._download_filename(lettre, 'pdf'), content_type='application/pdf')

    @staticmethod
    def _formatted_date(date):
        months = ('janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre')
        return f'{date.day:02d} {months[date.month - 1]} {date.year}'

    @staticmethod
    def _download_filename(lettre, extension):
        letter_type = 'lettre_transfert' if lettre.type_lettre == Lettre.TRANSFERT else 'lettre_attestation'
        member_name = slugify(lettre.membre.nom_complet) or 'membre'
        return f'{letter_type}_{member_name}_{lettre.reference}.{extension}'

    @classmethod
    def _template_replacements(cls, lettre):
        return {
            'Storly OSIER': xml_escape(lettre.membre.nom_complet),
            '07 Janvier 2026': cls._formatted_date(lettre.date_emission),
            '[date]': cls._formatted_date(lettre.date_emission),
            '[Nom de l&apos;Église destinataire]': xml_escape(lettre.destinataire or ''),
            '[Adresse de l&apos;Église destinataire]': '',
            '[Nom de l&apos;�glise destinataire]': xml_escape(lettre.destinataire or ''),
            '[Adresse de l&apos;�glise destinataire]': '',
            'Verti�res': 'Vertières', 'Cap-Ha�tien': 'Cap-Haïtien', 'R�v.': 'Rév.', 'T�l': 'Tél',
            'pr�sente': 'présente', 'l&apos;�glise': 'l&apos;église', 'bien-aim�': 'bien-aimé',
            'fid�les': 'fidèles', 'M�dia': 'Média', '�tant': 'Étant', 'r�guli�rement': 'régulièrement',
            'd�livr�e': 'délivrée', '� toutes': 'à toutes', '� :': 'À :', 'fr�res et s�urs': 'frères et sœurs',
            'a �t�': 'a été', 'fid�le': 'fidèle', 'o�': 'où', '� sa': 'À sa', '�tre': 'être',
            're�u': 'reçu', '� votre': 'à votre',
        }

    def _generate_docx(self, lettre):
        template_name = 'transfert.docx' if lettre.type_lettre == Lettre.TRANSFERT else 'attestation.docx'
        template_path = Path(__file__).resolve().parent / 'templates' / 'letters' / template_name
        cleaned_images = {
            'word/media/01a648573577b3f63a9a7fd90a08bcd045463766.png': 'letterhead-clean.png',
            'word/media/c48b8848b59c41dc6115a117b8ca52c8f1720bf6.png': 'signature-seal-clean.png',
        }
        output = BytesIO()
        with ZipFile(template_path, 'r') as template, ZipFile(output, 'w', ZIP_DEFLATED) as document:
            for info in template.infolist():
                content = template.read(info.filename)
                if info.filename in cleaned_images:
                    content = self._template_image(cleaned_images[info.filename]).read()
                elif info.filename == 'word/document.xml':
                    xml = content.decode('utf-8')
                    for source, target in self._template_replacements(lettre).items():
                        xml = xml.replace(source, target)
                    content = xml.encode('utf-8')
                document.writestr(info, content)
        output.seek(0)
        return output

    @staticmethod
    def _template_image(filename):
        """Read the cleaned transparent official asset used in PDF exports."""
        asset_path = Path(__file__).resolve().parent / 'templates' / 'letters' / 'assets' / filename
        return BytesIO(asset_path.read_bytes())

    def _generate_pdf(self, lettre):
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2.2 * cm, leftMargin=2.2 * cm, topMargin=1.7 * cm, bottomMargin=1.7 * cm)
        styles = getSampleStyleSheet()
        header = ParagraphStyle('LetterHeader', parent=styles['Heading1'], alignment=TA_CENTER, fontName='Times-Bold', fontSize=15, leading=18, spaceAfter=3)
        contact = ParagraphStyle('LetterContact', parent=styles['BodyText'], alignment=TA_CENTER, fontName='Times-Roman', textColor=colors.HexColor('#444444'), fontSize=10, leading=13)
        title = ParagraphStyle('LetterTitle', parent=styles['Title'], alignment=TA_CENTER, fontName='Times-Bold', fontSize=17, spaceBefore=26, spaceAfter=12)
        body = ParagraphStyle('LetterBody', parent=styles['BodyText'], alignment=TA_JUSTIFY, fontName='Times-Roman', fontSize=12, leading=18, spaceAfter=14)
        signed = ParagraphStyle('LetterSigned', parent=body, alignment=TA_LEFT, fontName='Times-Italic', spaceBefore=12, spaceAfter=10)
        verse = ParagraphStyle('LetterVerse', parent=body, alignment=TA_CENTER, fontName='Times-Italic', textColor=colors.HexColor('#555555'), fontSize=10, leading=14, spaceAfter=2)
        logo = ReportLabImage(self._template_image('letterhead-clean.png'), width=2.15 * cm, height=2.05 * cm)
        signature_and_seal = ReportLabImage(self._template_image('signature-seal-clean.png'), width=14.2 * cm, height=3.3 * cm)
        official_header = Table(
            [[logo, [
                Paragraph("Église Baptiste de l'Espoir du Cap-Haïtien", header),
                Paragraph('Route Nationale #1, Village Christophe, Vertières, Cap-Haïtien, Haïti, W.I.', contact),
                Paragraph('Rév. Saint-Ange MONESTIME, Ph D, Pasteur Principal', contact),
                Paragraph('Tél : 813 474 2021 / 2260 1532 / 3798 7947', contact),
            ]]],
            colWidths=[2.4 * cm, 14.0 * cm],
            style=TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ]),
        )
        name = lettre.membre.nom_complet
        is_transfer = lettre.type_lettre == Lettre.TRANSFERT
        content = (f"Par la présente, l'Église Baptiste de l'Espoir du Cap-Haïtien certifie et atteste que le bien-aimé frère <b>{xml_escape(name)}</b> a été membre actif et fidèle de notre église, où il a fait partie du Ministère de Média et de la Jeunesse." if is_transfer else f"Par la présente, l'Église Baptiste de l'Espoir du Cap-Haïtien certifie et atteste que le bien-aimé frère <b>{xml_escape(name)}</b> est l'un de ses fidèles membres. Il fait partie du Ministère de Média et de la Jeunesse de l'église. Étant membre actif, il assiste régulièrement aux services publics de l'église.")
        story = [
            official_header,
            Spacer(1, 0.16 * cm),
            HRFlowable(width='100%', thickness=1.1, color=colors.black, spaceAfter=2),
            HRFlowable(width='100%', thickness=0.7, color=colors.black, spaceAfter=7),
            Paragraph('Lettre de Transfert' if is_transfer else 'A Qui de droit', title),
            HRFlowable(width='100%', thickness=0.55, color=colors.HexColor('#888888'), spaceAfter=15),
        ]
        if is_transfer:
            story.extend([Paragraph(f'<b>À :</b> <i>{xml_escape(lettre.destinataire)}</i>', body), Paragraph('Cher Pasteur / Chers frères et sœurs,', body)])
        story.append(Paragraph(content, body))
        if is_transfer:
            story.append(Paragraph("À sa demande, nous lui accordons par la présente sa lettre de transfert afin qu'il puisse être reçu comme membre au sein de votre église. Nous le recommandons chaleureusement à votre communion fraternelle et vous prions de l'accueillir avec amour.", body))
        story.extend([
            Paragraph('Cette lettre lui est délivrée pour servir et valoir à toutes fins utiles.', body),
            Paragraph(f'Fait au Cap-Haïtien, le {self._formatted_date(lettre.date_emission)}.', signed),
            Spacer(1, 0.35 * cm),
            signature_and_seal,
            Spacer(1, 0.55 * cm), Paragraph('"Je puis tout par celui qui me fortifie"', verse), Paragraph('Philippiens 4 : 13', verse),
        ])
        document.build(story)
        buffer.seek(0)
        return buffer
