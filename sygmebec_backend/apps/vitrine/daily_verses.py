"""Catalogue et sélection du verset du jour pour la vitrine publique."""

from datetime import date
from typing import Final

from django.utils import timezone


# Le catalogue est volontairement maintenu dans le code : aucun réglage ou
# contenu administratif n'est requis pour afficher un verset chaque jour.
DAILY_VERSES: Final[tuple[dict[str, str], ...]] = (
    {
        'texte': 'Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d’eux.',
        'reference': 'Matthieu 18:20',
    },
    {
        'texte': 'L’Éternel est mon berger : je ne manquerai de rien.',
        'reference': 'Psaume 23:1',
    },
    {
        'texte': 'Je puis tout par celui qui me fortifie.',
        'reference': 'Philippiens 4:13',
    },
    {
        'texte': 'Car Dieu a tant aimé le monde qu’il a donné son Fils unique.',
        'reference': 'Jean 3:16',
    },
    {
        'texte': 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse.',
        'reference': 'Proverbes 3:5',
    },
    {
        'texte': 'L’Éternel est près de tous ceux qui l’invoquent avec sincérité.',
        'reference': 'Psaume 145:18',
    },
    {
        'texte': 'Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu.',
        'reference': 'Ésaïe 41:10',
    },
    {
        'texte': 'Réjouissez-vous toujours dans le Seigneur ; je le répète, réjouissez-vous.',
        'reference': 'Philippiens 4:4',
    },
    {
        'texte': 'Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.',
        'reference': 'Psaume 119:105',
    },
    {
        'texte': 'Demandez, et l’on vous donnera ; cherchez, et vous trouverez.',
        'reference': 'Matthieu 7:7',
    },
    {
        'texte': 'L’amour est patient, il est plein de bonté.',
        'reference': '1 Corinthiens 13:4',
    },
    {
        'texte': 'Voici, je fais toutes choses nouvelles.',
        'reference': 'Apocalypse 21:5',
    },
    {
        'texte': 'Que tout ce qui respire loue l’Éternel !',
        'reference': 'Psaume 150:6',
    },
    {
        'texte': 'Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus.',
        'reference': 'Matthieu 6:33',
    },
    {
        'texte': 'L’Éternel est ma lumière et mon salut : de qui aurais-je crainte ?',
        'reference': 'Psaume 27:1',
    },
    {
        'texte': 'Aimez-vous les uns les autres ; comme je vous ai aimés.',
        'reference': 'Jean 13:34',
    },
    {
        'texte': 'La joie de l’Éternel sera votre force.',
        'reference': 'Néhémie 8:10',
    },
    {
        'texte': 'Approchez-vous de Dieu, et il s’approchera de vous.',
        'reference': 'Jacques 4:8',
    },
    {
        'texte': 'L’Éternel est bon, il est un refuge au jour de la détresse.',
        'reference': 'Nahum 1:7',
    },
    {
        'texte': 'C’est ici la journée que l’Éternel a faite : qu’elle soit pour nous un sujet d’allégresse et de joie !',
        'reference': 'Psaume 118:24',
    },
    {
        'texte': 'Que la paix de Christ, à laquelle vous avez été appelés, règne dans vos cœurs.',
        'reference': 'Colossiens 3:15',
    },
    {
        'texte': 'L’Éternel combattra pour vous ; et vous, gardez le silence.',
        'reference': 'Exode 14:14',
    },
    {
        'texte': 'Remets ton sort à l’Éternel, mets en lui ta confiance, et il agira.',
        'reference': 'Psaume 37:5',
    },
    {
        'texte': 'Si Dieu est pour nous, qui sera contre nous ?',
        'reference': 'Romains 8:31',
    },
    {
        'texte': 'Que votre lumière luise ainsi devant les hommes.',
        'reference': 'Matthieu 5:16',
    },
    {
        'texte': 'L’Éternel est mon secours, je ne craindrai rien.',
        'reference': 'Psaume 118:6',
    },
    {
        'texte': 'Heureux ceux qui procurent la paix, car ils seront appelés fils de Dieu !',
        'reference': 'Matthieu 5:9',
    },
    {
        'texte': 'Je vous laisse la paix, je vous donne ma paix.',
        'reference': 'Jean 14:27',
    },
    {
        'texte': 'Espère en l’Éternel ! Fortifie-toi et que ton cœur s’affermisse.',
        'reference': 'Psaume 27:14',
    },
    {
        'texte': 'Le Seigneur est fidèle, il vous affermira et vous préservera du malin.',
        'reference': '2 Thessaloniciens 3:3',
    },
    {
        'texte': 'Bénis l’Éternel, mon âme, et n’oublie aucun de ses bienfaits !',
        'reference': 'Psaume 103:2',
    },
)

# Cette date garde Matthieu 18:20 comme verset affiché le 24 août 2026, tout
# en faisant varier le verset de façon déterministe pour chaque date suivante
# ou précédente.
REFERENCE_DATE: Final = date(2026, 8, 24)


def get_daily_verse(day: date | None = None) -> dict[str, str]:
    """Retourne le verset associé à une date locale donnée.

    Sans argument, la date de Port-au-Prince configurée dans Django est utilisée.
    """
    local_day = day or timezone.localdate()
    index = (local_day - REFERENCE_DATE).days % len(DAILY_VERSES)
    verse = DAILY_VERSES[index]
    return {
        'date': local_day.isoformat(),
        'texte': verse['texte'],
        'reference': verse['reference'],
    }
