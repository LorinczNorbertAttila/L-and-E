import React, { useEffect } from "react";

const BotpressChat = () => {
  useEffect(() => {
    // First script: Load Botpress Webchat engine
    const botpressScript = document.createElement("script");
    botpressScript.src = import.meta.env.VITE_BOTPRESS_SCRIPT1;
    botpressScript.async = true;
    document.body.appendChild(botpressScript);

    // Second script: Load configuration script
    const configScript = document.createElement("script");
    configScript.src = import.meta.env.VITE_BOTPRESS_SCRIPT2;
    configScript.async = true;
    document.body.appendChild(configScript);

    return () => {
      // Optionally remove scripts when the component unmounts
      document.body.removeChild(botpressScript);
      document.body.removeChild(configScript);
    };
  }, []);

  return null;
};

export default BotpressChat;
