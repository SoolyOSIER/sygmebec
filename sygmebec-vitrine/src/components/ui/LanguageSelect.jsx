import { useId } from 'react'
import { Globe2 } from 'lucide-react'
import { LANGUAGES, useTranslation } from '../../i18n'

export default function LanguageSelect({ value = 'fr', onChange, className = '' }) {
  const id = useId()
  const { t } = useTranslation()
  return <div className={`language-select ${className}`}>
    <Globe2 size={17} aria-hidden="true" />
    <label className="sr-only" htmlFor={id}>{t('Langue')}</label>
    <select id={id} value={value} onChange={(event) => onChange?.(event.target.value)}>
      {LANGUAGES.map(({ code, label }) => <option key={code} value={code} lang={code}>{label}</option>)}
    </select>
  </div>
}

