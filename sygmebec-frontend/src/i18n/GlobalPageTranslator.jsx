import { useEffect } from 'react'
import { useUIStore } from '../store/uiStore'
import pageTranslations from './pageTranslations'

const translatableAttributes = ['placeholder', 'title', 'aria-label', 'alt']
const originalText = new WeakMap()
const originalAttributes = new WeakMap()

const translateElement = (element, dictionary) => {
  translatableAttributes.forEach((attribute) => {
    const value = element.getAttribute?.(attribute)
    if (!value) return
    const originals = originalAttributes.get(element) || {}
    if (!originals[attribute]) originals[attribute] = value
    originalAttributes.set(element, originals)
    if (dictionary[originals[attribute]]) element.setAttribute(attribute, dictionary[originals[attribute]])
    else element.setAttribute(attribute, originals[attribute])
  })

  for (const child of element.childNodes || []) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (!originalText.has(child)) originalText.set(child, child.nodeValue)
      const source = originalText.get(child)
      const trimmed = source.trim()
      if (!trimmed || !dictionary[trimmed]) continue
      child.nodeValue = source.replace(trimmed, dictionary[trimmed])
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
