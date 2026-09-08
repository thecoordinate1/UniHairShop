import React from 'react';
import { MessageCircle, Instagram } from 'lucide-react';

export default function WhatsAppWidget() {
  const whatsappNumber = "260772822579";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hi%20UniHairShop!%20I%20am%20a%20student%20and%20I%20have%20a%20question%20about%20a%20booking%2Fproduct.`;
  const instagramUrl = "https://www.instagram.com/unihair.shop?stkn=MXE4dmxsYmUwdjU4MQ%3D%3D&utm_source=qr";

  return (
    <div className="social-widgets">
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="instagram-widget"
        title="Follow UniHairShop on Instagram"
        aria-label="Open UniHairShop on Instagram"
      >
        <Instagram size={24} aria-hidden="true" />
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-widget"
        title="Chat with UniHairShop on WhatsApp (+260 772 822579)"
        aria-label="Start WhatsApp live chat on +260 772 822579"
      >
        <MessageCircle size={26} aria-hidden="true" />
      </a>
    </div>
  );
}
