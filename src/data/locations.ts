export interface LocationData {
  id: string
  name: string
  period: string
  description: string
  coordinates: string
  lat: number
  lng: number
  photo: string
}

export const locations: LocationData[] = [
  {
    id: 'bellevue',
    name: 'Bellevue, Washington',
    period: '2002 — 2020',
    description: 'The place where I grew up. The Pacific Northwest shaped my love for nature, coffee, and grey skies. Every memory of home starts here.',
    coordinates: '47.6104° N, 122.2007° W',
    lat: 47.6104,
    lng: -122.2007,
    photo: '/bellevue.jpg',
  },
  {
    id: 'philadelphia',
    name: 'Philadelphia, Pennsylvania',
    period: '2020 — Present',
    description: 'Where I discovered who I wanted to become. The city of brotherly love taught me resilience, ambition, and the beauty of historic streets.',
    coordinates: '39.9526° N, 75.1652° W',
    lat: 39.9526,
    lng: -75.1652,
    photo: '/philadelphia.jpg',
  },
]
