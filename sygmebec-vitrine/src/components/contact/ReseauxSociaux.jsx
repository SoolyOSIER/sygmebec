// src/components/contact/ReseauxSociaux.jsx
import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

const socialLinks = [
  { icon: Facebook, url: '#', color: '#1877F2', label: 'Facebook' },
  { icon: Twitter, url: '#', color: '#1DA1F2', label: 'Twitter' },
  { icon: Instagram, url: '#', color: '#E4405F', label: 'Instagram' },
  { icon: Linkedin, url: '#', color: '#0A66C2', label: 'LinkedIn' },
  { icon: Youtube, url: '#', color: '#FF0000', label: 'YouTube' },
]

const ReseauxSociaux = () => {
  return (
    <div className="flex flex-wrap gap-4">
      {socialLinks.map((social, index) => (
        <motion.a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative"
          aria-label={social.label}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: `${social.color}15`,
              color: social.color 
            }}
          >
            <social.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {social.label}
          </span>
        </motion.a>
      ))}
    </div>
  )
}

export default ReseauxSociaux