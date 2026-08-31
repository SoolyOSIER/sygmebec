export const PASSWORD_MIN_LENGTH = 12

export const PASSWORD_POLICY_SUMMARY = '12 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial.'

const policyDefinitions = [
  {
    id: 'length',
    label: '12 caractères minimum',
    message: 'Le mot de passe doit contenir au moins 12 caractères.',
    // Array.from counts Unicode code points like Python's len(), which keeps
    // this client-side hint aligned with the Django validator.
    test: (value) => Array.from(value).length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'Une majuscule',
    message: 'Le mot de passe doit contenir au moins une majuscule.',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'Une minuscule',
    message: 'Le mot de passe doit contenir au moins une minuscule.',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'digit',
    label: 'Un chiffre',
    message: 'Le mot de passe doit contenir au moins un chiffre.',
    test: (value) => /\d/.test(value),
  },
  {
    id: 'special',
    label: 'Un caractère spécial',
    message: 'Le mot de passe doit contenir au moins un caractère spécial.',
    // Match the backend validator: whitespace alone does not qualify as a
    // special character.
    test: (value) => /[^\p{L}\p{N}\s]/u.test(value),
  },
]

export function getPasswordChecks(password = '') {
  const value = String(password)
  return policyDefinitions.map(({ test, ...rule }) => ({ ...rule, valid: test(value) }))
}

export function passwordMeetsPolicy(password = '') {
  return getPasswordChecks(password).every((check) => check.valid)
}

export function getPasswordPolicyError(password = '') {
  if (!password) return 'Saisissez un nouveau mot de passe.'
  return getPasswordChecks(password).find((check) => !check.valid)?.message || null
}

export function getPasswordStrength(password = '') {
  const checks = getPasswordChecks(password)
  const score = checks.filter((check) => check.valid).length

  const levels = [
    { label: 'À créer', tone: 'weak', percent: 0 },
    { label: 'Très faible', tone: 'weak', percent: 20 },
    { label: 'Faible', tone: 'weak', percent: 40 },
    { label: 'À renforcer', tone: 'fair', percent: 60 },
    { label: 'Presque conforme', tone: 'good', percent: 80 },
    { label: 'Fort · conforme', tone: 'strong', percent: 100 },
  ]

  return {
    ...levels[score],
    checks,
    score,
    isCompliant: score === checks.length,
  }
}
