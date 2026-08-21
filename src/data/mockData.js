// Initial Seed Data for UniHairShop

export const initialServices = [
  {
    id: 'srv-1',
    name: 'Fresh Campus Fade & Beard Trim',
    category: 'Barbing',
    description: 'Crisp low/mid/high taper fade with razor edge lining, hot towel finish, and beard oil nourishment.',
    duration: 35, // minutes
    price: 80, // ZMW
    image: '/images/barber_service.jpg',
    popular: true,
    staffIds: ['stf-1', 'stf-2']
  },
  {
    id: 'srv-2',
    name: 'Knotless Braids (Medium/Long)',
    category: 'Hair Dressing',
    description: 'Neat, weightless knotless braids with neat parting and scalp oil treatment.',
    duration: 180,
    price: 250,
    image: '/images/hair_braids.jpg',
    popular: true,
    staffIds: ['stf-3']
  },
  {
    id: 'srv-3',
    name: 'Luxury Acrylic Nails & Art',
    category: 'Nail Tech',
    description: 'Full set acrylic extensions with custom nail art, rhinestones or chrome polish.',
    duration: 60,
    price: 150,
    image: '/images/nail_art.jpg',
    popular: true,
    staffIds: ['stf-4']
  },
  {
    id: 'srv-4',
    name: 'Full Glam Campus Makeup',
    category: 'Makeup',
    description: 'Long-lasting soft or full glam makeup with strip lashes, contouring, and glossy lip finish.',
    duration: 45,
    price: 180,
    image: '/images/makeup_glam.jpg',
    popular: true,
    staffIds: ['stf-4']
  },
  {
    id: 'srv-5',
    name: 'Gentleman Executive Cut & Scalp Scrub',
    category: 'Barbing',
    description: 'Full hair cut, beard styling, exfoliating scalp scrub and black mask facial treatment.',
    duration: 50,
    price: 120,
    image: '/images/barber_service.jpg',
    popular: false,
    staffIds: ['stf-1']
  },
  {
    id: 'srv-6',
    name: 'Wig Installation & Styling',
    category: 'Hair Dressing',
    description: 'Frontal or closure wig lace melt, plucking, bleaching knots, and custom styling.',
    duration: 90,
    price: 200,
    image: '/images/hair_braids.jpg',
    popular: false,
    staffIds: ['stf-3']
  }
];

export const initialProducts = [
  {
    id: 'prd-1',
    name: 'Zambian Miracle Scalp & Growth Oil (100ml)',
    category: 'Hair Products',
    description: 'Nourishing coconut and castor oil blend enriched with Vitamin E for fast scalp regrowth and shine.',
    price: 95, // ZMW
    stock: 24,
    rating: 4.9,
    reviewsCount: 38,
    image: '/images/hair_product.jpg',
    featured: true
  },
  {
    id: 'prd-2',
    name: 'Pro Cordless Clipper & Beard Care Set',
    category: 'Grooming Products',
    description: 'Rechargeable precision barber clipper set with zero-gap T-blade and premium sandalwood beard oil.',
    price: 380,
    stock: 8,
    rating: 4.8,
    reviewsCount: 15,
    image: '/images/grooming_kit.jpg',
    featured: true
  },
  {
    id: 'prd-3',
    name: 'Velvet Matte Lip Gloss & Eyeshadow Palette',
    category: 'Cosmetics',
    description: '18-shade ultra-pigmented warm eyeshadow palette plus non-sticky hydrating nude lip gloss.',
    price: 160,
    stock: 15,
    rating: 4.9,
    reviewsCount: 29,
    image: '/images/cosmetics_set.jpg',
    featured: true
  },
  {
    id: 'prd-4',
    name: 'Moisturizing Shea Butter Shampoo (250ml)',
    category: 'Hair Products',
    description: 'Sulfate-free deep hydrating shampoo for natural African curls, coils, and locs.',
    price: 65,
    stock: 30,
    rating: 4.7,
    reviewsCount: 19,
    image: '/images/hair_product.jpg',
    featured: false
  },
  {
    id: 'prd-5',
    name: 'Hydro-Boost Face Primer & Setting Spray',
    category: 'Cosmetics',
    description: 'Oil-control setting spray keeping your campus makeup fresh all day in warm weather.',
    price: 110,
    stock: 5, // Low stock demo
    rating: 4.8,
    reviewsCount: 12,
    image: '/images/cosmetics_set.jpg',
    featured: false
  }
];

export const initialStaff = [
  { id: 'stf-1', name: 'Junior "The Fade King"', role: 'Master Barber', rating: 4.9 },
  { id: 'stf-2', name: 'Barber Kasonde', role: 'Barber & Stylist', rating: 4.8 },
  { id: 'stf-3', name: 'Chileshe braids & Wigs', role: 'Senior Hair Stylist', rating: 5.0 },
  { id: 'stf-4', name: 'Natasha Glam & Nails', role: 'Nail Artist & MUA', rating: 4.9 }
];

export const initialTransformations = [
  {
    id: 'tr-1',
    title: 'Burst Fade & Lineup',
    student: 'Mwamba (3rd Year Engineering)',
    service: 'Barbing',
    beforeImg: '/images/barber_service.jpg',
    afterImg: '/images/barber_service.jpg',
    rating: 5
  },
  {
    id: 'tr-2',
    title: 'Knotless Boho Braids Transformation',
    student: 'Thandiwe (2nd Year Law)',
    service: 'Hair Dressing',
    beforeImg: '/images/hair_braids.jpg',
    afterImg: '/images/hair_braids.jpg',
    rating: 5
  }
];

export const initialBookings = [
  {
    id: 'UHS-B8901',
    serviceId: 'srv-1',
    serviceName: 'Fresh Campus Fade & Beard Trim',
    category: 'Barbing',
    price: 80,
    staffName: 'Junior "The Fade King"',
    date: '2026-08-22',
    time: '14:00',
    customerName: 'Kondwani Phiri',
    customerPhone: '0971234567',
    hostel: 'October Hall, Room 14',
    paymentMethod: 'Airtel Money',
    paymentStatus: 'Paid',
    status: 'Confirmed',
    createdAt: '2026-08-21'
  }
];

export const initialOrders = [
  {
    id: 'UHS-ORD-4102',
    items: [
      { id: 'prd-1', name: 'Zambian Miracle Scalp & Growth Oil', price: 95, quantity: 1 }
    ],
    totalAmount: 95,
    customerName: 'Kondwani Phiri',
    customerPhone: '0971234567',
    deliveryType: 'Hostel Delivery',
    hostelDetails: 'Kwatsha Hall, Room 8',
    paymentMethod: 'MTN Mobile Money',
    paymentStatus: 'Paid',
    status: 'Ready for Pickup',
    createdAt: '2026-08-21'
  }
];
