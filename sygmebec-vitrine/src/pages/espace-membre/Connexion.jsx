// src/pages/espace-membre/Connexion.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import SEO from '../../components/common/SEO'
import AnimatedSection from '../../components/ui/AnimatedSection'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { memberApi } from '../../services/publicApi'
import { useMemberAuthStore } from '../../store/memberAuthStore'
import { validateLoginForm } from '../../utils/validation'

const Connexion = () => {
  const setSession = useMemberAuthStore((state) => state.setSession)
  const setAccessToken = useMemberAuthStore((state) => state.setAccessToken)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    identifiant: '',
    mot_de_passe: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validation = validateLoginForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      toast.error('Veuillez vérifier vos informations de connexion.')
      return
    }

    setLoading(true)
    try {
      // L'API attend la clé `password`, tandis que le formulaire conserve
      // `mot_de_passe` pour son libellé francophone.
      const response = await memberApi.login({
        identifiant: formData.identifiant,
        password: formData.mot_de_passe,
      })
      const accessToken = response.data?.access || response.access
      const user = response.data?.user || response.user

      if (!accessToken || !user) {
        throw new Error('La réponse de connexion est incomplète.')
      }

      setAccessToken(accessToken)
      setSession(user, accessToken)
      toast.success('Connexion réussie !')
      // Le cookie de session émis par l'API est partagé entre les ports
      // localhost. Le tableau de bord restaure donc la session à l'ouverture.
      const dashboardUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173'
      window.setTimeout(() => window.location.assign(dashboardUrl), 500)
    } catch (error) {
      setErrors({ identifiant: 'Identifiant ou mot de passe incorrect.' })
      toast.error('Identifiant ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title="Connexion - GESTMEMBRES" />
      
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="container-custom max-w-md">
          <AnimatedSection>
            <div className="text-center mb-8">
              <h1 className="section-title text-3xl">
                <span className="gradient-text">Connexion</span>
              </h1>
              <p className="text-gray-600 mt-2">
                Connectez-vous à votre espace personnel
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identifiant ou Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="identifiant"
                        required
                        value={formData.identifiant}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-colors ${errors.identifiant ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                        placeholder="Votre identifiant ou email"
                      />
                      {errors.identifiant && <p className="field-feedback">{errors.identifiant}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="mot_de_passe"
                        required
                        value={formData.mot_de_passe}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-12 py-2.5 rounded-xl border transition-colors ${errors.mot_de_passe ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'}`}
                        placeholder="Votre mot de passe"
                      />
                      {errors.mot_de_passe && <p className="field-feedback">{errors.mot_de_passe}</p>}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-600">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      Se souvenir de moi
                    </label>
                    <Link to="/mot-de-passe-oublie" className="text-primary-600 hover:text-primary-700 font-medium">
                      Mot de passe oublié ?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      'Connexion en cours...'
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Se connecter
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Pas encore de compte ?{' '}
                    <Link to="/adhesion" className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center">
                      Créer un compte
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </>
  )
}

export default Connexion
