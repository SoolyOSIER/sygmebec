// src/layouts/components/Footer.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    navigation: [
      { label: 'Accueil', to: '/' },
      { label: 'À propos', to: '/apropos' },
      { label: 'Événements', to: '/evenements' },
      { label: 'Galerie', to: '/galerie' },
      { label: 'Contact', to: '/contact' },
    ],
    ressources: [
      { label: 'Mentions légales', to: '/mentions-legales' },
      { label: 'Confidentialité', to: '/confidentialite' },
      { label: 'FAQ', to: '/faq' },
      { label: 'CGU', to: '/cgu' },
    ],
    contact: [
      { icon: Mail, label: 'contact@gestmembres.com', href: 'mailto:contact@gestmembres.com' },
      { icon: Phone, label: '+33 1 23 45 67 89', href: 'tel:+33123456789' },
      { icon: MapPin, label: 'Paris, France', href: '#' },
    ]
  }

  const socialLinks = [
    { icon: Facebook, href: '#', color: '#1877F2' },
    { icon: Twitter, href: '#', color: '#1DA1F2' },
    { icon: Instagram, href: '#', color: '#E4405F' },
    { icon: Linkedin, href: '#', color: '#0A66C2' },
  ]

  return (
    <footer className="bg-navy-900 text-white/80 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />

      <div className="container-custom relative py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center text-navy-900 shadow-lg">
                <span className="text-xl font-bold">G</span>
              </div>
              <span className="text-2xl font-playfair font-bold text-white">
                GESTMEMBRES
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              La plateforme complète pour gérer votre communauté, organiser des événements 
              et suivre vos membres en toute simplicité.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all duration-300 group"
                  style={{ color: social.color }}
                >
                  <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {footerLinks.navigation.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-gold-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gold-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Ressources</h4>
            <ul className="space-y-2.5">
              {footerLinks.ressources.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/60 hover:text-gold-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-gold-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              {footerLinks.contact.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 text-white/60 hover:text-gold-400 transition-colors text-sm group"
                  >
                    <item.icon className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white/60 mb-3">Recevez nos actualités</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-900 rounded-xl transition-all duration-300 group"
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>
            &copy; {currentYear} GESTMEMBRES. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link to="/mentions-legales" className="hover:text-white transition-colors">
              Mentions légales
            </Link>
            <Link to="/confidentialite" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link to="/cgu" className="hover:text-white transition-colors">
              CGU
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer