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

export const campusHostels = Object.freeze({
  'UNILUS Silverest Campus': [
    'Hostel Block A',
    'Hostel Block B',
    'Hostel Block C',
    'Hostel Block D',
    'Silverest Annex Hostels',
    'Silverest Off-Campus Boarding'
  ],
  'UNILUS Pioneer Campus': [
    'Mass Media Residences',
    'Parklands Flats',
    'Longacres Hostels',
    'Kalingalinga Residences'
  ],
  'UNZA Great East Road Campus': [
    'October Hall',
    'Soweto Hall',
    'Presidents Hall',
    'Kwacha Hall',
    'Africa Hall',
    'Kalingalinga Student Hostels',
    'Vet Hall',
    'Handsworth Hostels',
    'International Students Hall'
  ],
  'UNZA Ridgeway Campus': [
    'Ridgeway Medical Hostels',
    'UTH Student Quarters',
    'Cathedral Hill Residences'
  ],
  'Cavendish University Zambia': [
    'Villa Elizabetha Hostels',
    'Longacres Student Houses',
    'Main Campus Annex'
  ],
  'Lusaka Apex Medical University (LAMU)': [
    'Chalala Campus Hostels',
    'Foxdale Student Residences',
    'Woodlands Annex'
  ],
  'Texila American University Zambia': [
    'Lilayi Campus Residences',
    'Southgate Student Flats'
  ],
  'Zambia Open University (ZAOU)': [
    'Waterfalls Hostels',
    'Silverest Student Boarding'
  ],
  'Information & Communications University (ICU)': [
    'Mass Media Hostels',
    'Sunningdale Residences'
  ],
  'National Institute of Public Administration (NIPA)': [
    'Main Campus Hostels',
    'Dapeza Residences'
  ]
});

// No stylists are seeded — real stylists sign up and get verified through
// the normal onboarding flow (AuthGuard/onboardAsStylist), then appear here
// live from Supabase.
export const initialStaff = Object.freeze([]);

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
    staffIds: [],
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
    staffIds: [],
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
    staffIds: [],
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
    staffIds: [],
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
    staffIds: [],
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
    staffIds: [],
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
    rating: 0,
    reviewsCount: 0,
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
    rating: 0,
    reviewsCount: 0,
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
    rating: 0,
    reviewsCount: 0,
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
    rating: 0,
    reviewsCount: 0,
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
    rating: 0,
    reviewsCount: 0,
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

export const initialConversations = Object.freeze([]);

export const initialBookings = Object.freeze([]);

export const initialOrders = Object.freeze([]);

