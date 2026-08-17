import HomeLanding from '../components/home/HomeLanding'
import SEO from '../components/common/SEO'

const pageTitle = 'Accueil - \u00c9glise Baptiste de l\u2019Espoir'
const description = 'Bienvenue \u00e0 l\u2019\u00c9glise Baptiste de l\u2019Espoir du Cap-Ha\u00eftien.'

export default function Accueil() {
  return <><SEO title={pageTitle} description={description} /><HomeLanding /></>
}
