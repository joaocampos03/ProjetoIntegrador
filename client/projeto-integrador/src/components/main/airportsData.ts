export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  image: string;
  description: string;
  price: number;
}

export const airportsData: Airport[] = [
  {
    code: "GRU",
    name: "Aeroporto Internacional de São Paulo",
    city: "São Paulo",
    country: "Brasil",
    lat: -23.4321,
    lon: -46.4691,
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
    description:
      "O maior aeroporto do Brasil, localizado em Guarulhos. Serve como principal hub de conexões internacionais e domésticas.",
    price: 450,
  },
  {
    code: "GIG",
    name: "Aeroporto Internacional do Rio de Janeiro",
    city: "Rio de Janeiro",
    country: "Brasil",
    lat: -22.8089,
    lon: -43.2436,
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800",
    description:
      "Aeroporto principal do Rio de Janeiro, localizado em Galeão. Oferece conexões para destinos nacionais e internacionais.",
    price: 450,
  },
  {
    code: "BSB",
    name: "Aeroporto Internacional de Brasília",
    city: "Brasília",
    country: "Brasil",
    lat: -15.8711,
    lon: -47.9186,
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
    description:
      "Aeroporto da capital brasileira, importante hub de conexões para o centro-oeste e norte do país.",
    price: 450,
  },
  {
    code: "EZE",
    name: "Aeroporto Internacional Ministro Pistarini",
    city: "Buenos Aires",
    country: "Argentina",
    lat: -34.8222,
    lon: -58.5358,
    image: "https://images.unsplash.com/photo-1531572753322-ad063163ccd7?w=800",
    description:
      "Principal aeroporto internacional da Argentina, localizado em Ezeiza. Serve como gateway para a América do Sul.",
    price: 550,
  },
  {
    code: "SCL",
    name: "Aeroporto Internacional Arturo Merino Benítez",
    city: "Santiago",
    country: "Chile",
    lat: -33.393,
    lon: -70.7858,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    description:
      "Principal aeroporto do Chile, localizado em Santiago. Hub importante para conexões na América do Sul.",
    price: 550,
  },
  {
    code: "LIM",
    name: "Aeroporto Internacional Jorge Chávez",
    city: "Lima",
    country: "Peru",
    lat: -12.0219,
    lon: -77.1144,
    image: "https://images.unsplash.com/photo-1531572753322-ad063163ccd7?w=800",
    description:
      "Principal aeroporto do Peru, localizado em Lima. Serve como hub para conexões na região andina.",
    price: 500,
  },
  {
    code: "BOG",
    name: "Aeroporto Internacional El Dorado",
    city: "Bogotá",
    country: "Colômbia",
    lat: 4.7016,
    lon: -74.1469,
    image: "https://images.unsplash.com/photo-1531572753322-ad063163ccd7?w=800",
    description:
      "Principal aeroporto da Colômbia, localizado em Bogotá. Importante hub de conexões na América do Sul.",
    price: 500,
  },
  {
    code: "MIA",
    name: "Aeroporto Internacional de Miami",
    city: "Miami",
    country: "Estados Unidos",
    lat: 25.7959,
    lon: -80.287,
    image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800",
    description:
      "Um dos principais aeroportos dos Estados Unidos, importante gateway entre América do Norte e do Sul.",
    price: 800,
  },
  {
    code: "MAD",
    name: "Aeroporto Adolfo Suárez Madrid-Barajas",
    city: "Madrid",
    country: "Espanha",
    lat: 40.4839,
    lon: -3.568,
    image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800",
    description:
      "Principal aeroporto da Espanha e um dos maiores da Europa. Hub importante para conexões transatlânticas.",
    price: 1200,
  },
  {
    code: "CDG",
    name: "Aeroporto Charles de Gaulle",
    city: "Paris",
    country: "França",
    lat: 49.0097,
    lon: 2.5479,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    description:
      "Um dos maiores aeroportos da Europa, localizado em Paris. Hub principal para conexões internacionais.",
    price: 1300,
  },
  {
    code: "LHR",
    name: "Aeroporto de Londres Heathrow",
    city: "Londres",
    country: "Reino Unido",
    lat: 51.4706,
    lon: -0.4619,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
    description:
      "Principal aeroporto do Reino Unido e um dos mais movimentados do mundo. Hub internacional importante.",
    price: 1400,
  },
  {
    code: "SYD",
    name: "Aeroporto Internacional Kingsford Smith",
    city: "Sydney",
    country: "Austrália",
    lat: -33.9399,
    lon: 151.1753,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    description:
      "Principal aeroporto da Austrália, localizado em Sydney. Gateway para a Oceania.",
    price: 2000,
  },
  {
    code: "NRT",
    name: "Aeroporto Internacional de Narita",
    city: "Tóquio",
    country: "Japão",
    lat: 35.772,
    lon: 140.3929,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    description:
      "Principal aeroporto internacional de Tóquio. Hub importante para conexões na Ásia.",
    price: 1800,
  },
];




