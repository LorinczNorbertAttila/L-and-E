import React, { useEffect } from "react";

const ZapierChatbot = () => {
  useEffect(() => {
    const scriptId = "zapier-chatbot-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js";
      script.type = "module";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <zapier-interfaces-chatbot-embed
      is-popup="true"
      chatbot-id="cmc69g0gu002vmcfyd0lifzf5"
    ></zapier-interfaces-chatbot-embed>
  );
};

export default ZapierChatbot;
