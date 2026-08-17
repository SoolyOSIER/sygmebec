import sourceText from './churchText.txt?raw'

const text = sourceText.replace(/\r/g, '').trim()
const extract = (start, end) => {
  const startIndex = text.indexOf(start)
  if (startIndex === -1) return ''
  const from = startIndex + start.length
  const endIndex = end ? text.indexOf(end, from) : -1
  return text.slice(from, endIndex === -1 ? undefined : endIndex).trim()
}

export const accueilContent = extract('Accuel :', 'Apropos :')
export const aboutContent = extract('Apropos :', 'Comment devenue Membre :')
export const membershipContent = extract('Comment devenue Membre :')
export const paragraphs = (value) => value.split(/\n\s*\n/).map((paragraph) => paragraph.replace(/\n+/g, ' ').trim()).filter(Boolean)
export const extractPart = (value, start, end) => {
  const startIndex = value.indexOf(start)
  if (startIndex === -1) return ''
  const from = startIndex + start.length
  const endIndex = end ? value.indexOf(end, from) : -1
  return value.slice(from, endIndex === -1 ? undefined : endIndex).trim()
}

export const churchIntroduction = accueilContent.split('\n\n')[0]?.trim() || ''
const purposeStart = 'Le but de cette \u00e9glise est de glorifier Dieu'
export const churchPurpose = `${purposeStart}${extractPart(accueilContent, purposeStart, 'Cette \u00e9glise')}`
export const churchObjectives = extractPart(accueilContent, 'aura pour objectifs:', 'Horaire des services').split('\n').map((line) => line.trim()).filter(Boolean)

export const serviceSchedule = [
  { day: 'Dimanche matin', services: ["7h00 - 8h50 AM : Service d\u2019adoration", "9h00 - 9h50 AM : \u00c9cole du dimanche", "10h00 - 11h45 AM : Service d\u2019adoration"] },
  { day: 'Dimanche soir', services: ["5h00 - 6h30 PM : Service d\u2019adoration"] },
  { day: 'Vendredi soir', services: ["5h00 - 7h00 PM : Pri\u00e8re et \u00e9tude biblique"] },
]

export const faithHeadings = ['Les Saintes Ecritures', 'La Trinit\u00e9', 'Dieu le P\u00e8re', 'Dieu le Fils', 'Dieu le Saint-Esprit', 'L\u2019homme', 'Satan', 'Le Salut', 'La vie Chr\u00e9tienne', 'L\u2019Eglise', 'Les ordonnances', 'La destin\u00e9e \u00e9ternelle des hommes', 'Les \u00e9v\u00e9nements \u00e0 venir :']
export const faithStatements = faithHeadings.map((title, index) => ({ title: title.replace(/:$/, ''), content: extractPart(aboutContent, title, faithHeadings[index + 1]) }))

export const aboutIntroduction = extractPart(aboutContent, 'A propos de l\u2019Eglise Baptiste de l\u2019Espoir du Cap-Haitien', 'But \u2013 Vision \u2013 Mission')
export const visionMission = extractPart(aboutContent, 'But \u2013 Vision \u2013 Mission', 'Objectifs')
export const ministryObjectives = extractPart(aboutContent, 'Objectifs', 'Confession de foi')
export const membershipSteps = extractPart(membershipContent, 'Marche \u00e0 suivre', 'Engagement des membres')
export const membershipCommitment = extractPart(membershipContent, 'Engagement des membres', 'Alliance des membres')
export const membershipCovenant = extractPart(membershipContent, 'Alliance des membres')
