import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppWidget() {
  const whatsappUrl = "https://wa.me/260971234567?text=Hi%20UniHairShop!%20I%20am%20a%20student%20and%20I%20have%20a%20question%20about%20a%20booking/product.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-widget"
      title="Chat with UniHairShop on WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
