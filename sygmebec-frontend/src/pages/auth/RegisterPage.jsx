import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import logo from '../../../../Logo.png'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authApi } from '../../api/authApi'
import { useNavigate } from 'react-router-dom'

export default function RegisterPage() {
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [sexe, setSexe] = useState('MALE')
  const [dateNaissance, setDateNaissance] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const { mutate: registerUser, isLoading: isPending } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate('/login')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nom || !prenom || !telephone || !email || !adresse || !identifiant || !password) return
    if (password !== passwordConfirm) return

    registerUser({
      nom,
      prenom,
      sexe,
      date_naissance: dateNaissance,
      telephone,
      email,
      adresse,
      identifiant,
      password,
      password_confirm: passwordConfirm,
    })
  }

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-panel">
      <div className="grid min-h-[420px] md:grid-cols-[0.95fr_1.35fr]">
        <section className="bg-gradient-to-br from-primary-700 to-primary-900 px-8 py-10 text-white flex flex-col items-center justify-center text-center">
          <div className="relative mb-5 flex h-24 w-24 items-center justify-center">
            <img src={logo} alt="Logo" className="h-20 w-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold tracking-normal">SYGMEBEC</h1>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/90">
            Inscription pour accéder au Système de Gestion des Membres et des Événements
          </p>
        </section>

        <section className="px-8 py-10 md:px-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-secondary-900">Créer un compte</h2>
              <div className="mx-auto mt-3 h-0.5 w-12 bg-primary-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Entrez votre nom"
                  required
                />
                <Input
                  label="Prénom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Entrez votre prénom"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-secondary-800">Sexe</label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value)}
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-secondary-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    required
                  >
                    <option value="MALE">Masculin</option>
                    <option value="FEMELLE">Femelle</option>
                  </select>
                </div>
                <Input
                  label="Date de naissance"
                  type="date"
                  value={dateNaissance}
                  onChange={(e) => setDateNaissance(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Téléphone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="Numéro de téléphone"
                  required
                />
                <Input
                  label="Adresse e-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse e-mail"
                  required
                />
              </div>

              <Input
                label="Adresse"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Adresse postale"
                required
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">Nom d'utilisateur</label>
                <Input
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="Choisissez un identifiant"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">Mot de passe</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 hover:text-secondary-800"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-secondary-800">Confirmer le mot de passe</label>
                <Input
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Confirmez le mot de passe"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <Button type="submit" isLoading={isPending} className="h-11">
                  Créer un compte
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/login')} className="h-11">
                  Retour à la connexion
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
