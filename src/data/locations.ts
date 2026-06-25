export interface LocationData {
  id: string
  name: string
  subheading?: string
  period?: string
  description?: string
  coordinates: string
  lat: number
  lng: number
  photo: string
  photos?: string[]
  photoPositions?: string[]
  photoScale?: number
}

export const locations: LocationData[] = [
  {
    id: 'bellevue',
    name: 'Bellevue, Washington',
    subheading: 'HOMETOWN',
    period: '2008-2012 · 2013-2024',
    description:
      'A small city on the eastern shore of Lake Washington, directly across from Seattle. I grew up here swimming competitively, skiing in the Cascades, and absorbing Seattle\'s tech culture — which sparked an early zest for entrepreneurship.',
    coordinates: '47.6104° N, 122.2007° W',
    lat: 47.6104,
    lng: -122.2007,
    photo: '/bellevue.jpg',
  },
  {
    id: 'upenn',
    name: 'University of Pennsylvania',
    subheading: 'UNIVERSITY',
    period: '2024-2028',
    description:
      'My current home! I\'m studying International Studies and Business in the Huntsman Program, concentrating in Entrepreneurship and Real Estate at Wharton. Outside the classroom, I enjoy runs on the Schuylkill trail or dinners with friends.',
    coordinates: '39.9522° N, 75.1934° W',
    lat: 39.9522,
    lng: -75.1934,
    photo: '/upenn.jpg',
  },
  {
    id: 'philadelphia',
    name: 'Philadelphia, Pennsylvania',
    subheading: 'REALTOR',
    period: 'Oct 2024 — May 2025',
    description:
      'I got my Pennsylvania real estate license during my first year at Penn and spent a year representing clients through the full buying process — cold calling, open houses, negotiation, closing. Developed a deep appreciation for what it takes to earn someone\'s trust with the biggest purchase of their life.',
    coordinates: '39.9526° N, 75.1652° W',
    lat: 39.9526,
    lng: -75.1652,
    photo: '/philadelphia-realtor.jpg',
  },
  {
    id: 'madrid',
    name: 'Madrid, Spain',
    subheading: 'REAL ESTATE ESG INTERN & AI RESEARCH ASSISTANT',
    period: 'June — August 2025',
    description:
      'Where I spent my freshman summer on a Wharton Research Assistantship grant. Aside from soaking up the culture and food, I had the opportunity to work on B-Corp certification with sustainable consulting firm Asla Green Solutions and research on AI in governance with a professor at Universidad de la Rioja.',
    coordinates: '40.4168° N, 3.7038° W',
    lat: 40.4168,
    lng: -3.7038,
    photo: '/madrid/madrid-1.png',
    photos: [
      '/madrid/madrid-1.png',
      '/madrid/madrid-2.png',
      '/madrid/madrid-3.png',
      '/madrid/madrid-4.png',
      '/madrid/madrid-5.png',
    ],
    photoPositions: ['center center', 'center center', 'center 8%', 'center center', 'center center'],
  },
  {
    id: 'kuala-lumpur',
    name: 'Kuala Lumpur, Malaysia',
    subheading: 'CORPORATE DEVELOPMENT INTERN',
    period: 'June — August 2026',
    coordinates: '3.1579° N, 101.7116° E',
    lat: 3.1579,
    lng: 101.7116,
    photo: '/kuala-lumpur.jpg',
    photoPositions: ['50% 45%'],
    photoScale: 1.25,
  },
  {
    id: 'singapore',
    name: 'Singapore',
    subheading: 'FORMER HOME',
    period: '2012-2013',
    description:
      'Where I lived for a year while my dad worked in the region. It was an unforgettable year of meeting people from all corners of the world, and travelling around Southeast Asia.',
    coordinates: '1.2834° N, 103.8607° E',
    lat: 1.2834,
    lng: 103.8607,
    photo: '/singapore.png',
  },
  {
    id: 'buenos-aires',
    name: 'Buenos Aires, Argentina',
    period: '2026 · 2008',
    description:
      'Last visited on a Huntsman Global Immersion trip. We met with MercadoLibre, energy infrastructure leaders, the U.S. Ambassador, and Argentina\'s Minister of Foreign Affairs. A front-row look at one of the world\'s most volatile and fascinating economies.',
    coordinates: '34.6037° S, 58.3816° W',
    lat: -34.6037,
    lng: -58.3816,
    photo: '/buenos-aires.jpg',
    photoPositions: ['center 72%'],
  },
  {
    id: 'sacred-valley',
    name: 'Sacred Valley, Peru',
    period: '2022',
    description:
      'Visited Willka T\'ika Retreat and lived with an indigenous family in Chinchero.',
    coordinates: '13.3328° S, 72.0845° W',
    lat: -13.3328,
    lng: -72.0845,
    photo: '/cusco.jpg',
  },
  {
    id: 'mexico-city',
    name: 'Mexico City, Mexico',
    period: '2023',
    coordinates: '19.4326° N, 99.1332° W',
    lat: 19.4326,
    lng: -99.1332,
    photo: '/mexico-city.jpg',
  },
  {
    id: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City, Vietnam',
    period: '2024',
    coordinates: '10.8231° N, 106.6297° E',
    lat: 10.8231,
    lng: 106.6297,
    photo: '/ho-chi-minh-city.jpg',
  },
  {
    id: 'bridgetown',
    name: 'Bridgetown, Barbados',
    period: '2018',
    coordinates: '13.0969° N, 59.6132° W',
    lat: 13.0969,
    lng: -59.6132,
    photo: '/bridgetown.jpg',
  },
  {
    id: 'washington-dc',
    name: 'Washington, D.C.',
    period: '2025 · 2021',
    coordinates: '38.8977° N, 77.0365° W',
    lat: 38.8977,
    lng: -77.0365,
    photo: '/washington-dc.jpg',
    photoPositions: ['50% 83%'],
    photoScale: 1.4,
  },
  {
    id: 'nyc',
    name: 'New York City, NY',
    period: 'Last visited May 2026',
    coordinates: '40.7587° N, 73.9787° W',
    lat: 40.7587,
    lng: -73.9787,
    photo: '/nyc.jpg',
  },
  {
    id: 'kumano-kodo',
    name: 'Kumano Kodo, Japan',
    period: '2024',
    description:
      'Solo backpacked for a week, staying in ryokans along the trail. A deeply spiritual and transformative trip at the end of high school.',
    coordinates: '33.8408° N, 135.7736° E',
    lat: 33.8408,
    lng: 135.7736,
    photo: '/kumano-kodo.jpg',
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    period: '2025 · 2018',
    description: 'Skiing, sushi, skincare. Enough said.',
    coordinates: '35.6762° N, 139.6503° E',
    lat: 35.6762,
    lng: 139.6503,
    photo: '/tokyo.jpg',
  },
  {
    id: 'ann-arbor',
    name: 'Ann Arbor, MI',
    subheading: 'WHERE IT ALL STARTED',
    description: 'GO BLUE.',
    coordinates: '42.2808° N, 83.7430° W',
    lat: 42.2808,
    lng: -83.743,
    photo: '/ann-arbor.jpg',
  },
  {
    id: 'chicago',
    name: 'Chicago, Illinois',
    period: '2026 · 2021 · 2015',
    coordinates: '41.8781° N, 87.6298° W',
    lat: 41.8781,
    lng: -87.6298,
    photo: '/chicago.jpg',
  },
  {
    id: 'budapest',
    name: 'Budapest, Hungary',
    period: '2026',
    coordinates: '47.4979° N, 19.0402° E',
    lat: 47.4979,
    lng: 19.0402,
    photo: '/budapest.jpg',
  },
  {
    id: 'northern-italy',
    name: 'Northern Italy',
    subheading: 'VENICE · FLORENCE · MILAN · CINQUE TERRE · DOLOMITES',
    period: '2024',
    coordinates: '45.0360° N, 10.8680° E',
    lat: 45.036,
    lng: 10.868,
    photo: '/venice.jpg',
    photos: [
      '/venice.jpg',
      '/florence.jpg',
      '/milan.jpg',
      '/cinque-terre.jpg',
      '/dolomites.jpg',
    ],
    photoPositions: ['center center', 'center center', 'center center', 'center center', 'center center'],
  },
  {
    id: 'athens',
    name: 'Athens, Greece',
    period: '2025',
    coordinates: '37.9838° N, 23.7275° E',
    lat: 37.9838,
    lng: 23.7275,
    photo: '/athens.jpg',
  },
  {
    id: 'albufeira',
    name: 'Albufeira, Portugal',
    period: '2025',
    coordinates: '37.0894° N, 8.2500° W',
    lat: 37.0894,
    lng: -8.25,
    photo: '/albufeira.jpg',
  },
  {
    id: 'granada',
    name: 'Granada, Spain',
    period: '2025',
    coordinates: '37.1773° N, 3.5986° W',
    lat: 37.1773,
    lng: -3.5986,
    photo: '/granada.jpg',
    photoPositions: ['center 32%'],
  },
  {
    id: 'sevilla',
    name: 'Sevilla, Spain',
    period: '2023',
    coordinates: '37.3891° N, 5.9845° W',
    lat: 37.3891,
    lng: -5.9845,
    photo: '/sevilla.jpg',
    photoPositions: ['center 55%'],
  },
  {
    id: 'zurich',
    name: 'Zurich, Switzerland',
    period: '2026 · 2022',
    coordinates: '47.3769° N, 8.5417° E',
    lat: 47.3769,
    lng: 8.5417,
    photo: '/zurich.jpg',
  },
  {
    id: 'geneva',
    name: 'Geneva, Switzerland',
    period: '2024',
    description: 'Culinary school',
    coordinates: '46.2044° N, 6.1432° E',
    lat: 46.2044,
    lng: 6.1432,
    photo: '/geneva.jpg',
  },
  {
    id: 'zermatt',
    name: 'Zermatt, Switzerland',
    period: '2022',
    coordinates: '46.0207° N, 7.7491° E',
    lat: 46.0207,
    lng: 7.7491,
    photo: '/zermatt.jpg',
  },
  {
    id: 'houston',
    name: 'Houston, Texas',
    period: 'Last visited April 2026',
    coordinates: '29.7604° N, 95.3698° W',
    lat: 29.7604,
    lng: -95.3698,
    photo: '/houston.jpg',
    photoPositions: ['50% 38%'],
  },
  {
    id: 'taipei',
    name: 'Taipei, Taiwan',
    period: 'Last visited June 2026',
    description:
      'Where my grandparents grew up and where I spent many childhood summers — visiting family, going to camp, and eating some of the best food in the world.',
    coordinates: '25.0340° N, 121.5645° E',
    lat: 25.034,
    lng: 121.5645,
    photo: '/taipei/taipei-1.jpg',
    photos: [
      '/taipei/taipei-1.jpg',
      '/taipei/taipei-2.png',
      '/taipei/taipei-3.png',
    ],
    photoPositions: ['center center', 'center center', 'center 15%'],
  },
  {
    id: 'taipei-marriott',
    name: '台北萬豪酒店 Taipei Marriott Hotel',
    subheading: 'INTERN',
    period: 'June 2023',
    description:
      'My first exposure to how a world-class hotel runs. As a high schooler I rotated across finance, sales, food & beverage, and housekeeping — and reaffirmed my passion for hospitality.',
    coordinates: '25.0380° N, 121.5680° E',
    lat: 25.038,
    lng: 121.568,
    photo: '/taipei-marriott.png',
  },
]

const CARD_ONLY_LOCATION_IDS = new Set(['philadelphia', 'taipei-marriott'])

export function getGlobeLocations(): LocationData[] {
  return locations.filter((location) => !CARD_ONLY_LOCATION_IDS.has(location.id))
}

export function getLocationsForMarker(markerId: string): LocationData[] {
  if (markerId === 'upenn') {
    return locations.filter((location) => location.id === 'upenn' || location.id === 'philadelphia')
  }

  if (markerId === 'taipei') {
    return locations.filter((location) => location.id === 'taipei' || location.id === 'taipei-marriott')
  }

  const location = locations.find((entry) => entry.id === markerId)
  return location ? [location] : []
}
