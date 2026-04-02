// Mock hotel database for property search
export const MOCK_HOTELS = [
  {
    name: 'Hotel & Spa & Resort Marken',
    address: 'Havenbuurt 15',
    city: 'Marken',
    country: 'Netherlands',
    stars: 4,
    rooms: 22,
    type: 'Boutique Hotel',
    lat: 52.4588,
    lng: 5.1043,
  },
  {
    name: 'Maison Proust',
    address: '7 Rue Marcel Proust',
    city: 'Paris',
    country: 'France',
    stars: 4,
    rooms: 77,
    type: 'Boutique Hotel',
    lat: 48.8566,
    lng: 2.3522,
  },
  {
    name: 'Grand Hotel Milano',
    address: 'Via Roma 1',
    city: 'Milan',
    country: 'Italy',
    stars: 4,
    rooms: 24,
    type: 'Boutique Hotel',
    lat: 45.4642,
    lng: 9.1900,
  },
  {
    name: 'The Harbour Inn',
    address: '42 Harbour Road',
    city: 'Amsterdam',
    country: 'Netherlands',
    stars: 3,
    rooms: 18,
    type: 'Inn',
    lat: 52.3676,
    lng: 4.9041,
  },
  {
    name: 'Pension Rosa',
    address: 'Calle de las Flores 8',
    city: 'Barcelona',
    country: 'Spain',
    stars: 3,
    rooms: 12,
    type: 'Guesthouse',
    lat: 41.3874,
    lng: 2.1686,
  },
  {
    name: 'Albergo Bellini',
    address: 'Via Bellini 23',
    city: 'Florence',
    country: 'Italy',
    stars: 3,
    rooms: 16,
    type: 'Hotel',
    lat: 43.7696,
    lng: 11.2558,
  },
  {
    name: 'Das Alpenhaus',
    address: 'Bergstrasse 5',
    city: 'Innsbruck',
    country: 'Austria',
    stars: 4,
    rooms: 30,
    type: 'Mountain Lodge',
    lat: 47.2692,
    lng: 11.4041,
  },
  {
    name: 'The White Lion',
    address: '12 High Street',
    city: 'Bath',
    country: 'United Kingdom',
    stars: 3,
    rooms: 14,
    type: 'Inn',
    lat: 51.3811,
    lng: -2.3590,
  },
  {
    name: 'Boutique Hotel Luzern',
    address: 'Seestrasse 18',
    city: 'Lucerne',
    country: 'Switzerland',
    stars: 4,
    rooms: 28,
    type: 'Boutique Hotel',
    lat: 47.0502,
    lng: 8.3093,
  },
  {
    name: 'Villa Sophia',
    address: 'Leoforos Poseidonos 45',
    city: 'Athens',
    country: 'Greece',
    stars: 4,
    rooms: 20,
    type: 'Villa Hotel',
    lat: 37.9838,
    lng: 23.7275,
  },
]

// Mock competitor data generator based on city
export function getMockCompetitors(city) {
  const competitors = {
    Marken: [
      { id: 1, name: 'Volendam Beach Hotel', dist: '3.2 km', stars: 3 },
      { id: 2, name: 'Waterland Suites', dist: '5.1 km', stars: 4 },
      { id: 3, name: 'IJsselmeer Grand', dist: '8.0 km', stars: 4 },
      { id: 4, name: 'Het Houten Huis', dist: '1.5 km', stars: 3 },
      { id: 5, name: 'Pension de Haven', dist: '0.8 km', stars: 2 },
    ],
    Paris: [
      { id: 1, name: 'Hotel Le Marais', dist: '0.3 km', stars: 4 },
      { id: 2, name: 'Boutique Saint-Germain', dist: '0.5 km', stars: 4 },
      { id: 3, name: 'Le Petit Cler', dist: '0.8 km', stars: 3 },
      { id: 4, name: 'Hotel des Arts', dist: '1.1 km', stars: 3 },
      { id: 5, name: 'Maison Montmartre', dist: '2.0 km', stars: 4 },
    ],
    Milan: [
      { id: 1, name: 'Palazzo Duomo', dist: '0.2 km', stars: 4 },
      { id: 2, name: 'Hotel Navigli', dist: '0.6 km', stars: 3 },
      { id: 3, name: 'Boutique Brera', dist: '0.4 km', stars: 4 },
      { id: 4, name: 'Residenza Garibaldi', dist: '0.9 km', stars: 3 },
      { id: 5, name: 'Milano Central Inn', dist: '1.3 km', stars: 3 },
    ],
    default: [
      { id: 1, name: 'City Center Hotel', dist: '0.3 km', stars: 4 },
      { id: 2, name: 'The Grand Boutique', dist: '0.5 km', stars: 4 },
      { id: 3, name: 'Harbour View Inn', dist: '0.8 km', stars: 3 },
      { id: 4, name: 'Old Town Pension', dist: '1.1 km', stars: 3 },
      { id: 5, name: 'Riverside Lodge', dist: '1.5 km', stars: 3 },
    ],
  }
  return competitors[city] || competitors.default
}

// Mock room data generated from "PMS"
export function getMockRooms(hotelRoomCount) {
  const count = hotelRoomCount || 20
  const types = []
  if (count <= 15) {
    const base = 95
    types.push({
      id: 1, name: 'Standard Double', count: Math.ceil(count * 0.5), baseRate: base, isBase: true,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: 0,
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 103,
    })
    types.push({
      id: 2, name: 'Superior Room', count: Math.ceil(count * 0.3), baseRate: 130, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((130 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 139,
    })
    types.push({
      id: 3, name: 'Junior Suite', count: Math.max(1, Math.floor(count * 0.2)), baseRate: 175, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((175 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 3, maxKids: 1, maxBabies: 1,
      otaPrice: 189,
    })
  } else if (count <= 30) {
    const base = 110
    types.push({
      id: 1, name: 'Classic Double', count: Math.ceil(count * 0.35), baseRate: base, isBase: true,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: 0,
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 119,
    })
    types.push({
      id: 2, name: 'Superior Twin', count: Math.ceil(count * 0.25), baseRate: 140, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((140 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 151,
    })
    types.push({
      id: 3, name: 'Deluxe King', count: Math.ceil(count * 0.2), baseRate: 180, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((180 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 195,
    })
    types.push({
      id: 4, name: 'Junior Suite', count: Math.max(1, Math.floor(count * 0.15)), baseRate: 240, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((240 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 3, maxKids: 1, maxBabies: 1,
      otaPrice: 259,
    })
    types.push({
      id: 5, name: 'Family Room', count: Math.max(1, Math.floor(count * 0.05)), baseRate: 160, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((160 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 3, minGuests: 2, maxGuests: 4, maxKids: 2, maxBabies: 1,
      otaPrice: 174,
    })
  } else {
    const base = 120
    types.push({
      id: 1, name: 'Standard Room', count: Math.ceil(count * 0.3), baseRate: base, isBase: true,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: 0,
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 129,
    })
    types.push({
      id: 2, name: 'Superior Double', count: Math.ceil(count * 0.2), baseRate: 155, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((155 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 167,
    })
    types.push({
      id: 3, name: 'Deluxe Room', count: Math.ceil(count * 0.2), baseRate: 195, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((195 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 2, maxKids: 1, maxBabies: 1,
      otaPrice: 210,
    })
    types.push({
      id: 4, name: 'Junior Suite', count: Math.ceil(count * 0.15), baseRate: 260, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((260 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 3, maxKids: 1, maxBabies: 1,
      otaPrice: 280,
    })
    types.push({
      id: 5, name: 'Executive Suite', count: Math.ceil(count * 0.1), baseRate: 340, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((340 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 2, minGuests: 1, maxGuests: 3, maxKids: 1, maxBabies: 1,
      otaPrice: 369,
    })
    types.push({
      id: 6, name: 'Family Room', count: Math.max(1, Math.floor(count * 0.05)), baseRate: 175, isBase: false,
      offsetDirection: '+', offsetType: 'percentage', offsetValue: Math.round((175 / base - 1) * 100),
      bookableOnline: true, defaultGuests: 3, minGuests: 2, maxGuests: 4, maxKids: 2, maxBabies: 1,
      otaPrice: 189,
    })
  }
  return types
}

export const PMS_OPTIONS = [
  { id: 'mews', name: 'Mews', logo: 'M', color: '#1B1464', desc: 'Cloud-native PMS' },
  { id: 'cloudbeds', name: 'Cloudbeds', logo: 'C', color: '#00A3E0', desc: 'All-in-one platform' },
  { id: 'opera', name: 'Opera Cloud', logo: 'O', color: '#C74634', desc: 'Oracle Hospitality' },
  { id: 'other', name: 'Other PMS', logo: '?', color: '#6B7280', desc: "I'll tell you which" },
]

export const OTA_OPTIONS = [
  { id: 'booking',     name: 'Booking.com',   brand: 'booking',     color: '#0c3b7c', commission: '15%' },
  { id: 'expedia',     name: 'Expedia Group',  brand: 'expedia',     color: '#fddb32', commission: '18%' },
  { id: 'airbnb',      name: 'Airbnb',         brand: 'airbnb',      color: '#ff5a5f', commission: '3%' },
  { id: 'agoda',       name: 'Agoda',          brand: 'agoda',       color: '#ffffff', commission: '15%' },
]

export const NORTH_STAR_OPTIONS = [
  { id: 'profit', name: 'Profit', desc: 'Total bottom-line profit across all channels', recommended: true },
  { id: 'revpar', name: 'RevPAR', desc: 'Revenue per available room' },
  { id: 'adr', name: 'ADR', desc: 'Average daily rate' },
  { id: 'occupancy', name: 'Occupancy', desc: 'Room occupancy rate' },
  { id: 'goppar', name: 'GOPPAR', desc: 'Gross operating profit per available room' },
]

export const ROLE_OPTIONS = [
  { id: 'owner', label: 'Owner', desc: 'I own the property' },
  { id: 'gm', label: 'General Manager', desc: 'I manage day-to-day operations' },
  { id: 'rm', label: 'Revenue Manager', desc: 'I handle pricing & distribution' },
  { id: 'other', label: 'Other', desc: 'Something else — I\'ll specify' },
]
