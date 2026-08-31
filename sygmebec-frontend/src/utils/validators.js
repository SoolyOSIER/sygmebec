// src/utils/validators.js
export const validators = {
  // Email validation
  email: (value) => {
    if (!value) return "L'email est requis"
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!regex.test(value)) return "Email invalide"
    return null
  },

  // Required field
  required: (value, fieldName = 'Ce champ') => {
    if (!value || value.trim() === '') return `${fieldName} est requis`
    return null
  },

  // Min length
  minLength: (value, min, fieldName = 'Ce champ') => {
    if (value && value.length < min) {
      return `${fieldName} doit contenir au moins ${min} caractères`
    }
    return null
  },

  // Max length
  maxLength: (value, max, fieldName = 'Ce champ') => {
    if (value && value.length > max) {
      return `${fieldName} doit contenir au maximum ${max} caractères`
    }
    return null
  },

  // Exact length
  exactLength: (value, length, fieldName = 'Ce champ') => {
    if (value && value.length !== length) {
      return `${fieldName} doit contenir exactement ${length} caractères`
    }
    return null
  },

  // Phone number
  phone: (value) => {
    if (!value) return null
    const cleaned = value.replace(/\s/g, '')
    const regex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
    if (!regex.test(cleaned)) return "Numéro de téléphone invalide"
    return null
  },

  // Password
  password: (value) => {
    if (!value) return "Le mot de passe est requis"
    if (value.length < 8) return "Le mot de passe doit contenir au moins 8 caractères"
    if (!/[A-Z]/.test(value)) return "Le mot de passe doit contenir une majuscule"
    if (!/[a-z]/.test(value)) return "Le mot de passe doit contenir une minuscule"
    if (!/[0-9]/.test(value)) return "Le mot de passe doit contenir un chiffre"
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      return "Le mot de passe doit contenir un caractère spécial"
    }
    return null
  },

  // Confirm password
  confirmPassword: (value, password) => {
    if (!value) return "La confirmation est requise"
    if (value !== password) return "Les mots de passe ne correspondent pas"
    return null
  },

  // Date
  date: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) return "Date invalide"
    if (date > new Date()) return "La date ne peut pas être dans le futur"
    return null
  },

  // Future date
  futureDate: (value) => {
    if (!value) return null
    const date = new Date(value)
    if (isNaN(date.getTime())) return "Date invalide"
    if (date < new Date()) return "La date doit être dans le futur"
    return null
  },

  // URL
  url: (value) => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return "URL invalide"
    }
  },

  // Number
  number: (value, fieldName = 'Ce champ') => {
    if (!value) return null
    if (isNaN(Number(value))) return `${fieldName} doit être un nombre`
    return null
  },

  // Min value
  minValue: (value, min, fieldName = 'Ce champ') => {
    if (value && Number(value) < min) {
      return `${fieldName} doit être supérieur ou égal à ${min}`
    }
    return null
  },

  // Max value
  maxValue: (value, max, fieldName = 'Ce champ') => {
    if (value && Number(value) > max) {
      return `${fieldName} doit être inférieur ou égal à ${max}`
    }
    return null
  },

  // Postal code (French)
  postalCode: (value) => {
    if (!value) return null
    const regex = /^[0-9]{5}$/
    if (!regex.test(value)) return "Code postal invalide (5 chiffres)"
    return null
  },

  // SIRET (French business number)
  siret: (value) => {
    if (!value) return null
    const cleaned = value.replace(/\s/g, '')
    if (cleaned.length !== 14) return "Le SIRET doit contenir 14 chiffres"
    if (!/^\d{14}$/.test(cleaned)) return "Le SIRET doit contenir uniquement des chiffres"
    return null
  },
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

export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0
}

export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return "Une erreur est survenue"
}