import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'
import RequireMember from './components/RequireMember'
import { memberApi } from './services/publicApi'
import { useMemberAuthStore } from './store/memberAuthStore'
import {
  AboutPage,
  AdhesionPage,
  ContactPage,
  EventDetailPage,
  EventsPage,
  GalleryPage,
  HomePage,
  LegalPage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  RegistrationsPage,
} from './pages/PublicPages'

function SessionBootstrap({ children }) {
  const setAccessToken = useMemberAuthStore((state) => state.setAccessToken)
  const setSession = useMemberAuthStore((state) => state.setSession)
  const setReady = useMemberAuthStore((state) => state.setReady)
  const clearSession = useMemberAuthStore((state) => state.clearSession)

  useEffect(() => {
    let mounted = true

    memberApi.refresh()
      .then(({ data }) => {
        if (!mounted) return null
        setAccessToken(data.access)
        return memberApi.getCurrentUser()
      })
      .then((response) => {
        if (!mounted || !response) return
        if (response.data?.membre) {
          setSession(response.data, useMemberAuthStore.getState().accessToken)
          return
        }
        clearSession()
      })
      .catch(() => {
        if (mounted) setReady()
      })

    return () => { mounted = false }
  }, [clearSession, setAccessToken, setReady, setSession])

  return children
}

export default function App() {
  return (
    <SessionBootstrap>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/a-propos" element={<AboutPage />} />
            <Route path="/evenements" element={<EventsPage />} />
            <Route path="/evenements/:eventId" element={<EventDetailPage />} />
            <Route path="/galerie" element={<GalleryPage />} />
            <Route path="/adhesion" element={<AdhesionPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mentions-legales" element={<LegalPage />} />
            <Route path="/confidentialite" element={<LegalPage privacy />} />
            <Route path="/espace-membre/connexion" element={<LoginPage />} />
            <Route element={<RequireMember />}>
              <Route path="/espace-membre/profil" element={<ProfilePage />} />
              <Route path="/espace-membre/mes-inscriptions" element={<RegistrationsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SessionBootstrap>
  )
}
