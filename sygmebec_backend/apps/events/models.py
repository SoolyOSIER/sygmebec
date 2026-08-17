from django.db import models
from sygmebec_backend.apps.core.models import TimeStampedModel


class TypeEvenement(TimeStampedModel):
    """Type libre, administrable depuis le tableau de bord (mariage, baptême…)."""

    nom = models.CharField(max_length=100, unique=True)
    actif = models.BooleanField(default=True)

    class Meta:
        db_table = 'type_evenement'
        verbose_name = "Type d'événement"
        verbose_name_plural = "Types d'événements"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Evenement(TimeStampedModel):
    """Evenement model - corresponds to Evenement in class diagram."""
    CATEGORIE_CULTE = 'CULTE'
    CATEGORIE_PRIERE = 'PRIERE'
    CATEGORIE_FORMATION = 'FORMATION'
    CATEGORIE_JEUNESSE = 'JEUNESSE'
    CATEGORIE_CONFERENCE = 'CONFERENCE'
    CATEGORIE_SOCIAL = 'SOCIAL'
    CATEGORIE_AUTRE = 'AUTRE'
    CATEGORIE_CHOICES = [
        (CATEGORIE_CULTE, 'Culte'),
        (CATEGORIE_PRIERE, 'Reunion de priere'),
        (CATEGORIE_FORMATION, 'Formation'),
        (CATEGORIE_JEUNESSE, 'Jeunesse'),
        (CATEGORIE_CONFERENCE, 'Conference'),
        (CATEGORIE_SOCIAL, 'Activite sociale'),
        (CATEGORIE_AUTRE, 'Autre'),
    ]

    titre = models.CharField(max_length=200)
    categorie = models.CharField(max_length=30, choices=CATEGORIE_CHOICES, default=CATEGORIE_CULTE)
    date = models.DateTimeField()
    lieu = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    dateCreation = models.DateTimeField(auto_now_add=True)
    est_public = models.BooleanField(default=False)
    image = models.ImageField(upload_to='evenements/', null=True, blank=True)
    capacite = models.PositiveIntegerField(null=True, blank=True)
    type_evenement = models.ForeignKey(
        TypeEvenement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evenements',
    )
    
    responsable = models.ForeignKey(
        'members.Membre',
        on_delete=models.SET_NULL,
        null=True,
        related_name='evenements_responsable'
    )
    
    class Meta:
        db_table = 'evenement'
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
        ordering = ['date']
    
    def __str__(self):
        return self.titre
    
    @property
    def est_passe(self):
        from django.utils import timezone
        return self.date < timezone.now()
    
    @property
    def est_aujourdhui(self):
        from django.utils import timezone
        today = timezone.now().date()
        return self.date.date() == today
