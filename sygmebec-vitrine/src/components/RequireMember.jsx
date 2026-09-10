import { t, useTranslation } from '../i18n'
import { Navigate, Outlet } from 'react-router-dom'

import { useMemberAuthStore } from '../store/memberAuthStore'

export default function RequireMember() {
  useTranslation()

  const { accessToken, ready } = useMemberAuthStore()

  if (!ready) {
    return <div className="loading-screen">{t("Chargement de votre session…")}</div>
  }

  return accessToken ? <Outlet /> : <Navigate to="/espace-membre/connexion" replace />
}
