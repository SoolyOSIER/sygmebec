import { t, useTranslation, localizedDate } from '../i18n'
// src/pages/MentionsLegales.jsx
import { motion } from 'framer-motion'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'

const MentionsLegales = () => {
  useTranslation()

  return (
    <>
      <SEO title={t("Mentions légales - GESTMEMBRES")} />
      <div className="py-20">
        <div className="container-custom max-w-4xl">
          <AnimatedSection>
            <h1 className="section-title mb-8">
              <span className="gradient-text">{t("Mentions légales")}</span>
            </h1>
          </AnimatedSection>
          
          <div className="prose prose-lg max-w-none">
            <AnimatedSection delay={0.1}>
              <h2>{t("1. Informations légales")}</h2>
              <p>{t("Le site GESTMEMBRES est édité par la société GESTMEMBRES SAS, au capital de 50 000 €, immatriculée au RCS de Paris sous le numéro 123 456 789. ")}</p>
              <ul>
                <li><strong>{t("Siège social :")}</strong>{t(" 123 Avenue des Champs-Élysées, 75008 Paris")}</li>
                <li><strong>{t("Directeur de la publication :")}</strong>{t(" Marie Dubois")}</li>
                <li><strong>{t("Hébergeur :")}</strong>{t(" OVH SAS, 2 rue Kellermann, 59100 Roubaix")}</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <h2>{t("2. Propriété intellectuelle")}</h2>
              <p>{t("L'ensemble du contenu du site (textes, images, vidéos, logos) est protégé par le droit d'auteur et appartient à GESTMEMBRES SAS. Toute reproduction est interdite sans autorisation préalable. ")}</p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <h2>{t("3. Données personnelles")}</h2>
              <p>{t("Conformément à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. ")}</p>
              <p>{t("Pour exercer ce droit, contactez-nous à : ")}<strong>{t("contact@gestmembres.com")}</strong>
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <h2>{t("4. Cookies")}</h2>
              <p>{t("Le site utilise des cookies pour améliorer l'expérience utilisateur. Vous pouvez paramétrer votre navigateur pour refuser les cookies. ")}</p>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <h2>{t("5. Droit applicable")}</h2>
              <p>{t("Les présentes mentions légales sont régies par le droit français. Tout litige relèvera de la compétence exclusive des tribunaux français. ")}</p>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
              <p className="text-sm text-gray-500 mt-8">{t("Dernière mise à jour : ")}{t(localizedDate(new Date()))}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </>
  )
}

export default MentionsLegales