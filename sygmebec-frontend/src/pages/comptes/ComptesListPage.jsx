import { useMemo, useState } from 'react'
import { FiActivity, FiArrowRight, FiCheck, FiEdit2, FiFileText, FiLock, FiPlus, FiRefreshCw, FiShield, FiTrash2, FiTrendingUp, FiUser, FiUsers } from 'react-icons/fi'

import { useCreateUtilisateur, useDeleteUtilisateur, useResetPassword, useUpdateUtilisateur, useUtilisateurs } from '../../hooks/useUtilisateurs'
import { useMembres } from '../../hooks/useMembres'
import { getRoleLabel } from '../../utils/roleHierarchy'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import UtilisateurForm from '../../components/comptes/UtilisateurForm'
import PasswordResetModal from '../../components/comptes/PasswordResetModal'
import useT from '../../i18n/useT'
import { useUIStore } from '../../store/uiStore'
import './comptesReference.css'

const initials = (value) => (value || '').split(/[ ._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'US'
const formatDate = (value) => value ? new Date(value).toLocaleDateString({ fr: 'fr-HT', ht: 'ht-HT', en: 'en-US' }[useUIStore.getState().language] || 'fr-HT') : 'Jamais'

export default function ComptesListPage() {
  const { t } = useT()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const { data, isLoading } = useUtilisateurs({ page_size: 1000 })
  const { data: membres } = useMembres({ page_size: 1000 })
  const { mutate: createUser, isPending: isCreating } = useCreateUtilisateur()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUtilisateur()
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUtilisateur()
  const { mutate: resetPassword, isPending: isResetting } = useResetPassword()
  const utilisateurs = data?.results || data || []
  const activeUsers = utilisateurs.filter((user) => user.is_active)
  const adminUsers = utilisateurs.filter((user) => user.role_acces?.nomRole === 'ADMINISTRATEUR')
  const pastorUsers = utilisateurs.filter((user) => user.role_acces?.nomRole === 'PASTEUR')
  const secretaryUsers = utilisateurs.filter((user) => user.role_acces?.nomRole === 'SECRETAIRE')
  const inactiveUsers = utilisateurs.filter((user) => !user.is_active)
  const visibleUsers = useMemo(() => utilisateurs.filter((user) => {
    if (filter === 'ALL') return true
    if (filter === 'INACTIF') return !user.is_active
    return user.role_acces?.nomRole === filter
  }), [filter, utilisateurs])
  const latestUsers = [...utilisateurs].sort((a, b) => String(b.dernier_acces || b.date_creation_compte || '').localeCompare(String(a.dernier_acces || a.date_creation_compte || ''))).slice(0, 4)
  const activeRate = utilisateurs.length ? Math.round((activeUsers.length / utilisateurs.length) * 100) : 0

  const handleCreate = (formData) => createUser(formData, { onSuccess: () => setShowCreateModal(false) })
  const handleEdit = (formData) => updateUser({ id: editTarget, data: formData }, { onSuccess: () => { setShowEditModal(false); setEditTarget(null) } })
  const handleDelete = () => { if (deleteTarget) deleteUser(deleteTarget); setDeleteTarget(null) }
  const handleResetPassword = (data, callbacks) => {
    if (!resetTarget) return
    resetPassword({ id: resetTarget.id, data }, callbacks)
  }
  const roleClass = (role) => role === 'ADMINISTRATEUR' ? 'lr-blue' : role === 'PASTEUR' ? 'lr-purple' : 'lr-green'
  const openEdit = (user) => { setEditTarget(user.id); setShowEditModal(true) }

  return <div className="letters-reference accounts-reference">
    <div className="lr-page-head"><div><div className="lr-eyebrow">{t('navigation.accounts')}</div><h1>{t('management.accountsTitle')}</h1><p>{t('management.accountsDescription')}</p></div><button className="lr-create" onClick={() => setShowCreateModal(true)}><FiPlus size={16} />{t('management.addMember')}</button></div>

    <div className="lr-quick-grid">
      <button className="lr-quick lr-blue" onClick={() => setShowCreateModal(true)}><FiArrowRight className="lr-quick-arrow" size={15} /><span className="lr-quick-icon"><FiUser size={20} /></span><h3>Nouvel utilisateur</h3><p>{t('accountForm.newUserDescription')}</p></button>
      <button className="lr-quick lr-purple" onClick={() => setFilter('ADMINISTRATEUR')}><FiArrowRight className="lr-quick-arrow" size={15} /><span className="lr-quick-icon"><FiUsers size={20} /></span><h3>Gérer les rôles</h3><p>Consultez les administrateurs et les pasteurs.</p></button>
      <button className="lr-quick lr-green" onClick={() => setFilter('SECRETAIRE')}><FiArrowRight className="lr-quick-arrow" size={15} /><span className="lr-quick-icon"><FiShield size={20} /></span><h3>Permissions</h3><p>Visualisez les accès des secrétaires.</p></button>
      <button className="lr-quick lr-amber" onClick={() => setFilter('INACTIF')}><FiArrowRight className="lr-quick-arrow" size={15} /><span className="lr-quick-icon"><FiFileText size={20} /></span><h3>Archiver</h3><p>Gérez les comptes actuellement inactifs.</p></button>
    </div>

    <div className="lr-results"><span className="lr-results-badge"><FiCheck size={13} />{activeUsers.length} compte{activeUsers.length > 1 ? 's' : ''} actif{activeUsers.length > 1 ? 's' : ''}</span><span className="lr-divider-dot" /><span className="lr-meta">Dernière activité · {latestUsers[0] ? formatDate(latestUsers[0].dernier_acces || latestUsers[0].date_creation_compte) : 'Aucune activité'}</span></div>

    <div className="lr-stats">
      <article className="lr-stat lr-blue"><span className="lr-stat-icon"><FiUsers size={21} /></span><div className="lr-stat-num">{utilisateurs.length}</div><div className="lr-stat-label">Total utilisateurs</div><div className="lr-trend positive"><FiTrendingUp size={11} />Comptes enregistrés</div></article>
      <article className="lr-stat lr-green"><span className="lr-stat-icon"><FiCheck size={21} /></span><div className="lr-stat-num">{activeUsers.length}</div><div className="lr-stat-label">Comptes actifs</div><div className="lr-trend">{activeRate} % des comptes</div></article>
      <article className="lr-stat lr-purple"><span className="lr-stat-icon"><FiShield size={21} /></span><div className="lr-stat-num">{adminUsers.length}</div><div className="lr-stat-label">Administrateurs</div><div className="lr-trend">{utilisateurs.length ? `${Math.round((adminUsers.length / utilisateurs.length) * 100)} % des comptes` : 'Aucun administrateur'}</div></article>
      <article className="lr-stat lr-amber"><span className="lr-stat-icon"><FiUser size={21} /></span><div className="lr-stat-num">{pastorUsers.length}</div><div className="lr-stat-label">Pasteurs</div><div className="lr-trend">{utilisateurs.length ? `${Math.round((pastorUsers.length / utilisateurs.length) * 100)} % des comptes` : 'Aucun pasteur'}</div></article>
    </div>

    <div className="lr-overview">
      <section className="lr-panel"><div className="lr-panel-head"><div><h3>Activité récente</h3><p>Dernières connexions et actions</p></div><span className="lr-tag">Récent</span></div><div className="lr-feed">{latestUsers.length ? latestUsers.map((user) => <div className="lr-feed-item" key={user.id}><span className={`lr-feed-icon ${user.is_active ? 'lr-green' : 'lr-amber'}`}><FiActivity size={16} /></span><div><div className="lr-feed-text"><b>{user.identifiant}</b> {user.dernier_acces ? 's’est connecté' : 'a un compte créé'}.</div><div className="lr-feed-time">{formatDate(user.dernier_acces || user.date_creation_compte)}</div></div></div>) : <div className="lr-feed-item"><span className="lr-feed-icon lr-green"><FiActivity size={16} /></span><div><div className="lr-feed-text">Aucun compte utilisateur.</div><div className="lr-feed-time">Créez le premier compte</div></div></div>}</div></section>
      <section className="lr-panel"><div className="lr-panel-head"><div><h3>Répartition des rôles</h3><p>Distribution des comptes par rôle</p></div><span className="lr-tag">{utilisateurs.length} comptes</span></div><div className="lr-role-distribution">{[{ label: 'Administrateurs', count: adminUsers.length, color: '#3768d6' }, { label: 'Pasteurs', count: pastorUsers.length, color: '#7c50d1' }, { label: 'Secrétaires', count: secretaryUsers.length, color: '#1fa060' }, { label: 'Inactifs', count: inactiveUsers.length, color: '#c17f18' }].map((item) => <div className="lr-role-row" key={item.label}><span className="lr-role-label">{item.label}</span><span className="lr-role-track"><span className="lr-role-fill" style={{ '--lr-role-color': item.color, width: `${utilisateurs.length ? (item.count / utilisateurs.length) * 100 : 0}%` }} /></span><span className="lr-role-count">{item.count}</span></div>)}</div></section>
    </div>

    <div className="lr-kpis"><article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#1fa060', '--lr-progress': activeRate }}><span>{activeRate}%</span></span><div><div className="lr-kpi-num">Taux d’activité</div><div className="lr-kpi-label">Comptes actifs</div></div></article><article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#3768d6', '--lr-progress': 70 }}><span>∞</span></span><div><div className="lr-kpi-num">Dernière connexion</div><div className="lr-kpi-label">Activité des utilisateurs</div></div></article><article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#7c50d1', '--lr-progress': utilisateurs.length ? (adminUsers.length / utilisateurs.length) * 100 : 0 }}><span>{adminUsers.length}</span></span><div><div className="lr-kpi-num">Admins actifs</div><div className="lr-kpi-label">Sur {utilisateurs.length} utilisateurs</div></div></article><article className="lr-kpi"><span className="lr-kpi-ring" style={{ '--lr-ring': '#c17f18', '--lr-progress': 100 }}><span><FiLock size={13} /></span></span><div><div className="lr-kpi-num">Sécurité</div><div className="lr-kpi-label">Comptes protégés</div></div></article></div>

<section className="lr-list"><div className="lr-list-head"><h2>Liste des utilisateurs</h2><p>Gérez les comptes et les rôles des utilisateurs.</p></div><div className="lr-chips"><button className={`lr-chip ${filter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter('ALL')}>Tous ({utilisateurs.length})</button><button className={`lr-chip ${filter === 'ADMINISTRATEUR' ? 'active' : ''}`} onClick={() => setFilter('ADMINISTRATEUR')}>Administrateurs ({adminUsers.length})</button><button className={`lr-chip ${filter === 'PASTEUR' ? 'active' : ''}`} onClick={() => setFilter('PASTEUR')}>Pasteurs ({pastorUsers.length})</button><button className={`lr-chip ${filter === 'SECRETAIRE' ? 'active' : ''}`} onClick={() => setFilter('SECRETAIRE')}>Secrétaires ({secretaryUsers.length})</button><button className={`lr-chip ${filter === 'INACTIF' ? 'active' : ''}`} onClick={() => setFilter('INACTIF')}>Inactifs ({inactiveUsers.length})</button></div><div className="lr-table-wrap"><table><thead><tr><th>Identifiant</th><th>Rôle</th><th>Membre associé</th><th>Statut</th><th>Dernier accès</th><th>Actions</th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id}><td><div className="lr-user"><span className="lr-user-avatar">{initials(user.identifiant)}</span><div><div className="lr-user-name">{user.identifiant}</div><div className="lr-user-meta">ID: #{user.id}</div></div></div></td><td><span className={`lr-pill ${roleClass(user.role_acces?.nomRole)}`}>{getRoleLabel(user.role_acces?.nomRole)}</span></td><td>{user.membre ? <div className="lr-linked"><span className="lr-linked-avatar">{initials(user.membre.nom_complet || user.membre.nom)}</span><span className="lr-linked-name">{user.membre.nom_complet || user.membre.nom}</span></div> : <span className="lr-empty">—</span>}</td><td><span className={`lr-status ${user.is_active ? '' : 'inactive'}`}><span className="lr-status-dot" />{user.is_active ? 'Actif' : 'Inactif'}</span></td><td>{formatDate(user.dernier_acces)}</td><td><div className="lr-user-actions"><button className="lr-user-action reset" title="Réinitialiser le mot de passe" onClick={() => { setResetTarget(user) }}><FiRefreshCw size={14} /></button><button className="lr-user-action edit" title="Modifier" onClick={() => openEdit(user)}><FiEdit2 size={14} /></button><button className="lr-user-action delete" title="Supprimer" onClick={() => setDeleteTarget(user.id)}><FiTrash2 size={14} /></button></div></td></tr>)}</tbody></table></div><div className="lr-list-foot"><span>{isLoading ? 'Chargement…' : `Affichage de ${visibleUsers.length} utilisateur${visibleUsers.length > 1 ? 's' : ''} sur ${utilisateurs.length}`}</span><span>{filter === 'ALL' ? 'Tous les comptes' : 'Filtre actif'}</span></div></section>

    <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer un utilisateur" size="xl" hideHeader><UtilisateurForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} isLoading={isCreating} membres={membres?.results || membres || []} /></Modal>
    <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditTarget(null) }} title="Modifier l’utilisateur" size="md">{editTarget && <UtilisateurForm initialData={utilisateurs.find((user) => user.id === editTarget)} onSubmit={handleEdit} isLoading={isUpdating} membres={membres?.results || membres || []} isEditing />}</Modal>
    <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Supprimer l’utilisateur" message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible." isLoading={isDeleting} />
    <PasswordResetModal isOpen={!!resetTarget} target={resetTarget} onClose={() => setResetTarget(null)} onReset={handleResetPassword} isLoading={isResetting} />
  </div>
}
