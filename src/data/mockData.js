// Seed Data for UniHairShop Zambia

export const lusakaUniversities = Object.freeze([
  { id: 'uni-1', name: 'UNILUS Silverest Campus', shortName: 'UNILUS Silverest', area: 'Chongwe / Silverest, Lusaka', travelFee: 20 },
  { id: 'uni-2', name: 'UNILUS Pioneer Campus', shortName: 'UNILUS Pioneer', area: 'Mass Media, Lusaka', travelFee: 25 },
  { id: 'uni-3', name: 'UNZA Great East Road Campus', shortName: 'UNZA Great East', area: 'Great East Road, Lusaka', travelFee: 20 },
  { id: 'uni-4', name: 'UNZA Ridgeway Campus', shortName: 'UNZA Ridgeway', area: 'Ridgeway, Lusaka', travelFee: 25 },
  { id: 'uni-5', name: 'Cavendish University Zambia', shortName: 'Cavendish', area: 'Longacres / Main Campus, Lusaka', travelFee: 20 },
  { id: 'uni-6', name: 'Lusaka Apex Medical University (LAMU)', shortName: 'Apex Medical', area: 'Chalala & Foxdale, Lusaka', travelFee: 30 },
  { id: 'uni-7', name: 'Texila American University Zambia', shortName: 'Texila American', area: 'Lilayi, Lusaka', travelFee: 30 },
  { id: 'uni-8', name: 'Zambia Open University (ZAOU)', shortName: 'ZAOU', area: 'Waterfalls, Lusaka', travelFee: 25 },
  { id: 'uni-9', name: 'Information & Communications University (ICU)', shortName: 'ICU Zambia', area: 'Mass Media, Lusaka', travelFee: 25 },
  { id: 'uni-10', name: 'National Institute of Public Administration (NIPA)', shortName: 'NIPA', area: 'Dapeza, Lusaka', travelFee: 20 }
]);

export const initialStaff = Object.freeze([
  {
    id: 'stf-1',
    name: 'Junior "The Fade King"',
    role: 'Master Barber',
    avatar: '/images/barber_service.jpg',
    campus: 'UNILUS Silverest Campus',
    dormLocation: 'Silverest Hostel, Block C, Room 14',
    rating: 4.9,
    reviewsCount: 148,
    isVerified: true,
    badge: 'Verified Campus Stylist',
    responseTime: '~5 mins',
    completedCount: 430,
    specialties: ['Taper Fade', 'Burst Fade', 'Beard Lineup', 'Hot Towel Treatment'],
    travelsToDorm: true,
    hasStudio: true,
    bio: 'Campus favorite barber at UNILUS Silverest. 4+ years of precision fades and beard sculpting. I travel to student rooms or host in Block C!',
    portfolio: [
      { id: 'port-1', image: '/images/barber_service.jpg', tag: 'Low Taper Fade', client: 'Mwamba (UNILUS)' },
      { id: 'port-2', image: '/images/barber_service.jpg', tag: 'Sharp Lineup & Beard', client: 'Chimwemwe (UNILUS)' },
      { id: 'port-3', image: '/images/barber_service.jpg', tag: 'Textured Crop Cut', client: 'Bwalya (UNZA)' }
    ],
    reviews: [
      { id: 'rev-1', student: 'Mwamba K.', rating: 5, date: 'Yesterday', text: 'Best fade on campus hands down! Came right to my room in Block A.', verifiedDorm: true },
      { id: 'rev-2', student: 'Chola M.', rating: 5, date: '3 days ago', text: 'Clean clippers, super fast, and very professional.', verifiedDorm: true }
    ]
  },
  {
    id: 'stf-2',
    name: 'Chileshe Braids & Wigs',
    role: 'Senior Braider & Wig Specialist',
    avatar: '/images/hair_braids.jpg',
    campus: 'UNILUS Silverest Campus',
    dormLocation: 'Silverest Block F, Flat 02',
    rating: 5.0,
    reviewsCount: 192,
    isVerified: true,
    badge: 'Top Rated Stylist',
    responseTime: '~8 mins',
    completedCount: 512,
    specialties: ['Knotless Braids', 'Boho Curls', 'Frontal Melt', 'Loc Retwist'],
    travelsToDorm: true,
    hasStudio: true,
    bio: 'Certified hair stylist & 3rd year law student. Painless knotless braiding, scalp-friendly parting, and flawless frontal lace melts.',
    portfolio: [
      { id: 'port-4', image: '/images/hair_braids.jpg', tag: 'Medium Knotless Braids', client: 'Thandiwe (UNILUS)' },
      { id: 'port-5', image: '/images/hair_braids.jpg', tag: 'French Curl Braids', client: 'Sepo (Cavendish)' },
      { id: 'port-6', image: '/images/hair_braids.jpg', tag: 'Wig Melt & Styling', client: 'Mutinta (UNZA)' }
    ],
    reviews: [
      { id: 'rev-3', student: 'Thandiwe N.', rating: 5, date: '2 days ago', text: 'My knotless braids lasted 6 weeks! Neat parts and zero tension.', verifiedDorm: true },
      { id: 'rev-4', student: 'Sepo K.', rating: 5, date: '1 week ago', text: 'She did my hair right in my room before our campus gala. 10/10!', verifiedDorm: true }
    ]
  },
  {
    id: 'stf-3',
    name: 'Natasha Glam & Nail Bar',
    role: 'Nail Artist & MUA',
    avatar: '/images/nail_art.jpg',
    campus: 'UNZA Great East Road Campus',
    dormLocation: 'October Hall, Room 28',
    rating: 4.9,
    reviewsCount: 116,
    isVerified: true,
    badge: 'Verified Student Artist',
    responseTime: '~10 mins',
    completedCount: 290,
    specialties: ['Acrylic Full Sets', 'Chrome Nails', 'Soft Glam Makeup', 'Lash Extensions'],
    travelsToDorm: true,
    hasStudio: true,
    bio: 'UNZA campus nail tech and glam artist. Long-lasting acrylics, trendy 3D nail charms, and camera-ready event makeup.',
    portfolio: [
      { id: 'port-7', image: '/images/nail_art.jpg', tag: 'French Chrome Acrylics', client: 'Kondwani (UNZA)' },
      { id: 'port-8', image: '/images/makeup_glam.jpg', tag: 'Evening Glam Glow', client: 'Lombe (UNZA)' }
    ],
    reviews: [
      { id: 'rev-5', student: 'Lombe C.', rating: 5, date: '4 days ago', text: 'My acrylic set is still rock solid after 3 weeks. Absolutely love her work.', verifiedDorm: true }
    ]
  },
  {
    id: 'stf-4',
    name: 'Barber Kasonde',
    role: 'Barber & Dreadlocks Specialist',
    avatar: '/images/barber_service.jpg',
    campus: 'UNILUS Silverest Campus',
    dormLocation: 'Student Centre Pavilion',
    rating: 4.8,
    reviewsCount: 84,
    isVerified: true,
    badge: 'Locs Specialist',
    responseTime: '~15 mins',
    completedCount: 210,
    specialties: ['Loc Interlocking', 'Skin Fade', 'Beard Dye', 'Scalp Detox'],
    travelsToDorm: false,
    hasStudio: true,
    bio: 'Located at the campus Student Centre. Specialist in starter locs, palm rolling, and razor skin fades.',
    portfolio: [
      { id: 'port-9', image: '/images/barber_service.jpg', tag: 'Loc Maintenance & Fade', client: 'Derrick (UNILUS)' }
    ],
    reviews: [
      { id: 'rev-6', student: 'Derrick P.', rating: 5, date: 'Last week', text: 'Best loc retwist in Silverest area.', verifiedDorm: true }
    ]
  }
]);

export const initialServices = Object.freeze([
  {
    id: 'srv-1',
    name: 'Fresh Campus Fade & Beard Trim',
    category: 'Barbering',
    description: 'Crisp low/mid/high taper fade with razor edge lining, hot towel finish, and beard oil nourishment.',
    duration: 35,
    price: 80,
    image: '/images/barber_service.jpg',
    popular: true,
    canTravel: true,
    inStudio: true,
    staffIds: ['stf-1', 'stf-4'],
    addOns: [
      { id: 'add-1', name: 'Beard Sculpt & Hydro Oil', price: 20, duration: 10 },
      { id: 'add-2', name: 'Black Mask Exfoliation', price: 30, duration: 15 },
      { id: 'add-3', name: 'Temporary Edge Enhancer / Tint', price: 15, duration: 5 }
    ]
  },
  {
    id: 'srv-2',
    name: 'Knotless Braids (Medium/Long)',
    category: 'Braids & Natural Hair',
    description: 'Neat, weightless knotless braids with neat parting, dipped ends, and scalp oil treatment.',
    duration: 180,
    price: 250,
    image: '/images/hair_braids.jpg',
    popular: true,
    canTravel: true,
    inStudio: true,
    staffIds: ['stf-2'],
    addOns: [
      { id: 'add-4', name: 'Curly Human Hair Ends (Boho)', price: 60, duration: 25 },
      { id: 'add-5', name: 'Wash & Deep Condition Blowout', price: 40, duration: 20 },
      { id: 'add-6', name: 'Beads / Gold Hair Accessories', price: 25, duration: 10 }
    ]
  },
  {
    id: 'srv-3',
    name: 'Luxury Acrylic Nails & Custom Art',
    category: 'Nails & Lashes',
    description: 'Full set acrylic extensions with custom nail art, rhinestones, French tips, or chrome polish.',
    duration: 60,
    price: 150,
    image: '/images/nail_art.jpg',
    popular: true,
    canTravel: true,
    inStudio: true,
    staffIds: ['stf-3'],
    addOns: [
      { id: 'add-7', name: 'Swarovski Crystal Accents', price: 30, duration: 10 },
      { id: 'add-8', name: 'Gel Pedicure Add-on', price: 50, duration: 25 },
      { id: 'add-9', name: 'Soak-off Old Set', price: 25, duration: 15 }
    ]
  },
  {
    id: 'srv-4',
    name: 'Full Glam Campus Makeup',
    category: 'Nails & Lashes',
    description: 'Long-lasting soft or full glam makeup with luxury mink lashes, contouring, and glossy lip finish.',
    duration: 45,
    price: 180,
    image: '/images/makeup_glam.jpg',
    popular: true,
    canTravel: true,
    inStudio: true,
    staffIds: ['stf-3'],
    addOns: [
      { id: 'add-10', name: '25mm Fluffy 3D Lashes', price: 25, duration: 5 },
      { id: 'add-11', name: 'Eyebrow Wax & Tint', price: 35, duration: 15 }
    ]
  },
  {
    id: 'srv-5',
    name: 'Dreadlocks Retwist & Scalp Scrub',
    category: 'Locs',
    description: 'Deep cleansing scalp detox, palm roll interlocking, and nourishing tea tree mist.',
    duration: 75,
    price: 160,
    image: '/images/barber_service.jpg',
    popular: false,
    canTravel: true,
    inStudio: true,
    staffIds: ['stf-4', 'stf-2'],
    addOns: [
      { id: 'add-12', name: 'Hot Oil Scalp Treatment', price: 30, duration: 15 },
      { id: 'add-13', name: 'Custom Loc Style (Barrel / Fishtail)', price: 35, duration: 20 }
    ]
  },
  {
    id: 'srv-6',
    name: 'Frontal Wig Installation & Melt',
    category: 'Wigs & Weaves',
    description: 'Frontal or closure wig lace melt, plucking, bleaching knots, braid-down, and custom styling.',
    duration: 90,
    price: 200,
    image: '/images/hair_braids.jpg',
    popular: true,
    canTravel: true,
    inStudio: true,
    staffIds: ['stf-2'],
    addOns: [
      { id: 'add-14', name: 'Wig Wash & Revitalize', price: 40, duration: 20 },
      { id: 'add-15', name: 'Curling & Barrel Wand Styling', price: 35, duration: 15 }
    ]
  }
]);

export const initialProducts = Object.freeze([
  {
    id: 'prd-1',
    name: 'Zambian Miracle Scalp & Growth Oil (100ml)',
    category: 'Hair Care Products',
    description: 'Nourishing cold-pressed coconut, castor, and rosemary oil enriched with Vitamin E for fast scalp regrowth and edge retention.',
    price: 95,
    stock: 24,
    rating: 4.9,
    reviewsCount: 42,
    image: '/images/hair_product.jpg',
    featured: true
  },
  {
    id: 'prd-2',
    name: 'Pro Cordless Barber Clipper & Beard Care Set',
    category: 'Hair Care Products',
    description: 'Rechargeable precision hair clipper set with zero-gap T-blade, guard combs, and sandalwood beard balm.',
    price: 380,
    stock: 8,
    rating: 4.8,
    reviewsCount: 18,
    image: '/images/grooming_kit.jpg',
    featured: true
  },
  {
    id: 'prd-3',
    name: 'Velvet Matte Lip Gloss & Eyeshadow Palette',
    category: 'Nails & Lashes',
    description: '18-shade ultra-pigmented warm eyeshadow palette plus non-sticky hydrating nude lip gloss for campus life.',
    price: 160,
    stock: 15,
    rating: 4.9,
    reviewsCount: 31,
    image: '/images/cosmetics_set.jpg',
    featured: true
  },
  {
    id: 'prd-4',
    name: 'Moisturizing Shea Butter Shampoo & Conditioner (250ml)',
    category: 'Hair Care Products',
    description: 'Sulfate-free deep hydrating shampoo for natural African curls, coils, locs, and braided hair.',
    price: 65,
    stock: 30,
    rating: 4.7,
    reviewsCount: 22,
    image: '/images/hair_product.jpg',
    featured: false
  },
  {
    id: 'prd-5',
    name: 'Sleek Silk Bonnet & 24hr Edge Control Duo',
    category: 'Hair Care Products',
    description: 'Double-layer reversible silk satin bonnet to prevent breakage, paired with max-hold non-flaking edge control.',
    price: 85,
    stock: 28,
    rating: 5.0,
    reviewsCount: 54,
    image: '/images/hair_product.jpg',
    featured: true
  }
]);

export const initialBundles = Object.freeze([
  {
    id: 'bnd-1',
    title: 'Student Night Care & Edge Kit',
    tagline: 'Best Seller for Braids & Natural Hair',
    items: ['Sleek Silk Bonnet', '24hr Edge Control', 'Miracle Growth Oil'],
    originalPrice: 180,
    bundlePrice: 145,
    savings: 'Save K35 (20%)',
    image: '/images/hair_product.jpg',
    productIds: ['prd-1', 'prd-5']
  },
  {
    id: 'bnd-2',
    title: 'Campus Grooming & Beard Essentials',
    tagline: 'Complete Fresh Cut & Beard Setup',
    items: ['Pro Cordless Clipper Set', 'Miracle Beard & Scalp Oil'],
    originalPrice: 475,
    bundlePrice: 399,
    savings: 'Save K76 (16%)',
    image: '/images/grooming_kit.jpg',
    productIds: ['prd-2', 'prd-1']
  }
]);

export const initialConversations = Object.freeze([
  {
    stylistId: 'stf-1',
    stylistName: 'Junior "The Fade King"',
    stylistRole: 'Master Barber',
    avatar: '/images/barber_service.jpg',
    unreadCount: 1,
    lastMessage: "I'm ready at Block C, Room 14! Or let me know if you prefer me to come over to Block A.",
    lastTimestamp: '10:45 AM',
    messages: [
      { id: 'm-1', sender: 'stylist', text: 'Hey Kondwani! Thanks for booking the Fresh Campus Fade.', time: '10:30 AM' },
      { id: 'm-2', sender: 'user', text: 'Hey Junior! Will you bring the hot towel and beard oil?', time: '10:38 AM' },
      { id: 'm-3', sender: 'stylist', text: "Yes absolutely! I have everything packed in my kit. I'm ready at Block C, Room 14! Or let me know if you prefer me to come over to Block A.", time: '10:45 AM' }
    ]
  },
  {
    stylistId: 'stf-2',
    stylistName: 'Chileshe Braids & Wigs',
    stylistRole: 'Senior Braider',
    avatar: '/images/hair_braids.jpg',
    unreadCount: 0,
    lastMessage: 'Sure, 3 packs of Darling French Curl expression hair is perfect!',
    lastTimestamp: 'Yesterday',
    messages: [
      { id: 'm-4', sender: 'user', text: 'Hi Chileshe! What braiding hair packs should I get for the knotless braids?', time: 'Yesterday' },
      { id: 'm-5', sender: 'stylist', text: 'Sure, 3 packs of Darling French Curl expression hair is perfect!', time: 'Yesterday' }
    ]
  }
]);

export const initialBookings = Object.freeze([
  {
    id: 'UHS-B8901',
    serviceId: 'srv-1',
    serviceName: 'Fresh Campus Fade & Beard Trim',
    category: 'Barbering',
    price: 80,
    selectedAddOns: [{ id: 'add-1', name: 'Beard Sculpt & Hydro Oil', price: 20 }],
    serviceType: 'Travel to Dorm',
    travelFee: 20,
    serviceFee: 5,
    totalPrice: 125,
    staffId: 'stf-1',
    staffName: 'Junior "The Fade King"',
    date: '2026-08-24',
    time: '14:00',
    campus: 'UNILUS Silverest Campus',
    customerName: 'Kondwani Phiri',
    customerPhone: '0971234567',
    hostel: 'UNILUS Silverest Hostel, Block C, Room 14',
    paymentMethod: 'Airtel Money',
    paymentStatus: 'Paid',
    status: 'Confirmed',
    createdAt: '2026-08-23'
  }
]);

export const initialOrders = Object.freeze([
  {
    id: 'UHS-ORD-4102',
    items: [
      { id: 'prd-1', name: 'Zambian Miracle Scalp & Growth Oil (100ml)', price: 95, quantity: 1 }
    ],
    totalAmount: 95,
    campus: 'UNILUS Silverest Campus',
    customerName: 'Kondwani Phiri',
    customerPhone: '0971234567',
    deliveryType: 'Hostel Delivery',
    hostelDetails: 'UNILUS Silverest Hostel, Block A, Room 12',
    paymentMethod: 'MTN Mobile Money',
    paymentStatus: 'Paid',
    status: 'Processing',
    createdAt: '2026-08-23'
  }
]);

export const initialTransformations = Object.freeze([
  {
    id: 'tr-1',
    title: 'Burst Fade & Lineup',
    student: 'Mwamba (UNILUS Silverest)',
    service: 'Barbing',
    beforeImg: '/images/barber_service.jpg',
    afterImg: '/images/barber_service.jpg',
    rating: 5
  },
  {
    id: 'tr-2',
    title: 'Knotless Boho Braids Transformation',
    student: 'Thandiwe (UNILUS Silverest)',
    service: 'Hair Dressing',
    beforeImg: '/images/hair_braids.jpg',
    afterImg: '/images/hair_braids.jpg',
    rating: 5
  }
]);

