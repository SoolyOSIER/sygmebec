import { t, useTranslation, localizedDate } from '../i18n'
import { useState } from 'react'
import { CheckCircle, FileText, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

import SEO from '../components/common/SEO'
import AnimatedSection from '../components/ui/AnimatedSection'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { adhesionService } from '../services/adhesionService'
import { validateAdhesionForm } from '../utils/validation'

const initialForm = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  telephone_secondaire: '',
  adresse: '',
  zone_habitation: '',
  eglise_origine: '',
  date_naissance: '',
  sexe: '',
  etat_matrimonial: '',
  niveau_etude: '',
  profession: '',
  actuellement_employe: false,
  anciennete_ebec: '',
  membre_petit_groupe: false,
  dans_ecole_dimanche: false,
  classe_ecole_dimanche: '',
  date_presentation: '',
  date_conversion: '',
  date_affiliation: '',
  date_bapteme: '',
  message: '',
  photo: null,
}

const inputClass = 'mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
const formSteps = [
  { id: 'adhesion-identite', label: 'Identité & contacts' },
  { id: 'adhesion-spirituel', label: 'Parcours spirituel' },
  { id: 'adhesion-eglise', label: 'Vie dans l’église' },
  { id: 'adhesion-complement', label: 'Photo & complément' },
]

function Label({ children, required = false }) {
  useTranslation()

  return <label className="block text-sm font-medium text-gray-700">{t(children)}{t(required && ' *')}</label>
}

function formatRegistrationDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return localizedDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export default function Adhesion() {
  useTranslation()

  const [formData, setFormData] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [registrationDate, setRegistrationDate] = useState(() => new Date())
  const completedFields = Object.values(formData).filter((value) => typeof value === 'boolean' ? value : (typeof File !== 'undefined' && value instanceof File) || Boolean(value)).length
  const formProgress = Math.round((completedFields / Object.keys(initialForm).length) * 100)

  const change = (event) => {
    const { name, type, checked, value, files } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value,
    }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const validation = validateAdhesionForm(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return toast.error(Object.values(validation.errors)[0])
    }

    setRegistrationDate(new Date())
    const payload = new FormData()
    Object.entries(formData).forEach(([field, value]) => {
      if (value !== '' && value !== null) {
        payload.append(field, value instanceof File ? value : String(value))
      }
    })

    setLoading(true)
    try {
      await adhesionService.demanderAdhesion(payload)
      toast.success('Votre inscription a été envoyée. Elle sera examinée par l’église.')
      setFormData(initialForm)
      event.target.reset()
    } catch (error) {
      const detail = error.response?.data
      toast.error(typeof detail === 'object' ? Object.values(detail).flat().join(' ') : "Erreur lors de l'envoi de la demande.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title={t("Inscription membre - SYGMEBEC")} description={t("Formulaire complet d’inscription membre en ligne.")} />
      <div className="py-16">
        <div className="container-custom max-w-5xl">
          <AnimatedSection>
            <div className="mb-8 text-center">
              <span className="section-subtitle"><Users className="h-4 w-4" />{t(" Inscription membre")}</span>
              <h1 className="section-title mt-4">{t("Inscrivez-vous ")}<span className="gradient-text">{t("en ligne")}</span></h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{t("Votre demande arrive directement dans l’espace réservé aux membres du tableau de bord. Elle sera validée par l’administration avant la création définitive de votre fiche. ")}</p>
            </div>
          </AnimatedSection>

          <Card>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={submit} className="space-y-8">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label={t("Étapes du formulaire")}>
                    {formSteps.map((step, index) => <button type="button" key={step.id} onClick={() => document.getElementById(step.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="flex items-center gap-2 rounded-xl px-2 py-1 text-left text-xs font-semibold text-gray-600 transition hover:bg-white hover:text-primary-700"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary-600 text-white">{t(index + 1)}</span>{t(step.label)}</button>)}
                  </nav>
                  <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200"><span className="block h-full rounded-full bg-gradient-to-r from-primary-500 to-gold-500 transition-all" style={{ width: `${formProgress}%` }} /></div><span className="text-xs font-semibold text-gray-500">{t(formProgress)}{t(" % complété")}</span></div>
                </div>

                <section id="adhesion-identite" className="scroll-mt-24">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy-900"><Users className="h-5 w-5 text-primary-600" />{t(" Identité et contacts")}</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div><Label required>{t("Nom")}</Label><input name="nom" required value={formData.nom} onChange={change} className={inputClass} />{errors.nom && <p className="field-feedback">{t(errors.nom)}</p>}</div>
                    <div><Label required>{t("Prénom")}</Label><input name="prenom" required value={formData.prenom} onChange={change} className={inputClass} />{errors.prenom && <p className="field-feedback">{t(errors.prenom)}</p>}</div>
                    <div><Label required>{t("E-mail")}</Label><input name="email" type="email" required value={formData.email} onChange={change} className={inputClass} />{errors.email && <p className="field-feedback">{t(errors.email)}</p>}</div>
                    <div><Label required>{t("Téléphone")}</Label><input name="telephone" type="tel" required value={formData.telephone} onChange={change} className={inputClass} />{errors.telephone && <p className="field-feedback">{t(errors.telephone)}</p>}</div>
                    <div><Label>{t("Téléphone secondaire")}</Label><input name="telephone_secondaire" type="tel" value={formData.telephone_secondaire} onChange={change} className={inputClass} /></div>
                    <div className="md:col-span-2"><Label>{t("Adresse")}</Label><input name="adresse" value={formData.adresse} onChange={change} className={inputClass} /></div>
                    <div><Label>{t("Zone d’habitation")}</Label><input name="zone_habitation" value={formData.zone_habitation} onChange={change} placeholder={t("Ex. Cap-Haïtien")} className={inputClass} /></div>
                    <div className="md:col-span-2"><Label>{t("Église d’origine")}</Label><input name="eglise_origine" value={formData.eglise_origine} onChange={change} placeholder={t("Nom de l’église précédente")} className={inputClass} /></div>
                    <div><Label>{t("Date de naissance")}</Label><input name="date_naissance" type="date" value={formData.date_naissance} onChange={change} className={inputClass} /></div>
                    <div><Label>{t("Sexe")}</Label><select name="sexe" value={formData.sexe} onChange={change} className={inputClass}><option value="">{t("Sélectionner")}</option><option value="MALE">{t("Masculin")}</option><option value="FEMELLE">{t("Féminin")}</option></select></div>
                    <div><Label>{t("État matrimonial")}</Label><select name="etat_matrimonial" value={formData.etat_matrimonial} onChange={change} className={inputClass}><option value="">{t("Sélectionner")}</option><option value="CELIBATAIRE">{t("Célibataire")}</option><option value="MARIE">{t("Marié(e)")}</option><option value="SEPARE">{t("Séparé(e)")}</option><option value="DIVORCE">{t("Divorcé(e)")}</option><option value="VEUF">{t("Veuf(ve)")}</option></select></div>
                    <div><Label>{t("Niveau d’étude")}</Label><select name="niveau_etude" value={formData.niveau_etude} onChange={change} className={inputClass}><option value="">{t("Sélectionner un niveau")}</option><option value="PRIMAIRE">{t("Primaire")}</option><option value="SECONDAIRE">{t("Secondaire")}</option><option value="UNIVERSITAIRE">{t("Universitaire")}</option><option value="PROFESSIONNEL">{t("Professionnel")}</option><option value="AUTRE">{t("Autre")}</option></select></div>
                    <div><Label>{t("Profession")}</Label><input name="profession" value={formData.profession} onChange={change} placeholder={t("Ex. Enseignant(e)")} className={inputClass} /></div>
                    <div><Label>{t("Date d’enregistrement (automatique)")}</Label><input value={formatRegistrationDate(registrationDate)} readOnly className={`${inputClass} bg-gray-50`} /></div>
                  </div>
                </section>

                <section id="adhesion-spirituel" className="scroll-mt-24 border-t border-gray-100 pt-7">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy-900"><FileText className="h-5 w-5 text-primary-600" />{t(" Parcours spirituel")}</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['date_presentation', 'Date de présentation'],
                      ['date_conversion', 'Date de conversion'],
                      ['date_affiliation', "Date d'affiliation"],
                      ['date_bapteme', 'Date de baptême'],
                    ].map(([name, label]) => (
                      <div key={name}><Label>{t(label)}</Label><input name={name} type="date" value={formData[name]} onChange={change} className={inputClass} /></div>
                    ))}
                  </div>
                </section>

                <section id="adhesion-eglise" className="scroll-mt-24 border-t border-gray-100 pt-7">
                  <h2 className="mb-4 text-lg font-semibold text-navy-900">{t("Vie dans l’église")}</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div><Label>{t("Ancienneté à l’EBEC")}</Label><input name="anciennete_ebec" value={formData.anciennete_ebec} onChange={change} placeholder={t("Ex. 3 ans")} className={inputClass} /></div>
                    <div className="flex flex-wrap items-end gap-5 rounded-xl border border-gray-100 p-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700"><input name="actuellement_employe" type="checkbox" checked={formData.actuellement_employe} onChange={change} />{t(" Employé(e)")}</label>
                      <label className="flex items-center gap-2 text-sm text-gray-700"><input name="membre_petit_groupe" type="checkbox" checked={formData.membre_petit_groupe} onChange={change} />{t(" Petit groupe")}</label>
                    </div>
                    <div><Label>{t("Classe d’école du dimanche")}</Label><input name="classe_ecole_dimanche" value={formData.classe_ecole_dimanche} onChange={change} className={inputClass} disabled={!formData.dans_ecole_dimanche} /></div>
                    <label className="flex items-center gap-2 self-end rounded-xl border border-gray-100 p-4 text-sm text-gray-700"><input name="dans_ecole_dimanche" type="checkbox" checked={formData.dans_ecole_dimanche} onChange={change} />{t(" Je suis dans une classe d’école du dimanche")}</label>
                  </div>
                </section>

                <section id="adhesion-complement" className="scroll-mt-24 border-t border-gray-100 pt-7">
                  <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-navy-900"><FileText className="h-5 w-5 text-primary-600" />{t(" Photo et complément")}</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div><Label>{t("Photo")}</Label><input name="photo" type="file" accept="image/*" onChange={change} className={inputClass} /></div><div><Label>{t("Message (facultatif)")}</Label><textarea name="message" rows="4" value={formData.message} onChange={change} className={inputClass} placeholder={t("Une information complémentaire à transmettre à l’église…")} /></div></div>
                </section>

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>{t(loading ? 'Envoi en cours…' : 'Envoyer mon inscription')}</Button>
                <p className="flex items-center justify-center gap-2 text-center text-xs text-gray-400"><CheckCircle className="h-4 w-4" />{t(" Vos informations seront traitées de façon confidentielle.")}</p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
