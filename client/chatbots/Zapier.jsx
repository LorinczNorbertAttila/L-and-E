import React, { useEffect } from "react";

const ZapierChat = () => {
  useEffect(() => {
    const scriptId = "zapier-chatbot-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = import.meta.env.VITE_ZAPIER_SCRIPT;
      script.type = "module";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <zapier-interfaces-chatbot-embed
      is-popup="true"
      chatbot-id={import.meta.env.VITE_ZAPIER_CHATBOT_ID}
    ></zapier-interfaces-chatbot-embed>
  );
};

export default ZapierChat;
