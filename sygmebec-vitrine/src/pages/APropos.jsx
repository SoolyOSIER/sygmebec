import { t, useTranslation } from '../i18n'
import SEO from '../components/common/SEO'
import AboutLanding from '../components/about/AboutLanding'

export default function APropos() {
  useTranslation()

  return <><SEO title={t("À propos - Église Baptiste de l’Espoir")} description={t("Notre histoire, notre vision, notre mission et notre confession de foi.")} /><AboutLanding /></>
}
