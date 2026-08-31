from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

@shared_task
def send_welcome_email(user_id):
    from .models import Utilisateur
    try:
        user = Utilisateur.objects.get(id=user_id)
        subject = 'Bienvenue sur SYGMEBEC'
        message = f'''
        Bonjour {user.identifiant},
        
        Votre compte a été créé avec succès sur la plateforme SYGMEBEC.
        
        Identifiant : {user.identifiant}
        Rôle : {user.role_acces.nomRole if user.role_acces else 'Non défini'}
        
        Veuillez contacter l'administrateur pour obtenir votre mot de passe.
        
        Cordialement,
        L'équipe SYGMEBEC
        '''
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.identifiant])
    except Utilisateur.DoesNotExist:
        pass

@shared_task
def send_password_reset_email(user_id):
    from .models import Utilisateur
    try:
        user = Utilisateur.objects.get(id=user_id)
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # In production, use frontend URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
        
        subject = 'Réinitialisation de votre mot de passe'
        message = f'''
        Bonjour {user.identifiant},
        
        Vous avez demandé la réinitialisation de votre mot de passe.
        
        Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :
        {reset_url}
        
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        
        Cordialement,
        L'équipe SYGMEBEC
        '''
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.identifiant])
    except Utilisateur.DoesNotExist:
        pass