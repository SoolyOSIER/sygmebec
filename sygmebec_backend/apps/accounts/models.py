from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

class RoleAcces(models.Model):
    """Role model - corresponds to RoleAcces in class diagram."""
    
    ROLE_CHOICES = [
        ('SECRETAIRE', 'Secrétaire'),
        ('PASTEUR', 'Pasteur'),
        ('ADMINISTRATEUR', 'Administrateur'),
    ]
    
    nomRole = models.CharField(max_length=30, unique=True, choices=ROLE_CHOICES)
    
    class Meta:
        db_table = 'role_acces'
        verbose_name = 'Rôle'
        verbose_name_plural = 'Rôles'
    
    def __str__(self):
        return self.nomRole
    
    def get_priority(self):
        """Return priority level for role hierarchy."""
        priorities = {'SECRETAIRE': 1, 'PASTEUR': 2, 'ADMINISTRATEUR': 3}
        return priorities.get(self.nomRole, 0)


class UtilisateurManager(BaseUserManager):
    """Custom user manager for Utilisateur model."""
    
    def create_user(self, identifiant, password=None, **extra_fields):
        if not identifiant:
            raise ValueError('L\'identifiant est obligatoire')
        
        user = self.model(identifiant=identifiant, **extra_fields)
        if password is not None:
            # The manager is also used by commands and server-side scripts, so
            # it must not provide a way around AUTH_PASSWORD_VALIDATORS.
            validate_password(password, user=user)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, identifiant, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        # Create or get ADMINISTRATEUR role
        role, _ = RoleAcces.objects.get_or_create(nomRole='ADMINISTRATEUR')
        extra_fields.setdefault('role_acces', role)
        
        return self.create_user(identifiant, password, **extra_fields)


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    """
    Utilisateur model - corresponds to Utilisateur in class diagram.
    Attributes: Idenetifiant, motDePasse, DateCreationCompte, dernierAcces
    """
    
    identifiant = models.CharField(max_length=150, unique=True)  # Idenetifiant
    telephone = models.CharField(max_length=30, blank=True)
    # motDePasse is handled by AbstractBaseUser (password field, hashed)
    date_creation_compte = models.DateTimeField(auto_now_add=True)  # DateCreationCompte
    dernier_acces = models.DateTimeField(null=True, blank=True)  # dernierAcces
    
    role_acces = models.ForeignKey(
        RoleAcces,
        on_delete=models.PROTECT,
        related_name='utilisateurs',
        null=True,
        blank=True,
    )
    
    membre = models.OneToOneField(
        'members.Membre',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='utilisateur'
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UtilisateurManager()
    
    USERNAME_FIELD = 'identifiant'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'utilisateur'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-date_creation_compte']
    
    def __str__(self):
        return self.identifiant
    
    def has_role(self, required_role):
        """Check if user has at least the required role level."""
        if not self.role_acces:
            return False
        return self.role_acces.get_priority() >= required_role.get_priority()
