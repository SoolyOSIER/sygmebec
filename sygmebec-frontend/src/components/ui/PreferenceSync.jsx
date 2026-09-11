import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { settingsApi } from '../../api/settingsApi'

export function applyPreferences(data, theme) {
  if (!data) return
  const ui = useUIStore.getState()
  ui.setTheme(data.theme_mode); ui.setLanguage(data.language); ui.setBrightness(data.ui_brightness)
  const root = document.documentElement
  const styles = {
    '--ui-font': data.font_family,
    '--ui-text-scale': ({small:'.9',normal:'1',large:'1.12',xlarge:'1.25'})[data.text_scale],
    '--ui-heading-weight': data.heading_weight,
    '--ui-line-height': data.line_height === 'comfortable' ? '1.8' : '1.5',
    '--ui-density': ({compact:'.8',comfortable:'1',spacious:'1.2'})[data.interface_density],
  }
  for (const [key,value] of Object.entries(styles)) root.style.setProperty(key,value)
  for (const [key,cls] of [['reduce_motion','reduce-motion'],['high_contrast','high-contrast'],['blue_light_reduction','warm-interface'],['disable_shadows','no-decorative-shadows']]) root.classList.toggle(cls, !!data[key])
  if (theme) {
    for (const [key,value] of Object.entries(theme)) root.style.setProperty(`--org-${key}`, value)
  }
  root.style.setProperty('--org-accent',data.use_organization_theme ? theme?.accent || '#3d63f4' : data.accent)
  localStorage.setItem(`sygmebec-preferences-${useAuthStore.getState().user?.id}`,JSON.stringify(data))
}

export default function PreferenceSync() {
  const user = useAuthStore(s => s.user)
  const { data } = useQuery({ queryKey:['preferences',user?.id],queryFn:() => settingsApi.get('me'),enabled:!!user })
  useEffect(() => {
    if (data) { applyPreferences(data.data,data.organization_theme); useUIStore.getState().setSidebar(!data.data.sidebar_collapsed) }
  },[data])
  return null
}
