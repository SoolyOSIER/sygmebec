import test from 'node:test'
import assert from 'node:assert/strict'

import { validateAdhesionForm, validateContactForm, validateLoginForm } from '../src/utils/validation.js'

test('validateAdhesionForm rejects invalid names and email', () => {
  const result = validateAdhesionForm({
    nom: '  ',
    prenom: 'A',
    email: 'not-an-email',
    telephone: '123',
    message: 'ok',
  })

  assert.equal(result.isValid, false)
  assert.ok(result.errors.nom)
  assert.ok(result.errors.prenom)
  assert.ok(result.errors.email)
  assert.ok(result.errors.telephone)
})

test('validateAdhesionForm accepts phone numbers with spaces and hyphens', () => {
  const result = validateAdhesionForm({
    nom: 'Jean',
    prenom: 'Pierre',
    email: 'jean@example.com',
    telephone: '+509 12-34-56-78',
    message: '',
  })

  assert.equal(result.isValid, true)
})

test('validateContactForm accepts well-formed data', () => {
  const result = validateContactForm({
    nom: 'Diallo',
    prenom: 'Mamadou',
    email: 'contact@example.com',
    telephone: '+221771234567',
    sujet: 'Demande d’information',
    message: 'Bonjour, je souhaite obtenir plus d’informations.',
  })

  assert.equal(result.isValid, true)
  assert.deepEqual(result.errors, {})
})

test('validateLoginForm requires password length', () => {
  const result = validateLoginForm({ identifiant: 'membre', mot_de_passe: '123' })

  assert.equal(result.isValid, false)
  assert.ok(result.errors.mot_de_passe)
})
