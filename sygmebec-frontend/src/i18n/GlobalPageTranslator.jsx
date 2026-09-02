import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import pageTranslations from './pageTranslations'

const translatableAttributes = ['placeholder', 'title', 'aria-label', 'alt']
const originalText = new WeakMap()
const originalAttributes = new WeakMap()

const normalizeForLookup = (value = '') => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[\s\u00A0]+/g, ' ')
  .trim()
  .toLowerCase()

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getTranslatedText = (dictionary, source) => {
  if (!source) return source
  const exact = dictionary[source]
  if (exact) return exact
  const normalized = normalizeForLookup(source)
  const match = Object.entries(dictionary).find(([key]) => normalizeForLookup(key) === normalized)
  if (match) return match[1]

  // Rendered labels often contain counts or dates, so an exact dictionary
  // lookup cannot translate the French fragment inside the text node.
  return Object.entries(dictionary)
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
