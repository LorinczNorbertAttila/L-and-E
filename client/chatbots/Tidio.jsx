import React, { useEffect } from 'react'

const TidioChat = () => {
    useEffect(() => {
    const script = document.createElement('script')
    script.src = '//code.tidio.co/atok5qdjfa1sbpykbvzwjiijdlkp1dcv.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
        document.body.removeChild(script)
      }
    }, [])
  
    return null
  }

  export default TidioChat