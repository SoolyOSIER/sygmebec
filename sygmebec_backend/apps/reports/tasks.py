from celery import shared_task
from django.core.files.base import ContentFile
from django.core.mail import send_mail
from django.conf import settings
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from django.db.models import Q
import logging

logger = logging.getLogger(__name__)

@shared_task
def generer_rapport_pdf(rapport_id):
    """Generate PDF report asynchronously."""
    from .models import Rapport, CritereFiltrage
    from sygmebec_backend.apps.members.models import Membre, Statut
    from sygmebec_backend.apps.events.models import Evenement
    
    try:
        rapport = Rapport.objects.get(id=rapport_id)
        rapport.statut = 'EN_COURS'
        rapport.save()
        
        critere = rapport.critere
        
        # Build query filters
        filters = {}
        if critere.statut:
            try:
                statut = Statut.objects.get(libelle=critere.statut)
                filters['statut'] = statut
            except Statut.DoesNotExist:
                pass
        
        if critere.fonction:
            filters['fonctions__nomFonction'] = critere.fonction
        
        # Get members matching criteria
        membres = Membre.objects.filter(**filters).distinct() if filters else Membre.objects.all()
        
        # Get events matching criteria
        evenements = Evenement.objects.all()
        if critere.date_debut:
            evenements = evenements.filter(date__date__gte=critere.date_debut)
        if critere.date_fin:
            evenements = evenements.filter(date__date__lte=critere.date_fin)

        report_labels = dict(CritereFiltrage.TYPE_RAPPORT_CHOICES)
        report_label = report_labels.get(critere.type_rapport, 'Membres')
        event_type_labels = {
            CritereFiltrage.TYPE_FUNERAILLE: ['Funéraille', 'Funérailles'],
            CritereFiltrage.TYPE_MARIAGE: ['Mariage', 'Mariages'],
            CritereFiltrage.TYPE_PRESENTATION_ENFANTS: ['Présentation des enfants'],
            CritereFiltrage.TYPE_PRESENTATION_TEMPLE: ['Présentation au temple'],
        }
        baptises = Membre.objects.none()
        affiliations = Membre.objects.none()
        if critere.type_rapport in event_type_labels:
            event_filter = Q()
            for label in event_type_labels[critere.type_rapport]:
                event_filter |= Q(type_evenement__nom__iexact=label) | Q(titre__icontains=label)
            evenements = evenements.filter(event_filter)
        elif critere.type_rapport == CritereFiltrage.TYPE_BAPTEMES:
            baptises = Membre.objects.exclude(date_bapteme__isnull=True)
            if critere.date_debut:
                baptises = baptises.filter(date_bapteme__gte=critere.date_debut)
            if critere.date_fin:
                baptises = baptises.filter(date_bapteme__lte=critere.date_fin)
        elif critere.type_rapport == CritereFiltrage.TYPE_AFFILIATION:
            affiliations = Membre.objects.exclude(date_affiliation__isnull=True)
            if critere.date_debut:
                affiliations = affiliations.filter(date_affiliation__gte=critere.date_debut)
            if critere.date_fin:
                affiliations = affiliations.filter(date_affiliation__lte=critere.date_fin)
        
        # Generate PDF
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        styles = getSampleStyleSheet()
        title_style = styles['Title']
        heading_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Custom styles
        center_style = ParagraphStyle(
            'CenterStyle',
            parent=styles['Normal'],
            alignment=TA_CENTER,
            fontSize=10
        )
        
        story = []
        
        # Title
        story.append(Paragraph(f"Rapport: {rapport.titre}", title_style))
        story.append(Paragraph(f"Type de rapport: {report_label}", heading_style))
        story.append(Spacer(1, 0.3*cm))
        
        # Metadata
        story.append(Paragraph(f"Généré le: {rapport.dateGeneration.strftime('%d/%m/%Y %H:%M')}", normal_style))
        if rapport.dateFin:
            story.append(Paragraph(f"Date de fin: {rapport.dateFin.strftime('%d/%m/%Y')}", normal_style))
        story.append(Paragraph(f"Généré par: {rapport.genere_par.nom_complet if rapport.genere_par else 'N/A'}", normal_style))
        story.append(Spacer(1, 0.5*cm))
        
        # Critères
        story.append(Paragraph("Critères de filtrage", heading_style))
        critere_text = []
        if critere.statut:
            critere_text.append(f"Statut: {critere.statut}")
        if critere.periode:
            critere_text.append(f"Période: {critere.periode}")
        if critere.fonction:
            critere_text.append(f"Fonction: {critere.fonction}")
        if critere.type_rapport != CritereFiltrage.TYPE_MEMBRES:
            critere_text.append(f"Type: {report_label}")
        if not critere_text:
            critere_text.append("Aucun critère spécifique")
        story.append(Paragraph(", ".join(critere_text), normal_style))
        story.append(Spacer(1, 0.5*cm))
        
        # Members section
        story.append(Paragraph(f"Membres ({membres.count()})", heading_style))
        
        if membres.exists():
            # Create members table
            table_data = [
                ['#', 'Nom complet', 'Statut', 'Téléphone', 'Email', 'Fonctions']
            ]
            
            for i, membre in enumerate(membres, 1):
                fonctions = ", ".join([f.nomFonction for f in membre.fonctions.all()])
                table_data.append([
                    str(i),
                    membre.nom_complet,
                    membre.statut.libelle,
                    membre.telephone or '-',
                    membre.email or '-',
                    fonctions or '-'
                ])
            
            table = Table(table_data, colWidths=[1.5*cm, 4*cm, 3*cm, 3*cm, 4*cm, 4*cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(table)
        else:
            story.append(Paragraph("Aucun membre ne correspond aux critères.", normal_style))
        
        story.append(Spacer(1, 0.5*cm))
        story.append(PageBreak())
        
        # Indicateurs spécifiques aux sacrements et affiliations.
        if critere.type_rapport == CritereFiltrage.TYPE_BAPTEMES:
            story.append(Paragraph(f"Quantité baptisée : {baptises.count()}", heading_style))
            story.append(Spacer(1, 0.2*cm))
            for membre in baptises:
                story.append(Paragraph(
                    f"{membre.nom_complet} — baptisé(e) le {membre.date_bapteme.strftime('%d/%m/%Y')}",
                    normal_style,
                ))
        elif critere.type_rapport == CritereFiltrage.TYPE_AFFILIATION:
            story.append(Paragraph(f"Affiliations : {affiliations.count()}", heading_style))
            story.append(Spacer(1, 0.2*cm))
            for membre in affiliations:
                story.append(Paragraph(
                    f"{membre.nom_complet} — affilié(e) le {membre.date_affiliation.strftime('%d/%m/%Y')}",
                    normal_style,
                ))

        # Events section
        story.append(Paragraph(f"Événements ({evenements.count()})", heading_style))
        
        if evenements.exists():
            # Create events table
            table_data = [
                ['#', 'Titre', 'Date', 'Lieu', 'Responsable']
            ]
            
            for i, event in enumerate(evenements, 1):
                table_data.append([
                    str(i),
                    event.titre,
                    event.date.strftime('%d/%m/%Y %H:%M'),
                    event.lieu,
                    event.responsable.nom_complet if event.responsable else '-'
                ])
            
            table = Table(table_data, colWidths=[1.5*cm, 4*cm, 4*cm, 4*cm, 4*cm])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            story.append(table)
        else:
            story.append(Paragraph("Aucun événement ne correspond aux critères.", normal_style))
        
        # Build PDF
        doc.build(story)
        
        # Save PDF to model
        pdf_content = buffer.getvalue()
        buffer.close()
        
        filename = f"rapport_{rapport.id}_{rapport.dateGeneration.strftime('%Y%m%d_%H%M%S')}.pdf"
        rapport.fichier.save(filename, ContentFile(pdf_content))
        rapport.statut = 'TERMINE'
        rapport.save()
        
        # Send notification email
        if rapport.genere_par and rapport.genere_par.email:
            send_mail(
                f"Rapport '{rapport.titre}' disponible",
                f"""
                Bonjour {rapport.genere_par.nom_complet},
                
                Votre rapport "{rapport.titre}" est maintenant disponible.
                
                Vous pouvez le télécharger depuis la plateforme SYGMEBEC.
                
                Cordialement,
                L'équipe SYGMEBEC
                """,
                settings.DEFAULT_FROM_EMAIL,
                [rapport.genere_par.email],
                fail_silently=True
            )
        
        logger.info(f"Rapport {rapport_id} généré avec succès.")
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération du rapport {rapport_id}: {str(e)}")
        try:
            rapport = Rapport.objects.get(id=rapport_id)
            rapport.statut = 'ERREUR'
            rapport.error_message = str(e)
            rapport.save()
        except Rapport.DoesNotExist:
            pass
