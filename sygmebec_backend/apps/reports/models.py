from django.db import models
from sygmebec_backend.apps.core.models import TimeStampedModel

class CritereFiltrage(models.Model):
    """CritereFiltrage model - corresponds to CritereFiltrage in class diagram."""
    statut = models.CharField(max_length=50, blank=True)
    periode = models.CharField(max_length=100, blank=True)  # Format: "YYYY-MM:YYYY-MM"
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    fonction = models.CharField(max_length=100, blank=True)
    TYPE_MEMBRES = 'MEMBRES'
    TYPE_FUNERAILLE = 'FUNERAILLE'
    TYPE_MARIAGE = 'MARIAGE'
    TYPE_PRESENTATION_ENFANTS = 'PRESENTATION_ENFANTS'
    TYPE_PRESENTATION_TEMPLE = 'PRESENTATION_TEMPLE'
    TYPE_AFFILIATION = 'AFFILIATION'
    TYPE_BAPTEMES = 'BAPTEMES'
    TYPE_RAPPORT_CHOICES = [
        (TYPE_MEMBRES, 'Membres'),
        (TYPE_FUNERAILLE, 'Funérailles'),
        (TYPE_MARIAGE, 'Mariages'),
        (TYPE_PRESENTATION_ENFANTS, 'Présentation des enfants'),
        (TYPE_PRESENTATION_TEMPLE, 'Présentation au temple'),
        (TYPE_AFFILIATION, 'Affiliations'),
        (TYPE_BAPTEMES, 'Quantité baptisée'),
    ]
    type_rapport = models.CharField(max_length=30, choices=TYPE_RAPPORT_CHOICES, default=TYPE_MEMBRES)
    
    class Meta:
        db_table = 'critere_filtrage'
        verbose_name = 'Critère de filtrage'
        verbose_name_plural = 'Critères de filtrage'
    
    def __str__(self):
        parts = []
        if self.statut:
            parts.append(f"Statut: {self.statut}")
        if self.periode:
            parts.append(f"Période: {self.periode}")
        if self.fonction:
            parts.append(f"Fonction: {self.fonction}")
        return " | ".join(parts) if parts else "Aucun critère"

class Rapport(TimeStampedModel):
    """Rapport model - corresponds to Rapport in class diagram."""
    
    STATUS_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours de génération'),
        ('TERMINE', 'Terminé'),
        ('ERREUR', 'Erreur'),
    ]
    
    titre = models.CharField(max_length=200)
    dateGeneration = models.DateTimeField(auto_now_add=True)
    dateFin = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUS_CHOICES, default='EN_ATTENTE')
    
    genere_par = models.ForeignKey(
        'members.Membre',
        on_delete=models.SET_NULL,
        null=True,
        related_name='rapports'
    )
    
    critere = models.OneToOneField(
        CritereFiltrage,
        on_delete=models.CASCADE,
        related_name='rapport'
    )
    
    fichier = models.FileField(upload_to='rapports/', null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        db_table = 'rapport'
        verbose_name = 'Rapport'
        verbose_name_plural = 'Rapports'
        ordering = ['-dateGeneration']
    
    def __str__(self):
        return self.titre
    
    @property
    def est_termine(self):
        return self.statut == 'TERMINE'
    
    @property
    def est_en_erreur(self):
        return self.statut == 'ERREUR'
