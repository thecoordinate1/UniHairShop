import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppWidget() {
  const whatsappNumber = "260772822579";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20UniHairShop!%20I%20am%20a%20student%20and%20I%20have%20a%20question%20about%20a%20booking%2Fproduct.`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-widget"
      title="Chat with UniHairShop on WhatsApp (+260 772 822579)"
    >
      <MessageCircle size={28} />
    </a>
  );
}
