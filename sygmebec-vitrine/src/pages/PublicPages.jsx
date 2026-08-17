import Accueil from './Accueil'
import APropos from './APropos'
import Adhesion from './Adhesion'
import Contact from './Contact'
import EvenementDetail from './EvenementDetail'
import Evenements from './Evenements'
import Galerie from './Galerie'
import MentionsLegales from './MentionsLegales'
import Confidentialite from './Confidentialite'
import NotFound from './NotFound'
import Connexion from './espace-membre/Connexion'
import MonProfil from './espace-membre/MonProfil'
import MesInscriptions from './espace-membre/MesInscriptions'

export const HomePage = Accueil
export const AboutPage = APropos
export const AdhesionPage = Adhesion
export const ContactPage = Contact
export const EventDetailPage = EvenementDetail
export const EventsPage = Evenements
export const GalleryPage = Galerie
export const LegalPage = ({ privacy = false }) => (privacy ? <Confidentialite /> : <MentionsLegales />)
export const LoginPage = Connexion
export const ProfilePage = MonProfil
export const RegistrationsPage = MesInscriptions
export const NotFoundPage = NotFound
