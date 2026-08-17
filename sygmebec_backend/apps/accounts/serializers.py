from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Utilisateur, RoleAcces
from sygmebec_backend.apps.members.serializers import MembreSimpleSerializer
from sygmebec_backend.apps.members.models import Membre, Statut

class RoleAccesSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleAcces
        fields = ['id', 'nomRole']


class UtilisateurSerializer(serializers.ModelSerializer):
    role_acces = RoleAccesSerializer(read_only=True)
    membre = MembreSimpleSerializer(read_only=True)
    role_nom = serializers.CharField(source='role_acces.nomRole', read_only=True)
    
    class Meta:
        model = Utilisateur
        fields = [
            'id', 'identifiant', 'role_acces', 'role_nom',
            'telephone', 'membre', 'date_creation_compte', 'dernier_acces',
            'is_active', 'is_staff'
        ]
        read_only_fields = ['date_creation_compte', 'dernier_acces']


class MonProfilMembreSerializer(serializers.ModelSerializer):
    """Fields a signed-in user is allowed to update on their own member profile."""
    class Meta:
        model = Membre
        fields = [
            'id', 'nom', 'prenom', 'email', 'telephone', 'telephone_secondaire',
            'adresse', 'date_naissance', 'photo'
        ]
        read_only_fields = ['id']

    def validate_photo(self, photo):
        if photo and photo.size > 20 * 1024 * 1024:
            raise serializers.ValidationError('La photo ne doit pas dépasser 20 Mo.')
        return photo


class UtilisateurCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    membre_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    nom_complet = serializers.CharField(write_only=True, required=False, allow_blank=True)
    email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Utilisateur
        fields = [
            'identifiant', 'telephone', 'nom_complet', 'email', 'password', 'password_confirm',
            'role_id', 'membre_id', 'is_active'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})
        
        if data.get('role_id') is not None:
            try:
                RoleAcces.objects.get(id=data['role_id'])
            except RoleAcces.DoesNotExist:
                raise serializers.ValidationError({'role_id': 'Rôle invalide.'})
        
        if data.get('membre_id'):
            from sygmebec_backend.apps.members.models import Membre
            try:
                membre = Membre.objects.get(id=data['membre_id'])
            except Membre.DoesNotExist:
                raise serializers.ValidationError({'membre_id': 'Membre invalide.'})
            if Utilisateur.objects.filter(membre=membre).exists():
                raise serializers.ValidationError({'membre_id': 'Ce membre est deja associe a un compte.'})
        
        return data
    
    def create(self, validated_data):
        role_id = validated_data.pop('role_id', None)
        membre_id = validated_data.pop('membre_id', None)
        nom_complet = validated_data.pop('nom_complet', '').strip()
        email = validated_data.pop('email', '').strip()
        
        validated_data.pop('password_confirm')
        
        user = Utilisateur(
            identifiant=validated_data['identifiant'],
            telephone=validated_data.get('telephone', ''),
            is_active=validated_data.get('is_active', True),
            role_acces=RoleAcces.objects.get(id=role_id) if role_id else None,
        )
        user.set_password(validated_data['password'])
        
        if membre_id:
            user.membre = Membre.objects.get(id=membre_id)
        elif nom_complet:
            parties = nom_complet.split()
            statut, _ = Statut.objects.get_or_create(libelle='Actif')
            user.membre = Membre.objects.create(
                nom=parties[-1],
                prenom=' '.join(parties[:-1]),
                email=email,
                telephone=user.telephone,
                statut=statut,
            )
        
        user.save()
        return user


class UtilisateurRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    nom = serializers.CharField(required=True)
    prenom = serializers.CharField(required=True)
    sexe = serializers.ChoiceField(choices=[('MALE', 'Masculin'), ('FEMELLE', 'Femelle')], required=True)
    date_naissance = serializers.DateField(required=True)
    telephone = serializers.CharField(required=True, allow_blank=False)
    email = serializers.EmailField(required=True)
    adresse = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = Utilisateur
        fields = [
            'nom', 'prenom', 'sexe', 'date_naissance', 'telephone', 'email', 'adresse',
            'identifiant', 'password', 'password_confirm'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})

        if Utilisateur.objects.filter(identifiant=data['identifiant']).exists():
            raise serializers.ValidationError({'identifiant': 'Ce nom d\'utilisateur est déjà utilisé.'})

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        nom = validated_data.pop('nom')
        prenom = validated_data.pop('prenom')
        sexe = validated_data.pop('sexe')
        date_naissance = validated_data.pop('date_naissance')
        telephone = validated_data.pop('telephone')
        email = validated_data.pop('email')
        adresse = validated_data.pop('adresse')

        from sygmebec_backend.apps.members.models import Membre, Statut

        statut, _ = Statut.objects.get_or_create(libelle='En attente')

        membre = Membre.objects.create(
            nom=nom,
            prenom=prenom,
            sexe=sexe,
            date_naissance=date_naissance,
            telephone=telephone,
            email=email,
            adresse=adresse,
            statut=statut,
        )

        user = Utilisateur(
            identifiant=validated_data['identifiant'],
            telephone=telephone,
            is_active=False,
            role_acces=None,
            membre=membre,
        )
        user.set_password(password)
        user.save()

        return user


class UtilisateurUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False)
    role_id = serializers.IntegerField(write_only=True, required=False)
    membre_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Utilisateur
        fields = ['identifiant', 'telephone', 'password', 'password_confirm', 'role_id', 'membre_id', 'is_active']

    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')

        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})

        if data.get('role_id'):
            try:
                RoleAcces.objects.get(id=data['role_id'])
            except RoleAcces.DoesNotExist:
                raise serializers.ValidationError({'role_id': 'Role invalide.'})

        if data.get('membre_id'):
            from sygmebec_backend.apps.members.models import Membre
            try:
                membre = Membre.objects.get(id=data['membre_id'])
            except Membre.DoesNotExist:
                raise serializers.ValidationError({'membre_id': 'Membre invalide.'})
            if Utilisateur.objects.filter(membre=membre).exclude(pk=self.instance.pk).exists():
                raise serializers.ValidationError({'membre_id': 'Ce membre est deja associe a un autre compte.'})

        return data
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)

        if 'role_id' in validated_data:
            instance.role_acces = RoleAcces.objects.get(id=validated_data.pop('role_id'))
        
        if 'membre_id' in validated_data:
            membre_id = validated_data.pop('membre_id')
            if membre_id:
                from sygmebec_backend.apps.members.models import Membre
                instance.membre = Membre.objects.get(id=membre_id)
            else:
                instance.membre = None
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class ChangerMotDePasseSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'Les mots de passe ne correspondent pas.'})
        return data


class ChangerMonMotDePasseSerializer(ChangerMotDePasseSerializer):
    """Password change for the signed-in account, with current-password verification."""
    current_password = serializers.CharField(required=True, write_only=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Le mot de passe actuel est incorrect.')
        return value


class LoginSerializer(serializers.Serializer):
    identifiant = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
