from django.db import transaction

from sygmebec_backend.apps.members.models import HistoriqueStatut, Membre, Statut

from .models import DemandeAdhesion


@transaction.atomic
def valider_demande_adhesion(demande, traite_par):
    """Transforme une demande publique en fiche membre, une seule fois."""
    demande = DemandeAdhesion.objects.select_for_update().get(pk=demande.pk)

    if demande.statut != DemandeAdhesion.EN_ATTENTE:
        raise ValueError('Cette demande a déjà été traitée.')

    if demande.email and Membre.objects.filter(email__iexact=demande.email).exists():
        raise ValueError('Un membre existe déjà avec cette adresse e-mail.')

    statut, _ = Statut.objects.get_or_create(libelle='Nouveau converti')
    membre = Membre.objects.create(
        nom=demande.nom,
        prenom=demande.prenom,
        email=demande.email,
        telephone=demande.telephone,
        telephone_secondaire=demande.telephone_secondaire,
        adresse=demande.adresse,
        eglise_origine=demande.eglise_origine,
        date_naissance=demande.date_naissance,
        sexe=demande.sexe,
        etat_matrimonial=demande.etat_matrimonial,
        actuellement_employe=demande.actuellement_employe,
        actuellement_etudiant=demande.actuellement_etudiant,
        anciennete_ebec=demande.anciennete_ebec,
        membre_petit_groupe=demande.membre_petit_groupe,
        dans_ecole_dimanche=demande.dans_ecole_dimanche,
        classe_ecole_dimanche=demande.classe_ecole_dimanche,
        date_presentation=demande.date_presentation,
        date_conversion=demande.date_conversion,
        date_affiliation=demande.date_affiliation,
        date_bapteme=demande.date_bapteme,
        photo=demande.photo,
        statut=statut,
    )
    HistoriqueStatut.objects.create(
        membre=membre,
        ancien_statut='Demande d’adhésion',
        nouveau_statut=statut.libelle,
        modifie_par=traite_par,
    )

    demande.statut = DemandeAdhesion.VALIDEE
    demande.membre_cree = membre
    demande.traite_par = traite_par
    demande.save(update_fields=['statut', 'membre_cree', 'traite_par', 'updated_at'])

    return demande
