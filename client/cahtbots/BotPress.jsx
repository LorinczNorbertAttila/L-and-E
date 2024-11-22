import React, { useEffect } from 'react'

const BotpressChat = () => {
  useEffect(() => {
    // Első script: Botpress Webchat motor betöltése
    const botpressScript = document.createElement('script')
    botpressScript.src = import.meta.env.VITE_BOTPRESS_SCRIPT1
    botpressScript.async = true
    document.body.appendChild(botpressScript)

    // Második script: Konfigurációs script betöltése
    const configScript = document.createElement('script')
    configScript.src = import.meta.env.VITE_BOTPRESS_SCRIPT2
    configScript.async = true
    document.body.appendChild(configScript)

    return () => {
      // Opció: Script-ek eltávolítása, ha a komponens eltűnik
      document.body.removeChild(botpressScript)
      document.body.removeChild(configScript)
    }
  }, [])

  return null
}

export default BotpressChat
