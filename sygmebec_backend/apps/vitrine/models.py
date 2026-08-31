from django.db import models

from sygmebec_backend.apps.core.models import TimeStampedModel


class DemandeAdhesion(TimeStampedModel):
    EN_ATTENTE = 'EN_ATTENTE'
    VALIDEE = 'VALIDEE'
    REJETEE = 'REJETEE'
    STATUT_CHOICES = [
        (EN_ATTENTE, 'En attente'),
        (VALIDEE, 'Validée'),
        (REJETEE, 'Rejetée'),
    ]
    NIVEAU_ETUDE_PRIMAIRE = 'PRIMAIRE'
    NIVEAU_ETUDE_SECONDAIRE = 'SECONDAIRE'
    NIVEAU_ETUDE_UNIVERSITAIRE = 'UNIVERSITAIRE'
    NIVEAU_ETUDE_PROFESSIONNEL = 'PROFESSIONNEL'
    NIVEAU_ETUDE_AUTRE = 'AUTRE'
    NIVEAU_ETUDE_CHOICES = [
        (NIVEAU_ETUDE_PRIMAIRE, 'Primaire'),
        (NIVEAU_ETUDE_SECONDAIRE, 'Secondaire'),
        (NIVEAU_ETUDE_UNIVERSITAIRE, 'Universitaire'),
        (NIVEAU_ETUDE_PROFESSIONNEL, 'Professionnel'),
        (NIVEAU_ETUDE_AUTRE, 'Autre'),
    ]

    nom = models.CharField(max_length=150)
    prenom = models.CharField(max_length=150)
    email = models.EmailField()
    telephone = models.CharField(max_length=30, blank=True)
    telephone_secondaire = models.CharField(max_length=30, blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    zone_habitation = models.CharField(max_length=120, blank=True)
    eglise_origine = models.CharField(max_length=180, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    sexe = models.CharField(max_length=20, blank=True)
    etat_matrimonial = models.CharField(max_length=20, blank=True)
    niveau_etude = models.CharField(max_length=20, choices=NIVEAU_ETUDE_CHOICES, blank=True)
    profession = models.CharField(max_length=120, blank=True)
    actuellement_employe = models.BooleanField(default=False)
    actuellement_etudiant = models.BooleanField(default=False)
    anciennete_ebec = models.CharField(max_length=120, blank=True)
    membre_petit_groupe = models.BooleanField(default=False)
    dans_ecole_dimanche = models.BooleanField(default=False)
    classe_ecole_dimanche = models.CharField(max_length=120, blank=True)
    date_presentation = models.DateField(null=True, blank=True)
    date_conversion = models.DateField(null=True, blank=True)
    date_affiliation = models.DateField(null=True, blank=True)
    date_bapteme = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='demandes-adhesion/photos/', blank=True, null=True)
    message = models.TextField(blank=True)
    date_demande = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default=EN_ATTENTE)
    motif_rejet = models.CharField(max_length=255, blank=True)
    membre_cree = models.OneToOneField(
        'members.Membre',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demande_origine',
    )
    traite_par = models.ForeignKey(
        'accounts.Utilisateur',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='demandes_adhesion_traitees',
    )

    class Meta:
        ordering = ['-date_demande']
        verbose_name = "Demande d'adhésion"
        verbose_name_plural = "Demandes d'adhésion"

    def __str__(self):
        return f'{self.nom} {self.prenom} ({self.get_statut_display()})'


class InscriptionEvenement(TimeStampedModel):
    evenement = models.ForeignKey('events.Evenement', on_delete=models.CASCADE, related_name='inscriptions')
    nom = models.CharField(max_length=150)
    prenom = models.CharField(max_length=150)
    email = models.EmailField()
    telephone = models.CharField(max_length=30, blank=True)
    nombre_places = models.PositiveIntegerField(default=1)
    date_inscription = models.DateTimeField(auto_now_add=True)
    membre = models.ForeignKey(
        'members.Membre',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inscriptions_evenements',
    )

    class Meta:
        ordering = ['-date_inscription']
        verbose_name = "Inscription à un événement"
        verbose_name_plural = "Inscriptions aux événements"

    def __str__(self):
        return f'{self.nom} {self.prenom} — {self.evenement}'


class MessageContact(TimeStampedModel):
    nom = models.CharField(max_length=150)
    email = models.EmailField()
    sujet = models.CharField(max_length=200)
    message = models.TextField()
    date_envoi = models.DateTimeField(auto_now_add=True)
    traite = models.BooleanField(default=False)

    class Meta:
        ordering = ['-date_envoi']
        verbose_name = 'Message de contact'
        verbose_name_plural = 'Messages de contact'

    def __str__(self):
        return f'{self.nom} — {self.sujet}'


class ImageGalerie(TimeStampedModel):
    titre = models.CharField(max_length=150, blank=True)
    image = models.ImageField(upload_to='galerie/')
    evenement = models.ForeignKey(
        'events.Evenement',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='photos',
    )
    ordre = models.PositiveIntegerField(default=0)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['ordre', '-date_ajout']
        verbose_name = 'Image de galerie'
        verbose_name_plural = 'Images de galerie'

    def __str__(self):
        return self.titre or f'Image {self.pk}'
