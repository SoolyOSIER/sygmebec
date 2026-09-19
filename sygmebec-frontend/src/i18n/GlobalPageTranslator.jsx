import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import pageTranslations from './pageTranslations'

const translatableAttributes = ['placeholder', 'title', 'aria-label', 'alt']
const originalText = new WeakMap()
const originalAttributes = new WeakMap()
const preparedDictionaries = new WeakMap()
const windows1252Bytes = {
  '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86,
  '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c,
  'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95,
  '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b,
  'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
}

// A first version of the fallback catalogue was saved with an incorrect
// character encoding (for example, "Ã©" instead of "é").  Decode only the
// affected entries before using them, so the French text rendered by React can
// match the translations reliably.  New catalogues that are already UTF-8 are
// left unchanged.
const decodeMojibake = (value) => {
  if (typeof value !== 'string' || !/[ÃÂ]|â(?:€|[\u0080-\u00bf])/.test(value)) return value
  try {
    return new TextDecoder('utf-8').decode(Uint8Array.from(value, (character) => windows1252Bytes[character] ?? character.charCodeAt(0)))
  } catch {
    return value
  }
}

const prepareDictionary = (dictionary) => {
  if (preparedDictionaries.has(dictionary)) return preparedDictionaries.get(dictionary)
  const prepared = Object.entries(dictionary).map(([source, translated]) => [
    decodeMojibake(source),
    decodeMojibake(translated),
  ])
  preparedDictionaries.set(dictionary, prepared)
  return prepared
}

const normalizeForLookup = (value = '') => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[\s\u00A0]+/g, ' ')
  .trim()
  .toLowerCase()

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getTranslatedText = (dictionary, source) => {
  if (!source) return source
  const entries = prepareDictionary(dictionary)
  const exact = entries.find(([key]) => key === source)?.[1]
  if (exact) return exact
  const normalized = normalizeForLookup(source)
  const match = entries.find(([key]) => normalizeForLookup(key) === normalized)
  if (match) return match[1]

  // Rendered labels often contain counts or dates, so an exact dictionary
  // lookup cannot translate the French fragment inside the text node.
  return entries
    .filter(([key]) => key.length > 2 && source.includes(key))
    .sort(([left], [right]) => right.length - left.length)
    .reduce((value, [key, translated]) => {
      const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(key)}(?=$|[^\\p{L}\\p{N}])`, 'gu')
      return value.replace(pattern, (_, prefix) => prefix + translated)
    }, source)
}

const translateElement = (element, dictionary) => {
  if (element?.closest?.('[data-no-translate]')) return

  translatableAttributes.forEach((attribute) => {
    const value = element.getAttribute?.(attribute)
    if (!value) return
    const originals = originalAttributes.get(element) || {}
    if (!originals[attribute]) originals[attribute] = value
    originalAttributes.set(element, originals)
    const originalValue = originals[attribute]
    const translated = getTranslatedText(dictionary, originalValue)
    element.setAttribute(attribute, translated)
  })

  for (const child of element.childNodes || []) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (!originalText.has(child)) originalText.set(child, child.nodeValue)
      const source = originalText.get(child)
      const trimmed = source.trim()
      if (!trimmed) continue
      const translated = getTranslatedText(dictionary, trimmed)
      if (translated && translated !== trimmed) {
        child.nodeValue = source.replace(trimmed, translated)
      }
    } else if (child.nodeType === Node.ELEMENT_NODE && !child.hasAttribute('data-no-translate')) {
      translateElement(child, dictionary)
    }
  }
}

/**
 * Traduit immédiatement les chaînes historiques qui ne passent pas encore par
 * useT(). Les nouveaux écrans doivent toujours privilégier t('clé').
 */
export default function GlobalPageTranslator({ children }) {
  const language = useUIStore((state) => state.language)

  useEffect(() => {
    const dictionary = pageTranslations[language] || {}
    const applyTranslations = (node = document.body) => translateElement(node, dictionary)
    applyTranslations()
    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) translateElement(node, dictionary)
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) translateElement(node.parentElement, dictionary)
      }))
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [language])

  return children
}
