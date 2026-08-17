from django.db import models
from sygmebec_backend.apps.core.models import TimeStampedModel
from django.utils import timezone

class Statut(models.Model):
    """Statut model - corresponds to Statut in class diagram."""
    libelle = models.CharField(max_length=50, unique=True)
    
    class Meta:
        db_table = 'statut'
        verbose_name = 'Statut'
        verbose_name_plural = 'Statuts'
        ordering = ['libelle']
    
    def __str__(self):
        return self.libelle

class Membre(TimeStampedModel):
    """Membre model - corresponds to Membre in class diagram."""
    SEXE_MALE = 'MALE'
    SEXE_FEMELLE = 'FEMELLE'
    SEXE_CHOICES = [
        (SEXE_MALE, 'Masculin'),
        (SEXE_FEMELLE, 'Femelle'),
    ]

    ETAT_CELIBATAIRE = 'CELIBATAIRE'
    ETAT_MARIE = 'MARIE'
    ETAT_SEPARE = 'SEPARE'
    ETAT_DIVORCE = 'DIVORCE'
    ETAT_VEUF = 'VEUF'
    ETAT_MATRIMONIAL_CHOICES = [
        (ETAT_CELIBATAIRE, 'Celibataire'),
        (ETAT_MARIE, 'Marie(e)'),
        (ETAT_SEPARE, 'Separe(e)'),
        (ETAT_DIVORCE, 'Divorce(e)'),
        (ETAT_VEUF, 'Veuf(ve)'),
    ]

    nom = models.CharField(max_length=150)
    prenom = models.CharField(max_length=150, blank=True)
    telephone = models.CharField(max_length=30, blank=True)
    telephone_secondaire = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    eglise_origine = models.CharField(max_length=180, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    date_adhesion = models.DateField(auto_now_add=True)
    # Dates importantes dans le parcours spirituel du membre.
    date_presentation = models.DateField(null=True, blank=True)
    date_conversion = models.DateField(null=True, blank=True)
    date_affiliation = models.DateField(null=True, blank=True)
    date_bapteme = models.DateField(null=True, blank=True)
    sexe = models.CharField(max_length=20, choices=SEXE_CHOICES, blank=True)
    etat_matrimonial = models.CharField(max_length=20, choices=ETAT_MATRIMONIAL_CHOICES, blank=True)
    actuellement_employe = models.BooleanField(default=False)
    actuellement_etudiant = models.BooleanField(default=False)
    anciennete_ebec = models.CharField(max_length=120, blank=True)
    membre_petit_groupe = models.BooleanField(default=False)
    signature_membre = models.CharField(max_length=150, blank=True)
    date_signature = models.DateField(null=True, blank=True)
    dans_ecole_dimanche = models.BooleanField(default=False)
    classe_ecole_dimanche = models.CharField(max_length=120, blank=True)
    photo = models.ImageField(upload_to='membres/photos/', blank=True, null=True)
    
    statut = models.ForeignKey(
        Statut,
        on_delete=models.PROTECT,
        related_name='membres'
    )

    fonctions = models.ManyToManyField(
        'Fonction',
        through='MembreFonction',
        related_name='membres',
        blank=True
    )
    
    class Meta:
        db_table = 'membre'
        verbose_name = 'Membre'
        verbose_name_plural = 'Membres'
        ordering = ['nom', 'prenom']
    
    def __str__(self):
        return f"{self.nom} {self.prenom}".strip()
    
    @property
    def nom_complet(self):
        return f"{self.nom} {self.prenom}".strip()
    
    @property
    def age(self):
        if not self.date_naissance:
            return None
        today = timezone.now().date()
        return today.year - self.date_naissance.year - (
            (today.month, today.day) < (self.date_naissance.month, self.date_naissance.day)
        )

class HistoriqueStatut(models.Model):
    """HistoriqueStatut model - corresponds to HistoriqueStatut in class diagram."""
    membre = models.ForeignKey(
        Membre,
        on_delete=models.CASCADE,
        related_name='historiques_statut'
    )
    ancien_statut = models.CharField(max_length=50)
    nouveau_statut = models.CharField(max_length=50)
    date_changement = models.DateTimeField(auto_now_add=True)
    modifie_par = models.ForeignKey(
        'accounts.Utilisateur',
        on_delete=models.SET_NULL,
        null=True,
        related_name='statut_changements'
    )
    
    class Meta:
        db_table = 'historique_statut'
        verbose_name = 'Historique de statut'
        verbose_name_plural = 'Historiques de statut'
        ordering = ['-date_changement']
    
    def __str__(self):
        return f"{self.membre} : {self.ancien_statut} → {self.nouveau_statut} ({self.date_changement})"

class Fonction(models.Model):
    """Fonction model - corresponds to Fonction in class diagram."""
    nomFonction = models.CharField(max_length=100)
    dateDebut = models.DateField()
    dateFin = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'fonction'
        verbose_name = 'Fonction'
        verbose_name_plural = 'Fonctions'
        ordering = ['nomFonction']
    
    def __str__(self):
        return self.nomFonction
    
    @property
    def est_active(self):
        if not self.dateFin:
            return True
        return self.dateFin >= timezone.now().date()

class MembreFonction(models.Model):
    """Intermediate model for Membre-Fonction many-to-many relationship."""
    membre = models.ForeignKey(Membre, on_delete=models.CASCADE, related_name='membre_fonctions')
    fonction = models.ForeignKey(Fonction, on_delete=models.CASCADE, related_name='membre_fonctions')
    date_assignation = models.DateField(auto_now_add=True)
    
    class Meta:
        db_table = 'membre_fonction'
        unique_together = ('membre', 'fonction')
    
    def __str__(self):
        return f"{self.membre} - {self.fonction}"
