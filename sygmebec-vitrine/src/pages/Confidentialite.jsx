import { t, useTranslation, localizedDate } from '../i18n'
// src/pages/Confidentialite.jsx
import { motion } from 'framer-motion'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'

const Confidentialite = () => {
  useTranslation()

  return (
    <>
      <SEO title={t("Politique de confidentialité - GESTMEMBRES")} />
      <div className="py-20">
        <div className="container-custom max-w-4xl">
          <AnimatedSection>
            <h1 className="section-title mb-8">
              <span className="gradient-text">{t("Politique de confidentialité")}</span>
            </h1>
          </AnimatedSection>
          
          <div className="prose prose-lg max-w-none">
            <AnimatedSection delay={0.1}>
              <h2>{t("1. Collecte des données")}</h2>
              <p>{t("Nous collectons les données suivantes lorsque vous utilisez notre plateforme : ")}</p>
              <ul>
                <li><strong>{t("Données d'identification :")}</strong>{t(" nom, prénom, email, téléphone")}</li>
                <li><strong>{t("Données de connexion :")}</strong>{t(" adresse IP, cookies, logs")}</li>
                <li><strong>{t("Données d'activité :")}</strong>{t(" inscriptions, participations, historique")}</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <h2>{t("2. Utilisation des données")}</h2>
              <p>{t("Vos données sont utilisées pour : ")}</p>
              <ul>
                <li>{t("Gérer votre compte et vos inscriptions")}</li>
                <li>{t("Vous informer des événements à venir")}</li>
                <li>{t("Améliorer nos services")}</li>
                <li>{t("Respecter nos obligations légales")}</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <h2>{t("3. Protection des données")}</h2>
              <p>{t("Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données contre tout accès non autorisé. ")}</p>
              <ul>
                <li>{t("Chiffrement des données")}</li>
                <li>{t("Accès restreint aux personnels habilités")}</li>
                <li>{t("Audits de sécurité réguliers")}</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <h2>{t("4. Vos droits")}</h2>
              <p>{t("Conformément au RGPD, vous disposez des droits suivants : ")}</p>
              <ul>
                <li><strong>{t("Droit d'accès :")}</strong>{t(" consulter vos données")}</li>
                <li><strong>{t("Droit de rectification :")}</strong>{t(" modifier vos données")}</li>
                <li><strong>{t("Droit à l'effacement :")}</strong>{t(" supprimer vos données")}</li>
                <li><strong>{t("Droit d'opposition :")}</strong>{t(" refuser le traitement")}</li>
                <li><strong>{t("Droit à la portabilité :")}</strong>{t(" récupérer vos données")}</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <h2>{t("5. Contact")}</h2>
              <p>{t("Pour toute question relative à la protection de vos données, contactez-nous : ")}</p>
              <ul>
                <li><strong>{t("Email :")}</strong>{t(" dpo@gestmembres.com")}</li>
                <li><strong>{t("Adresse :")}</strong>{t(" 123 Avenue des Champs-Élysées, 75008 Paris")}</li>
              </ul>
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

export default Confidentialite