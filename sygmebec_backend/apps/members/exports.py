"""Export utilities for the complete members register."""

from io import BytesIO
from textwrap import wrap
from zipfile import ZIP_DEFLATED, ZipFile
from xml.sax.saxutils import escape

from django.utils import timezone


EXPORT_COLUMNS = (
    ('N°', 'id'),
    ('Nom', 'nom'),
    ('Prénom', 'prenom'),
    ('Statut', 'statut'),
    ('Téléphone', 'telephone'),
    ('Téléphone secondaire', 'telephone_secondaire'),
    ('E-mail', 'email'),
    ('Adresse', 'adresse'),
    ('Zone d’habitation', 'zone_habitation'),
    ('Église d’origine', 'eglise_origine'),
    ('Date de naissance', 'date_naissance'),
    ('Âge', 'age'),
    ('Sexe', 'sexe'),
    ('État matrimonial', 'etat_matrimonial'),
    ('Niveau d’étude', 'niveau_etude'),
    ('Profession', 'profession'),
    ('Actuellement employé(e)', 'actuellement_employe'),
    ('Actuellement étudiant(e)', 'actuellement_etudiant'),
    ('Date d’adhésion', 'date_adhesion'),
    ('Date de présentation', 'date_presentation'),
    ('Date de conversion', 'date_conversion'),
    ('Date d’affiliation', 'date_affiliation'),
    ('Date de baptême', 'date_bapteme'),
    ('Ancienneté à l’EBEC', 'anciennete_ebec'),
    ('Membre d’un petit groupe', 'membre_petit_groupe'),
    ('À l’école du dimanche', 'dans_ecole_dimanche'),
    ('Classe d’école du dimanche', 'classe_ecole_dimanche'),
    ('Signature du membre', 'signature_membre'),
    ('Date de signature', 'date_signature'),
    ('Fonctions', 'fonctions'),
    ('Historique des statuts', 'historiques_statut'),
    ('Photo', 'photo'),
    ('Créé le', 'created_at'),
    ('Modifié le', 'updated_at'),
)


def _value(value):
    """Render a database value safely and consistently in every export."""
    if value is None or value == '':
        return '—'
    if isinstance(value, bool):
        return 'Oui' if value else 'Non'
    if hasattr(value, 'strftime'):
        return value.strftime('%d/%m/%Y %H:%M') if hasattr(value, 'hour') else value.strftime('%d/%m/%Y')
    return str(value)


def _function_label(member):
    assignments = member.membre_fonctions.all()
    values = []
    for assignment in assignments:
        label = assignment.fonction.nomFonction
        if assignment.date_assignation:
            label = f'{label} (depuis {_value(assignment.date_assignation)})'
        values.append(label)
    return ', '.join(values) or '—'


def _history_label(member):
    values = []
    for item in member.historiques_statut.all():
        author = item.modifie_par.identifiant if item.modifie_par_id else 'Système'
        values.append(
            f'{_value(item.date_changement)} : {item.ancien_statut} → {item.nouveau_statut} ({author})'
        )
    return ' | '.join(values) or '—'


def member_export_rows(members, request=None):
    """Convert all model fields to exportable strings without omitting optional data."""
    rows = []
    for member in members:
        rows.append({
            'id': member.pk,
            'nom': member.nom,
            'prenom': member.prenom,
            'statut': member.statut.libelle if member.statut_id else None,
            'telephone': member.telephone,
            'telephone_secondaire': member.telephone_secondaire,
            'email': member.email,
            'adresse': member.adresse,
            'zone_habitation': member.zone_habitation,
            'eglise_origine': member.eglise_origine,
            'date_naissance': member.date_naissance,
            'age': member.age,
            'sexe': member.get_sexe_display(),
            'etat_matrimonial': member.get_etat_matrimonial_display(),
            'niveau_etude': member.get_niveau_etude_display(),
            'profession': member.profession,
            'actuellement_employe': member.actuellement_employe,
            'actuellement_etudiant': member.actuellement_etudiant,
            'date_adhesion': member.date_adhesion,
            'date_presentation': member.date_presentation,
            'date_conversion': member.date_conversion,
            'date_affiliation': member.date_affiliation,
            'date_bapteme': member.date_bapteme,
            'anciennete_ebec': member.anciennete_ebec,
            'membre_petit_groupe': member.membre_petit_groupe,
            'dans_ecole_dimanche': member.dans_ecole_dimanche,
            'classe_ecole_dimanche': member.classe_ecole_dimanche,
            'signature_membre': member.signature_membre,
            'date_signature': member.date_signature,
            'fonctions': _function_label(member),
            'historiques_statut': _history_label(member),
            'photo': request.build_absolute_uri(member.photo.url) if request and member.photo else (member.photo.name if member.photo else None),
            'photo_file': _photo_path(member),
            'created_at': member.created_at,
            'updated_at': member.updated_at,
        })
    return rows


def _photo_path(member):
    if not member.photo:
        return None
    try:
        return member.photo.path
    except (AttributeError, NotImplementedError):
        return None


def _worksheet_cell(value):
    return f'<c t="inlineStr"><is><t xml:space="preserve">{escape(_value(value))}</t></is></c>'


def make_xlsx(rows):
    """Create a standards-compliant XLSX workbook using only the Python standard library."""
    table = [[label for label, _ in EXPORT_COLUMNS]]
    table.extend([[_value(row[key]) for _, key in EXPORT_COLUMNS] for row in rows])
    sheet_rows = ''.join(
        f'<row r="{number}">{"".join(_worksheet_cell(value) for value in values)}</row>'
        for number, values in enumerate(table, start=1)
    )
    worksheet = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" '
        'activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'
        f'<sheetData>{sheet_rows}</sheetData>'
        '<autoFilter ref="A1:AH1"/>'
        '</worksheet>'
    )
    buffer = BytesIO()
    with ZipFile(buffer, 'w', ZIP_DEFLATED) as archive:
        archive.writestr('[Content_Types].xml', '''<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>''')
        archive.writestr('_rels/.rels', '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>''')
        archive.writestr('xl/workbook.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Membres" sheetId="1" r:id="rId1"/></sheets></workbook>''')
        archive.writestr('xl/_rels/workbook.xml.rels', '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>''')
        archive.writestr('xl/worksheets/sheet1.xml', worksheet)
    return buffer.getvalue()


def make_pdf(rows):
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=1.2 * cm, leftMargin=1.2 * cm, topMargin=1.2 * cm, bottomMargin=1.2 * cm)
    styles = getSampleStyleSheet()
    title = ParagraphStyle('RegisterTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=17, textColor=colors.HexColor('#1f4f46'), spaceAfter=6)
    subtitle = ParagraphStyle('RegisterSubtitle', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#555555'), spaceAfter=14)
    normal = ParagraphStyle('RegisterValue', parent=styles['Normal'], fontSize=7.4, leading=9)
    story = [Paragraph('Registre complet des membres — SYGMEBEC', title), Paragraph(f'{len(rows)} membre(s) exporté(s) le {timezone.localtime().strftime("%d/%m/%Y à %H:%M")}', subtitle)]
    for index, row in enumerate(rows):
        name = f"{_value(row['nom'])} {_value(row['prenom'])}".strip()
        story.append(Paragraph(f'Membre #{_value(row["id"])} — {escape(name)}', ParagraphStyle('MemberName', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#1f4f46'), spaceAfter=7)))
        details = []
        for label, key in EXPORT_COLUMNS:
            if key == 'id':
                continue
            details.append([Paragraph(f'<b>{escape(label)}</b>', normal), Paragraph(escape(_value(row[key])), normal)])
        table = Table(details, colWidths=[5.5 * cm, 12.0 * cm], repeatRows=0)
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#d9e1df')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#eff6f3')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 5), ('RIGHTPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(table)
        if index < len(rows) - 1:
            story.append(PageBreak())
    document.build(story)
    return buffer.getvalue()


def make_png(rows):
    """Render an elegant individual member sheet inspired by the premium profile."""
    from PIL import Image, ImageDraw, ImageFont, ImageOps

    try:
        display_font = ImageFont.truetype('DejaVuSerif-Bold.ttf', 42)
        name_font = ImageFont.truetype('DejaVuSerif-Bold.ttf', 52)
        section_font = ImageFont.truetype('DejaVuSans-Bold.ttf', 21)
        label_font = ImageFont.truetype('DejaVuSans-Bold.ttf', 14)
        value_font = ImageFont.truetype('DejaVuSans.ttf', 18)
        small_font = ImageFont.truetype('DejaVuSans.ttf', 15)
    except OSError:
        display_font = name_font = section_font = label_font = value_font = small_font = ImageFont.load_default()

    width, margin, gap = 1600, 58, 26
    card_width = (width - (2 * margin) - gap) // 2

    def field(label, value, characters=46):
        return label, wrap(_value(value), width=characters, break_long_words=False) or ['—']

    def sections(row):
        return [
            ('Coordonnées', [field('Téléphone', row['telephone']), field('Téléphone secondaire', row['telephone_secondaire']), field('E-mail', row['email']), field('Adresse', row['adresse']), field('Zone d’habitation', row['zone_habitation']), field('Église d’origine', row['eglise_origine'])]),
            ('Profil personnel', [field('Date de naissance', row['date_naissance']), field('Âge', row['age']), field('Sexe', row['sexe']), field('État matrimonial', row['etat_matrimonial']), field('Niveau d’étude', row['niveau_etude']), field('Profession', row['profession']), field('Actuellement employé(e)', row['actuellement_employe']), field('Actuellement étudiant(e)', row['actuellement_etudiant'])]),
            ('Parcours spirituel', [field('Date d’adhésion', row['date_adhesion']), field('Date de présentation', row['date_presentation']), field('Date de conversion', row['date_conversion']), field('Date d’affiliation', row['date_affiliation']), field('Date de baptême', row['date_bapteme'])]),
            ('Vie dans l’assemblée', [field('Ancienneté à l’EBEC', row['anciennete_ebec']), field('Membre d’un petit groupe', row['membre_petit_groupe']), field('À l’école du dimanche', row['dans_ecole_dimanche']), field('Classe d’école du dimanche', row['classe_ecole_dimanche']), field('Fonctions', row['fonctions'])]),
            ('Suivi administratif', [field('Signature du membre', row['signature_membre']), field('Date de signature', row['date_signature']), field('Créé le', row['created_at']), field('Modifié le', row['updated_at']), field('Historique des statuts', row['historiques_statut'], 94)]),
        ]

    def section_height(items):
        return 66 + sum(30 + 24 * len(lines) for _, lines in items) + 18

    prepared = []
    for row in rows:
        groups = sections(row)
        body_height = 0
        for index in range(0, len(groups), 2):
            body_height += max(section_height(groups[index][1]), section_height(groups[index + 1][1]) if index + 1 < len(groups) else 0) + gap
        prepared.append((row, groups, 410 + body_height))
    total_height = max(300, sum(height + 42 for _, _, height in prepared) + 30)
    image = Image.new('RGB', (width, total_height), '#f7f5f0')
    draw = ImageDraw.Draw(image)

    def draw_avatar(row, x, y):
        size = 184
        draw.ellipse((x - 8, y - 8, x + size + 8, y + size + 8), fill='#b6903f')
        try:
            avatar = ImageOps.fit(Image.open(row['photo_file']).convert('RGB'), (size, size)) if row.get('photo_file') else None
        except (OSError, ValueError):
            avatar = None
        if avatar:
            mask = Image.new('L', (size, size), 0)
            ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
            image.paste(avatar, (x, y), mask)
        else:
            draw.ellipse((x, y, x + size, y + size), fill='#e7dfc9')
            initials = f"{_value(row['prenom'])[0]}{_value(row['nom'])[0]}".upper()
            box = draw.textbbox((0, 0), initials, font=display_font)
            draw.text((x + (size - (box[2] - box[0])) / 2, y + (size - (box[3] - box[1])) / 2 - 5), initials, fill='#5a4620', font=display_font)

    def draw_section(x, y, title, items, height):
        draw.rounded_rectangle((x, y, x + card_width, y + height), radius=18, fill='#ffffff', outline='#e7dfcf', width=2)
        draw.rounded_rectangle((x, y, x + 8, y + 59), radius=4, fill='#b6903f')
        draw.text((x + 25, y + 20), title, fill='#0e1830', font=section_font)
        cursor_y = y + 70
        for label, lines in items:
            draw.text((x + 25, cursor_y), label.upper(), fill='#927a45', font=label_font)
            cursor_y += 20
            for line in lines:
                draw.text((x + 25, cursor_y), line, fill='#252b39', font=value_font)
                cursor_y += 24
            cursor_y += 10

    y = 30
    for row, groups, page_height in prepared:
        header_bottom = y + 330
        draw.rounded_rectangle((margin, y, width - margin, header_bottom), radius=24, fill='#0e1830')
        draw.ellipse((width - 300, y - 110, width + 120, y + 310), fill='#182b52')
        draw.ellipse((width - 185, y + 130, width + 105, y + 420), fill='#203865')
        draw.text((margin + 270, y + 48), 'SYGMEBEC  •  FICHE MEMBRE', fill='#d9b876', font=label_font)
        name = f"{_value(row['prenom'])} {_value(row['nom'])}".strip()
        draw.text((margin + 270, y + 78), name, fill='white', font=name_font)
        draw.rounded_rectangle((margin + 270, y + 152, margin + 270 + 160, y + 186), radius=17, fill='#dcf4e6')
        draw.text((margin + 285, y + 161), _value(row['statut']), fill='#187a4b', font=label_font)
        draw.text((margin + 270, y + 212), f"Membre #{_value(row['id'])}   •   Membre depuis {_value(row['date_adhesion'])}", fill='#bdc7dd', font=small_font)
        draw.text((margin + 270, y + 244), f"{_value(row['telephone'])}   •   {_value(row['email'])}", fill='#bdc7dd', font=small_font)
        draw_avatar(row, margin + 45, y + 70)
        draw.text((margin + 45, y + 274), 'Profil membre', fill='#d9b876', font=label_font)

        row_y = header_bottom + 24
        for index in range(0, len(groups), 2):
            left = groups[index]
            right = groups[index + 1] if index + 1 < len(groups) else None
            height = max(section_height(left[1]), section_height(right[1]) if right else 0)
            draw_section(margin, row_y, left[0], left[1], height)
            if right:
                draw_section(margin + card_width + gap, row_y, right[0], right[1], height)
            row_y += height + gap
        draw.text((margin, row_y - 2), f"Document généré le {timezone.localtime().strftime('%d/%m/%Y à %H:%M')} • Informations confidentielles", fill='#7d8490', font=small_font)
        y += page_height + 42

    buffer = BytesIO()
    image.save(buffer, format='PNG', optimize=True)
    return buffer.getvalue()
