// src/hooks/useScrollRestoration.js
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const useScrollRestoration = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [pathname])
}