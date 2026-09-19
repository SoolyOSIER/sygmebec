import axios from 'axios'

import api, { apiBaseUrl } from '../services/api'

const editorialClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const withToken = (token) => token ? { headers: { Authorization: `Bearer ${token}` } } : {}

const unwrap = (response) => response.data?.results || response.data || []

// The API keeps `cover_image_url` as the canonical field.  This adapter also
// exposes the historic `cover_image` key so the public cards and editor remain
// compatible with articles created before the sports module was introduced.
const normalizeArticle = (article) => {
  if (!article || typeof article !== 'object') return article
  return { ...article, cover_image: article.cover_image || article.cover_image_url || '' }
}

const unwrapArticles = (response) => unwrap(response).map(normalizeArticle)

export const globeApi = {
  listArticles: async (params = {}) => unwrapArticles(await api.get('/sports/articles/', { params })),
  getArticle: async (slug) => normalizeArticle((await api.get(`/sports/articles/${slug}/`)).data),
  listCategories: async () => unwrap(await api.get('/sports/categories/')),
  getFeatured: async () => unwrapArticles(await api.get('/sports/articles/featured/')),
  getEditorialSummary: async (token) => (await editorialClient.get('/sports/dashboard/', withToken(token))).data,
  createArticle: async (payload, token) => (await editorialClient.post('/sports/articles/', payload, withToken(token))).data,
  updateArticle: async (slug, payload, token) => (await editorialClient.patch(`/sports/articles/${slug}/`, payload, withToken(token))).data,
  removeArticle: async (slug, token) => editorialClient.delete(`/sports/articles/${slug}/`, withToken(token)),
  publishArticle: async (slug, token) => (await editorialClient.post(`/sports/articles/${slug}/publish/`, {}, withToken(token))).data,
  unpublishArticle: async (slug, token) => (await editorialClient.post(`/sports/articles/${slug}/unpublish/`, {}, withToken(token))).data,
  login: async (credentials) => (await editorialClient.post('/auth/login/', credentials)).data,
}

export const responseMessage = (error, fallback = 'Une erreur est survenue. Réessayez dans un instant.') => {
  const data = error?.response?.data
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data?.error === 'string') return data.error
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') return Object.values(data).flat().join(' ') || fallback
  return fallback
}
