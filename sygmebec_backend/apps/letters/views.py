from io import BytesIO

from django.core.files.base import ContentFile
from django.http import FileResponse
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
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
        lettre = self.get_object()
        if not lettre.fichier:
            self._generate_pdf(lettre)
        return FileResponse(
            lettre.fichier.open('rb'),
            as_attachment=True,
            filename=f'{lettre.reference}.pdf',
        )

    def _generate_pdf(self, lettre):
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2.2 * cm, leftMargin=2.2 * cm, topMargin=2 * cm, bottomMargin=2 * cm)
        styles = getSampleStyleSheet()
        title = ParagraphStyle('LetterTitle', parent=styles['Title'], alignment=TA_CENTER, fontSize=16, spaceAfter=16)
        body = ParagraphStyle('LetterBody', parent=styles['BodyText'], fontSize=11, leading=18, spaceAfter=12)
        type_label = lettre.get_type_lettre_display()
        default_content = (
            f"Par la présente, l'Église Baptiste de l'Espoir du Cap-Haïtien recommande {lettre.membre.nom_complet}."
            if lettre.type_lettre == Lettre.RECOMMANDATION
            else f"Par la présente, l'Église Baptiste de l'Espoir du Cap-Haïtien confirme le transfert de {lettre.membre.nom_complet}."
        )
        content = lettre.contenu or default_content
        story = [
            Paragraph('Église Baptiste de l’Espoir du Cap-Haïtien', title),
            Paragraph(type_label, title),
            Paragraph(f'<b>Référence :</b> {lettre.reference}', body),
            Paragraph(f'<b>Date :</b> {lettre.date_emission:%d/%m/%Y}', body),
        ]
        if lettre.destinataire:
            story.append(Paragraph(f'<b>Destinataire :</b> {lettre.destinataire}', body))
        story.extend([
            Spacer(1, 0.4 * cm),
            Paragraph(f'<b>Objet :</b> {lettre.objet}', body),
            Paragraph(content.replace('\n', '<br/>'), body),
            Spacer(1, 1.1 * cm),
            Paragraph('Pour l’Église Baptiste de l’Espoir du Cap-Haïtien', body),
        ])
        document.build(story)
        lettre.fichier.save(f'{lettre.reference}.pdf', ContentFile(buffer.getvalue()), save=True)
        buffer.close()
