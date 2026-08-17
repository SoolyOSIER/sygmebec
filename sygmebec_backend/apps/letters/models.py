from django.db import models

from sygmebec_backend.apps.core.models import TimeStampedModel


class Lettre(TimeStampedModel):
    RECOMMANDATION = 'RECOMMANDATION'
    TRANSFERT = 'TRANSFERT'
    TYPE_CHOICES = [
        (RECOMMANDATION, 'Lettre de recommandation'),
        (TRANSFERT, 'Lettre de transfert'),
    ]

    type_lettre = models.CharField(max_length=20, choices=TYPE_CHOICES)
    membre = models.ForeignKey('members.Membre', on_delete=models.PROTECT, related_name='lettres')
    destinataire = models.CharField(max_length=200, blank=True)
    objet = models.CharField(max_length=220)
    contenu = models.TextField(blank=True)
    date_emission = models.DateField()
    reference = models.CharField(max_length=40, unique=True, blank=True)
    cree_par = models.ForeignKey('accounts.Utilisateur', on_delete=models.SET_NULL, null=True, related_name='lettres_creees')
    fichier = models.FileField(upload_to='lettres/', null=True, blank=True)

    class Meta:
        db_table = 'lettre'
        ordering = ['-date_emission', '-id']
        verbose_name = 'Lettre'
        verbose_name_plural = 'Lettres'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.reference:
            self.reference = f'EBEC-{self.date_emission:%Y}-{self.id:04d}'
            type(self).objects.filter(pk=self.pk).update(reference=self.reference)

    def __str__(self):
        return f'{self.get_type_lettre_display()} — {self.membre.nom_complet}'
