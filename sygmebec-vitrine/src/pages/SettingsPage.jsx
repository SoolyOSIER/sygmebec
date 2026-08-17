// ============================================
// src/pages/SettingsPage.jsx - Nouveau
// ============================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiBell, FiMoon, FiGlobe, FiLock, FiUser, FiMail, FiPhone } from 'react-icons/fi'
import AnimatedCard from '../components/ui/AnimatedCard'
import Switch from '../components/ui/Switch'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Tabs from '../components/ui/Tabs'
import { useUIStore } from '../store/uiStore'
import useT from '../i18n/useT'
import LanguageSelect from '../components/ui/LanguageSelect'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailNotifications: true,
    twoFactor: false,
  })

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const tabs = [
    {
      id: 'general',
      label: 'Général',
      icon: FiUser,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-secondary-900">Préférences générales</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <FiMoon />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Mode sombre</p>
                    <p className="text-sm text-secondary-400">Activer le thème sombre</p>
                  </div>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <FiGlobe />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Langue</p>
                    <p className="text-sm text-secondary-400">Français (par défaut)</p>
                  </div>
                </div>
                <LanguageSelect />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-secondary-900">Informations personnelles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nom" defaultValue="Jean" placeholder="Votre nom" />
              <Input label="Prénom" defaultValue="Paul" placeholder="Votre prénom" />
              <Input label="Email" defaultValue="jean.paul@email.com" type="email" icon={FiMail} />
              <Input label="Téléphone" defaultValue="+225 07 00 00 00" icon={FiPhone} />
            </div>
            <Button>Mettre à jour</Button>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FiBell,
      badge: 3,
      content: (
        <div className="space-y-4">
          <h4 className="font-medium text-secondary-900">Paramètres des notifications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-secondary-900">Notifications push</p>
                <p className="text-sm text-secondary-400">Recevoir des notifications dans le navigateur</p>
              </div>
              <Switch
                checked={settings.notifications}
                onChange={() => handleToggle('notifications')}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-secondary-900">Notifications email</p>
                <p className="text-sm text-secondary-400">Recevoir des notifications par email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-secondary-900">Nouveaux membres</p>
                <p className="text-sm text-secondary-400">Être notifié des nouvelles inscriptions</p>
              </div>
              <Switch
                checked={true}
                onChange={() => {}}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-secondary-900">Événements</p>
                <p className="text-sm text-secondary-400">Être notifié des événements à venir</p>
              </div>
              <Switch
                checked={true}
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      label: 'Sécurité',
      icon: FiLock,
      content: (
        <div className="space-y-4">
          <h4 className="font-medium text-secondary-900">Sécurité du compte</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <div>
                <p className="font-medium text-secondary-900">Authentification à deux facteurs</p>
                <p className="text-sm text-secondary-400">Sécuriser votre compte avec 2FA</p>
              </div>
              <Switch
                checked={settings.twoFactor}
                onChange={() => handleToggle('twoFactor')}
              />
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-700">
                <strong>Conseil :</strong> Utilisez un mot de passe fort et unique pour votre compte.
              </p>
            </div>
            <Button variant="outline">Changer le mot de passe</Button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Paramètres</h1>
        <p className="text-secondary-500 mt-1">Gérez vos préférences et paramètres du compte</p>
      </div>

      <AnimatedCard className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6">
        <Tabs tabs={tabs} defaultTab="general" />
      </AnimatedCard>
    </div>
  )
}