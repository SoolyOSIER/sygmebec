// src/pages/Confidentialite.jsx
import { motion } from 'framer-motion'
import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'

const Confidentialite = () => {
  return (
    <>
      <SEO title="Politique de confidentialité - GESTMEMBRES" />
      <div className="py-20">
        <div className="container-custom max-w-4xl">
          <AnimatedSection>
            <h1 className="section-title mb-8">
              <span className="gradient-text">Politique de confidentialité</span>
            </h1>
          </AnimatedSection>
          
          <div className="prose prose-lg max-w-none">
            <AnimatedSection delay={0.1}>
              <h2>1. Collecte des données</h2>
              <p>
                Nous collectons les données suivantes lorsque vous utilisez notre plateforme :
              </p>
              <ul>
                <li><strong>Données d'identification :</strong> nom, prénom, email, téléphone</li>
                <li><strong>Données de connexion :</strong> adresse IP, cookies, logs</li>
                <li><strong>Données d'activité :</strong> inscriptions, participations, historique</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <h2>2. Utilisation des données</h2>
              <p>
                Vos données sont utilisées pour :
              </p>
              <ul>
                <li>Gérer votre compte et vos inscriptions</li>
                <li>Vous informer des événements à venir</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <h2>3. Protection des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles 
                pour protéger vos données contre tout accès non autorisé.
              </p>
              <ul>
                <li>Chiffrement des données</li>
                <li>Accès restreint aux personnels habilités</li>
                <li>Audits de sécurité réguliers</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <h2>4. Vos droits</h2>
              <p>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul>
                <li><strong>Droit d'accès :</strong> consulter vos données</li>
                <li><strong>Droit de rectification :</strong> modifier vos données</li>
                <li><strong>Droit à l'effacement :</strong> supprimer vos données</li>
                <li><strong>Droit d'opposition :</strong> refuser le traitement</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <h2>5. Contact</h2>
              <p>
                Pour toute question relative à la protection de vos données, contactez-nous :
              </p>
              <ul>
                <li><strong>Email :</strong> dpo@gestmembres.com</li>
                <li><strong>Adresse :</strong> 123 Avenue des Champs-Élysées, 75008 Paris</li>
              </ul>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
              <p className="text-sm text-gray-500 mt-8">
                Dernière mise à jour : {new Date().toLocaleDateString()}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </>
  )
}

export default Confidentialite