// src/pages/espace-membre/MotDePasseOublie.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { authMembreService } from '../../services/authMembreService'

const MotDePasseOublie = () => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authMembreService.forgotPassword(email)
      setSent(true)
      toast.success('Un email de réinitialisation a été envoyé')
    } catch (error) {
      toast.error("Erreur lors de l'envoi de l'email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title="Mot de passe oublié - GESTMEMBRES" />
      
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="container-custom max-w-md">
          <AnimatedSection>
            <Link to="/connexion" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-700 transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>

            <div className="text-center mb-8">
              <h1 className="section-title text-3xl">
                <span className="gradient-text">Mot de passe oublié</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card>
              <CardContent className="p-6">
                {sent ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center text-success-600 mx-auto mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-navy-900 mb-2">Email envoyé !</h3>
                    <p className="text-gray-600 text-sm">
                      Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                      Veuillez vérifier votre boîte de réception.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setSent(false)}
                    >
                      Renvoyer l'email
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors"
                          placeholder="Votre adresse email"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="gold"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </>
  )
}

export default MotDePasseOublie