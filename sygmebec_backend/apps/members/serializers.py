from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import Membre, Statut, Fonction, HistoriqueStatut, MembreFonction

class StatutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statut
        fields = ['id', 'libelle']


class FonctionSerializer(serializers.ModelSerializer):
    est_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Fonction
        fields = ['id', 'nomFonction', 'dateDebut', 'dateFin', 'est_active']
        extra_kwargs = {
            'dateDebut': {'required': False},
            'dateFin': {'required': False},
        }

    def create(self, validated_data):
        """A function entered from a member sheet starts today by default."""
        validated_data.setdefault('dateDebut', timezone.localdate())
        return super().create(validated_data)


class MembreFonctionSerializer(serializers.ModelSerializer):
    fonction = FonctionSerializer(read_only=True)
    fonction_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MembreFonction
        fields = ['id', 'fonction', 'fonction_id', 'date_assignation']


class HistoriqueStatutSerializer(serializers.ModelSerializer):
    modifie_par_nom = serializers.CharField(source='modifie_par.identifiant', read_only=True)
    
    class Meta:
        model = HistoriqueStatut
        fields = [
            'id', 'ancien_statut', 'nouveau_statut',
            'date_changement', 'modifie_par', 'modifie_par_nom'
        ]


class MembreSimpleSerializer(serializers.ModelSerializer):
    statut = StatutSerializer(read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    
    class Meta:
        model = Membre
        fields = ['id', 'nom', 'prenom', 'nom_complet', 'statut', 'photo', 'email', 'telephone']


class MembreListSerializer(serializers.ModelSerializer):
    statut = StatutSerializer(read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    fonctions = serializers.StringRelatedField(many=True)
    deleted_by_nom = serializers.CharField(source='deleted_by.identifiant', read_only=True)
    
    class Meta:
        model = Membre
        fields = [
            'id', 'nom', 'prenom', 'nom_complet', 'statut',
            'telephone', 'telephone_secondaire', 'email', 'adresse', 'zone_habitation',
            'eglise_origine', 'sexe', 'etat_matrimonial', 'niveau_etude', 'profession',
            'date_adhesion', 'date_presentation', 'date_conversion', 'date_affiliation', 'date_bapteme',
            'actuellement_employe', 'actuellement_etudiant', 'anciennete_ebec',
            'signature_membre', 'date_signature', 'membre_petit_groupe', 'dans_ecole_dimanche',
            'classe_ecole_dimanche', 'photo', 'fonctions',
            'deleted_at', 'deleted_by_nom'
        ]


class MembreDetailSerializer(serializers.ModelSerializer):
    statut = StatutSerializer(read_only=True)
    nom_complet = serializers.CharField(read_only=True)
    age = serializers.IntegerField(read_only=True)
    fonctions = FonctionSerializer(many=True, read_only=True)
    historiques_statut = HistoriqueStatutSerializer(many=True, read_only=True)
    
    class Meta:
        model = Membre
        fields = [
            'id', 'nom', 'prenom', 'nom_complet', 'statut',
            'telephone', 'telephone_secondaire', 'email', 'adresse', 'zone_habitation',
            'eglise_origine', 'date_naissance', 'sexe', 'etat_matrimonial', 'niveau_etude', 'profession',
            'date_presentation', 'date_conversion', 'date_affiliation', 'date_bapteme',
            'actuellement_employe', 'anciennete_ebec',
            'actuellement_etudiant', 'signature_membre', 'date_signature',
            'membre_petit_groupe', 'dans_ecole_dimanche', 'classe_ecole_dimanche', 'photo',
            'age', 'date_adhesion', 'created_at', 'updated_at',
            'fonctions', 'historiques_statut'
        ]


class MembreCreateUpdateSerializer(serializers.ModelSerializer):
    statut_id = serializers.IntegerField(write_only=True)
    fonctions_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    class Meta:
        model = Membre
        fields = [
            'id', 'nom', 'prenom', 'telephone', 'telephone_secondaire',
            'email', 'adresse', 'zone_habitation', 'eglise_origine', 'date_naissance',
            'sexe', 'etat_matrimonial', 'niveau_etude', 'profession',
            'date_presentation', 'date_conversion', 'date_affiliation', 'date_bapteme',
            'actuellement_employe', 'actuellement_etudiant', 'signature_membre', 'date_signature',
            'anciennete_ebec', 'membre_petit_groupe', 'dans_ecole_dimanche', 'classe_ecole_dimanche',
            'photo',
            'statut_id', 'fonctions_ids'
        ]

    def validate(self, attrs):
        queryset = Membre.objects.all()
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        email = (attrs.get('email') or getattr(self.instance, 'email', '') or '').strip()
        telephone = (attrs.get('telephone') or getattr(self.instance, 'telephone', '') or '').strip()
        nom = (attrs.get('nom') or getattr(self.instance, 'nom', '') or '').strip()
        prenom = (attrs.get('prenom') or getattr(self.instance, 'prenom', '') or '').strip()
        date_naissance = attrs.get('date_naissance') or getattr(self.instance, 'date_naissance', None)

        if email and queryset.filter(email__iexact=email).exists():
            raise serializers.ValidationError({'email': 'Un membre existe deja avec cette adresse courriel.'})

        if telephone and queryset.filter(telephone=telephone).exists():
            raise serializers.ValidationError({'telephone': 'Un membre existe deja avec ce numero de telephone.'})

        if nom and prenom and date_naissance and queryset.filter(
            nom__iexact=nom,
            prenom__iexact=prenom,
            date_naissance=date_naissance,
        ).exists():
            raise serializers.ValidationError(
                'Ce membre semble deja enregistre avec le meme nom, prenom et date de naissance.'
            )

        return attrs
    
    def validate_statut_id(self, value):
        try:
            Statut.objects.get(id=value)
        except Statut.DoesNotExist:
            raise serializers.ValidationError('Statut invalide.')
        return value
    
    def validate_fonctions_ids(self, value):
        if value:
            existing = set(Fonction.objects.filter(id__in=value).values_list('id', flat=True))
            missing = set(value) - existing
            if missing:
                raise serializers.ValidationError(f'Fonctions invalides: {missing}')
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        statut_id = validated_data.pop('statut_id')
        fonctions_ids = validated_data.pop('fonctions_ids', [])
        
        statut = Statut.objects.get(id=statut_id)
        membre = Membre.objects.create(statut=statut, **validated_data)
        
        for fonction_id in fonctions_ids:
            fonction = Fonction.objects.get(id=fonction_id)
            MembreFonction.objects.create(membre=membre, fonction=fonction)
        
        # Create initial history entry
        HistoriqueStatut.objects.create(
            membre=membre,
            ancien_statut='Nouveau membre',
            nouveau_statut=statut.libelle,
            modifie_par=self.context.get('request').user if self.context.get('request') else None
        )
        
        return membre
    
    @transaction.atomic
    def update(self, instance, validated_data):
        statut_id = validated_data.pop('statut_id', None)
        fonctions_ids = validated_data.pop('fonctions_ids', None)
        
        if statut_id:
            old_statut = instance.statut.libelle
            new_statut = Statut.objects.get(id=statut_id)
            instance.statut = new_statut
            
            # Create history entry
            HistoriqueStatut.objects.create(
                membre=instance,
                ancien_statut=old_statut,
                nouveau_statut=new_statut.libelle,
                modifie_par=self.context.get('request').user if self.context.get('request') else None
            )
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if fonctions_ids is not None:
            # Clear existing functions and add new ones
            instance.membre_fonctions.all().delete()
            for fonction_id in fonctions_ids:
                fonction = Fonction.objects.get(id=fonction_id)
                MembreFonction.objects.create(membre=instance, fonction=fonction)
        
        return instance


class ChangerStatutSerializer(serializers.Serializer):
    nouveau_statut_id = serializers.IntegerField(required=True)
    commentaire = serializers.CharField(required=False, allow_blank=True)
    
    def validate_nouveau_statut_id(self, value):
        try:
            Statut.objects.get(id=value)
        except Statut.DoesNotExist:
            raise serializers.ValidationError('Statut invalide.')
        return value
