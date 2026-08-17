// ============================================
// src/router/index.jsx - Version complète
// ============================================
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import RoleRoute from './RoleRoute'

// Layouts
import AuthLayout from '../layouts/AuthLayout'
import MainLayout from '../layouts/MainLayout'

// Pages
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import DashboardPage from '../pages/DashboardPage'
import ProfilePage from '../pages/ProfilePage'
import SettingsPage from '../pages/SettingsPage'

// Membres
import MembresListPage from '../pages/membres/MembresListPage'
import MembreDetailPage from '../pages/membres/MembreDetailPage'
import MembreCreatePage from '../pages/membres/MembreCreatePage'
import MembreEditPage from '../pages/membres/MembreEditPage'
import DemandesAdhesionPage from '../pages/membres/DemandesAdhesionPage'
import GalerieGestionPage from '../pages/galerie/GalerieGestionPage'

// Événements
import EvenementsListPage from '../pages/evenements/EvenementsListPage'
import EvenementDetailPage from '../pages/evenements/EvenementDetailPage'
import EvenementCreatePage from '../pages/evenements/EvenementCreatePage'
import EvenementEditPage from '../pages/evenements/EvenementEditPage'
import AuditLogsPage from '../pages/audit/AuditLogsPage'

// Rapports
import RapportsListPage from '../pages/rapports/RapportsListPage'
import RapportGenererPage from '../pages/rapports/RapportGenererPage'

// Comptes
import ComptesListPage from '../pages/comptes/ComptesListPage'
import LettresListPage from '../pages/lettres/LettresListPage'

export default function AppRouter() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Routes protégées */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Membres */}
          <Route path="/membres" element={<MembresListPage />} />
          <Route path="/membres/nouveau" element={<MembreCreatePage />} />
          <Route path="/membres/:id" element={<MembreDetailPage />} />
          <Route path="/membres/:id/modifier" element={<MembreEditPage />} />
          <Route path="/inscriptions-en-ligne" element={<DemandesAdhesionPage />} />
          <Route path="/galerie" element={<GalerieGestionPage />} />

          {/* Événements */}
          <Route path="/evenements" element={<EvenementsListPage />} />
          <Route path="/evenements/:id" element={<EvenementDetailPage />} />
          <Route path="/evenements/nouveau" element={<EvenementCreatePage />} />
          <Route path="/evenements/:id/modifier" element={<EvenementEditPage />} />

          {/* Rapports */}
          <Route path="/rapports" element={<RapportsListPage />} />
          <Route path="/rapports/generer" element={<RapportGenererPage />} />
          <Route path="/lettres" element={<LettresListPage />} />

          <Route path="/statistiques" element={<AuditLogsPage />} />
          <Route path="/audit-logs" element={<Navigate to="/statistiques" replace />} />

          {/* Comptes - Administrateur uniquement */}
          <Route element={<RoleRoute requiredRole="ADMINISTRATEUR" />}>
            <Route path="/comptes" element={<ComptesListPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
