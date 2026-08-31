// src/utils/validators.js
export const validators = {
  email: (value) => {
    if (!value) return "L'email est requis"
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!regex.test(value)) return "Email invalide"
    return null
  },

  required: (value, fieldName = 'Ce champ') => {
    if (!value || value.trim() === '') return `${fieldName} est requis`
    return null
  },

  minLength: (value, min, fieldName = 'Ce champ') => {
    if (value && value.length < min) {
      return `${fieldName} doit contenir au moins ${min} caractères`
    }
    return null
  },

  maxLength: (value, max, fieldName = 'Ce champ') => {
    if (value && value.length > max) {
      return `${fieldName} doit contenir au maximum ${max} caractères`
    }
    return null
  },

  phone: (value) => {
    if (!value) return null
    const regex = /^[0-9+\s\-()]{10,}$/
    if (!regex.test(value)) return "Numéro de téléphone invalide"
    return null
  },

  password: (value) => {
    if (!value) return "Le mot de passe est requis"
    if (value.length < 8) return "Le mot de passe doit contenir au moins 8 caractères"
    if (!/[A-Z]/.test(value)) return "Le mot de passe doit contenir une majuscule"
    if (!/[a-z]/.test(value)) return "Le mot de passe doit contenir une minuscule"
    if (!/[0-9]/.test(value)) return "Le mot de passe doit contenir un chiffre"
    return null
  },

  confirmPassword: (value, password) => {
    if (!value) return "La confirmation est requise"
    if (value !== password) return "Les mots de passe ne correspondent pas"
    return null
  },

  date: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) return "Date invalide"
    return null
  },

  url: (value) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return "URL invalide"
    }
  }
}

export const validateForm = (data, rules) => {
  const errors = {}
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const error = rule(data[field])
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  return errors
}