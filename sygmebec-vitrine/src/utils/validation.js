const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidPhone = (value) => {
  // Accepte les formats usuels : +509 1234-5678, (509) 1234 5678, 12345678.
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

export function validateAdhesionForm(values) {
  const errors = {}

  if (!values.nom || values.nom.trim().length < 2) {
    errors.nom = 'Le nom est requis avec au moins 2 caractères.'
  }

  if (!values.prenom || values.prenom.trim().length < 2) {
    errors.prenom = 'Le prénom est requis avec au moins 2 caractères.'
  }

  if (!values.email || !emailRegex.test(values.email.trim())) {
    errors.email = 'Une adresse email valide est requise.'
  }

  if (!values.telephone || !isValidPhone(values.telephone)) {
    errors.telephone = 'Un numéro de téléphone valide est requis.'
  }

  if (values.message && values.message.trim().length < 10) {
    errors.message = 'Le message est trop court.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

export function validateContactForm(values) {
  const errors = {}

  if (!values.nom || values.nom.trim().length < 2) {
    errors.nom = 'Le nom est requis.'
  }

  if (!values.prenom || values.prenom.trim().length < 2) {
    errors.prenom = 'Le prénom est requis.'
  }

  if (!values.email || !emailRegex.test(values.email.trim())) {
    errors.email = 'Une adresse email valide est requise.'
  }

  if (values.telephone && !isValidPhone(values.telephone)) {
    errors.telephone = 'Le téléphone doit être valide.'
  }

  if (!values.sujet || values.sujet.trim().length < 3) {
    errors.sujet = 'Le sujet est requis.'
  }

  if (!values.message || values.message.trim().length < 10) {
    errors.message = 'Le message doit contenir au moins 10 caractères.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}

export function validateLoginForm(values) {
  const errors = {}

  if (!values.identifiant || values.identifiant.trim().length < 3) {
    errors.identifiant = 'L’identifiant ou l’email est requis.'
  }

  if (!values.mot_de_passe || values.mot_de_passe.length < 4) {
    errors.mot_de_passe = 'Le mot de passe doit contenir au moins 4 caractères.'
  }

  return { isValid: Object.keys(errors).length === 0, errors }
}
