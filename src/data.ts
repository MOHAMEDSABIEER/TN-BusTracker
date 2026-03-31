export interface Stop {
  name: string;
  lat: number;
  lng: number;
  time: string;
}

export interface Route {
  routeId: string;
  routeName: string;
  stops: Stop[];
}

export interface Bus {
  busId: string;
  busNumber: string;
  routeId: string;
  status: 'Running' | 'Delayed' | 'Not Started';
  district: string;
}

export const districts = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Trichy",
  "Salem",
  "Erode",
  "Tiruppur",
  "Vellore",
  "Tirunelveli",
  "Thanjavur"
];

export interface DistrictInfo {
  description: string;
  landmarks: string[];
}

export const districtData: Record<string, DistrictInfo> = {
  "Chennai": {
    description: "The capital city of Tamil Nadu, known as the 'Gateway to South India'. It is a major cultural, economic, and educational center.",
    landmarks: ["Marina Beach", "Kapaleeshwarar Temple", "Fort St. George"]
  },
  "Coimbatore": {
    description: "Known as the 'Manchester of South India', it is a major hub for manufacturing, education, and healthcare.",
    landmarks: ["Marudhamalai Temple", "Adiyogi Shiva Statue", "Siruvani Waterfalls"]
  },
  "Madurai": {
    description: "One of the oldest continuously inhabited cities in the world, famous for its rich heritage and the Meenakshi Amman Temple.",
    landmarks: ["Meenakshi Amman Temple", "Thirumalai Nayakkar Mahal", "Gandhi Memorial Museum"]
  },
  "Trichy": {
    description: "A major educational and agricultural hub, home to the famous Rockfort Temple and Srirangam Temple.",
    landmarks: ["Rockfort Temple", "Srirangam Ranganathaswamy Temple", "Jambukeswarar Temple"]
  },
  "Salem": {
    description: "Known as the 'Steel City', it is surrounded by hills and is a major center for textile and steel industries.",
    landmarks: ["Yercaud Hill Station", "Mettur Dam", "Kottai Mariamman Temple"]
  },
  "Erode": {
    description: "Famous for its turmeric production and textile markets, it is situated on the banks of the Kaveri River.",
    landmarks: ["Bhavani Sangameshwarar Temple", "Kodiveri Dam", "Chennimalai Murugan Temple"]
  },
  "Tiruppur": {
    description: "The 'Knitwear Capital of India', contributing significantly to India's textile exports.",
    landmarks: ["Avinashi Temple", "Tiruppur Kumaran Memorial", "Nanjarayan Tank"]
  },
  "Vellore": {
    description: "Known for its historic fort and the world-renowned Christian Medical College (CMC).",
    landmarks: ["Vellore Fort", "Golden Temple (Sripuram)", "Jalakandeswarar Temple"]
  },
  "Tirunelveli": {
    description: "An ancient city known for its temples, halwa, and the scenic Courtallam waterfalls nearby.",
    landmarks: ["Nellaiappar Temple", "Papanasam Falls", "Manimuthar Dam"]
  },
  "Thanjavur": {
    description: "The 'Rice Bowl of Tamil Nadu', famous for its Brihadeeswarar Temple and classical arts.",
    landmarks: ["Brihadeeswarar Temple", "Thanjavur Royal Palace", "Saraswathi Mahal Library"]
  }
};

// Helper to generate coordinates around a center
const getCoords = (lat: number, lng: number, offset: number) => ({
  lat: lat + (Math.random() - 0.5) * offset,
  lng: lng + (Math.random() - 0.5) * offset
});

const cityCenters: Record<string, { lat: number, lng: number }> = {
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Erode": { lat: 11.3410, lng: 77.7172 },
  "Tiruppur": { lat: 11.1085, lng: 77.3411 },
  "Vellore": { lat: 12.9165, lng: 79.1325 },
  "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
  "Thanjavur": { lat: 10.7870, lng: 79.1378 }
};

const cityStops: Record<string, string[]> = {
  "Chennai": ["T Nagar", "Guindy", "Tambaram", "Airport", "Broadway", "Central", "Saidapet", "Adyar", "Velachery", "Porur", "Koyambedu", "Egmore", "Mylapore", "Chromepet", "Pallavaram"],
  "Coimbatore": ["Gandhipuram", "Singanallur", "Peelamedu", "Railway Station", "Town Hall", "Vadavalli", "Marudhamalai", "Ukkadam", "Saravanampatti", "Thudiyalur", "Kovaipudur", "Sulur", "Ganapathy"],
  "Madurai": ["Periyar", "Mattuthavani", "Arapalayam", "Anna Nagar", "Teppakulam", "Thirumangalam", "Thirunagar", "Simmakkal", "Goripalayam", "K.Pudur"],
  "Trichy": ["Chatram", "Central", "Srirangam", "Thiruverumbur", "BHEL", "Woraiyur", "K.K. Nagar", "Lalgudi", "Manachanallur", "Tiruverumbur"],
  "Salem": ["Old Bus Stand", "New Bus Stand", "Junction", "Kondalampatti", "Ammapet", "Steel Plant", "Hasthampatti", "Suramangalam", "Fairlands"],
  "Erode": ["Bus Stand", "Railway Station", "Perundurai", "Bhavani", "Pallipalayam", "Solar", "Chithode", "Thindal", "Kalingarayanpalayam"],
  "Tiruppur": ["Old Bus Stand", "New Bus Stand", "Avinashi", "Palladam", "Dharapuram Road", "Kangayam Road", "Uthukuli", "Nallur"],
  "Vellore": ["CMC", "Katpadi", "Bagayam", "Sathuvachari", "Old Bus Stand", "New Bus Stand", "Vellore Fort", "Arcot", "Gudiyatham"],
  "Tirunelveli": ["Junction", "Town", "Palayamkottai", "Pettai", "Melapalayam", "Vannarpettai", "Thachanallur", "Samathanapuram"],
  "Thanjavur": ["Old Bus Stand", "New Bus Stand", "Punnainallur", "Medical College", "Vallam", "Karanthai", "Raja Serfoji College", "Mariamman Kovil"]
};

const generateRoutesAndBuses = () => {
  const allRoutes: Record<string, Route> = {};
  const allBuses: Bus[] = [];

  districts.forEach((city, cityIdx) => {
    const center = cityCenters[city];
    const stopsList = cityStops[city];
    
    // Generate 12 routes per city
    for (let r = 1; r <= 12; r++) {
      const routeId = `${city.substring(0, 3).toUpperCase()}R${r}`;
      const startStop = stopsList[Math.floor(Math.random() * stopsList.length)];
      let endStop = stopsList[Math.floor(Math.random() * stopsList.length)];
      while (endStop === startStop) {
        endStop = stopsList[Math.floor(Math.random() * stopsList.length)];
      }

      const routeStops: Stop[] = [];
      const numStops = 5 + Math.floor(Math.random() * 4); // 5-8 stops
      
      for (let s = 0; s < numStops; s++) {
        const stopName = s === 0 ? startStop : (s === numStops - 1 ? endStop : stopsList[Math.floor(Math.random() * stopsList.length)]);
        const hour = 6 + Math.floor(s * 1.5);
        const minute = (s * 15) % 60;
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour;

        routeStops.push({
          name: stopName,
          ...getCoords(center.lat, center.lng, 0.1),
          time: `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
        });
      }

      allRoutes[routeId] = {
        routeId,
        routeName: `${startStop} ↔ ${endStop}`,
        stops: routeStops
      };

      // Generate 1.5 buses per route on average (approx 18 buses per city)
      const numBusesForRoute = Math.random() > 0.5 ? 2 : 1;
      for (let b = 1; b <= numBusesForRoute; b++) {
        const busId = `${city.substring(0, 3).toUpperCase()}B${r}_${b}`;
        const busNumber = `${Math.floor(Math.random() * 100)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
        const statuses: Bus['status'][] = ['Running', 'Delayed', 'Not Started'];
        
        allBuses.push({
          busId,
          busNumber,
          routeId,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          district: city
        });
      }
    }
  });

  return { allRoutes, allBuses };
};

const { allRoutes, allBuses } = generateRoutesAndBuses();

export const routes = allRoutes;
export const buses = allBuses;
