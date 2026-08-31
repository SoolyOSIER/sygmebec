"""Password validators shared by every SYGMEBEC account flow."""

from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class StrongPasswordValidator:
    """Require the composition rules used by the application password policy.

    Django instantiates this class from ``AUTH_PASSWORD_VALIDATORS``.  Keeping
    the policy here means account creation, password changes and administrative
    resets all enforce exactly the same rules through ``validate_password``.
    """

    min_length = 12

    def validate(self, password, user=None):
        errors = []

        if len(password) < self.min_length:
            errors.append(
                ValidationError(
                    _("Le mot de passe doit contenir au moins %(min_length)d caractères."),
                    code="password_too_short",
                    params={"min_length": self.min_length},
                )
            )
        if not any(character.isupper() for character in password):
            errors.append(
                ValidationError(
                    _("Le mot de passe doit contenir au moins une lettre majuscule."),
                    code="password_no_upper",
                )
            )
        if not any(character.islower() for character in password):
            errors.append(
                ValidationError(
                    _("Le mot de passe doit contenir au moins une lettre minuscule."),
                    code="password_no_lower",
                )
            )
        if not any(character.isdigit() for character in password):
            errors.append(
                ValidationError(
                    _("Le mot de passe doit contenir au moins un chiffre."),
                    code="password_no_digit",
                )
            )
        if not any(
            not character.isalnum() and not character.isspace()
            for character in password
        ):
            errors.append(
                ValidationError(
                    _("Le mot de passe doit contenir au moins un caractère spécial."),
                    code="password_no_special",
                )
            )

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Votre mot de passe doit contenir au moins 12 caractères, "
            "une majuscule, une minuscule, un chiffre et un caractère spécial."
        )
