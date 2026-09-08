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

// No services are seeded — real stylists add their own services through
// Vendor Studio (addService), then they appear here live from Supabase.
export const initialServices = Object.freeze([]);

// No products are seeded — vendors list their own products through My Shop
// (addProduct), then they appear here live from Supabase.
export const initialProducts = Object.freeze([]);

// No bundles are seeded — there is currently no admin/vendor feature to
// create a real one, so this stays empty rather than promoting fake combo
// deals for products that don't exist.
export const initialBundles = Object.freeze([]);

export const initialConversations = Object.freeze([]);

export const initialBookings = Object.freeze([]);

export const initialOrders = Object.freeze([]);

