// Comprehensive dataset for Indian car brands, models, manufacture years, and colors

export const INDIAN_CAR_BRANDS = {
  "Maruti Suzuki": [
    "Swift", "Dzire", "Baleno", "Brezza", "Grand Vitara", "Fronx", "Alto K10", "Wagon R",
    "Celerio", "Ignis", "Ertiga", "XL6", "Jimny", "Invicto", "Eeco", "S-Cross", "Ciaz",
    "Ritz", "Zen", "Omni", "Estilo", "A-Star", "Gypsy", "Kizashi", "Other"
  ],
  "Tata Motors": [
    "Nexon", "Punch", "Harrier", "Safari", "Tiago", "Tigor", "Altroz", "Curvv",
    "Nexon EV", "Punch EV", "Tiago EV", "Tigor EV", "Sierra", "Sumo", "Indigo",
    "Indica", "Hexa", "Aria", "Nano", "Zest", "Bolt", "Other"
  ],
  "Mahindra": [
    "Thar", "Thar Roxx", "Scorpio-N", "Scorpio Classic", "XUV700", "XUV300", "XUV400",
    "XUV3XO", "Bolero", "Bolero Neo", "Marazzo", "XUV500", "TUV300", "KUV100",
    "Alturas G4", "Verito", "Logan", "Armada", "Commander", "Other"
  ],
  "Hyundai": [
    "Creta", "Venue", "i20", "Grand i10 Nios", "Exter", "Verna", "Alcazar", "Tucson",
    "Aura", "Kona Electric", "Ioniq 5", "Santro", "Elantra", "Eon", "Getz", "Accent",
    "Santa Fe", "Sonata", "Other"
  ],
  "Honda": [
    "City", "Amaze", "Elevate", "Civic", "Jazz", "WR-V", "CR-V", "BR-V", "Brio",
    "Accord", "Mobilio", "Other"
  ],
  "Toyota": [
    "Fortuner", "Innova Crysta", "Innova Hycross", "Urban Cruiser Hyryder", "Glanza",
    "Rumion", "Hilux", "Camry", "Land Cruiser", "Corolla Altis", "Etios", "Liva",
    "Yaris", "Prius", "Qualis", "Other"
  ],
  "Kia": [
    "Seltos", "Sonet", "Carens", "EV6", "EV9", "Carnival", "Other"
  ],
  "Skoda": [
    "Slavia", "Kushaq", "Kodiaq", "Octavia", "Superb", "Rapid", "Yeti", "Fabia", "Kylaq", "Other"
  ],
  "Volkswagen": [
    "Virtus", "Taigun", "Tiguan", "Polo", "Vento", "Ameo", "Jetta", "Passat", "Beetle", "Other"
  ],
  "MG Motor": [
    "Hector", "Hector Plus", "Astor", "ZS EV", "Comet EV", "Gloster", "Windsor EV", "Other"
  ],
  "Renault": [
    "Kwid", "Triber", "Kiger", "Duster", "Lodgy", "Pulse", "Scala", "Other"
  ],
  "Nissan": [
    "Magnite", "Kicks", "Sunny", "Terrano", "Micra", "GT-R", "X-Trail", "Teana", "Other"
  ],
  "BMW": [
    "3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "Z4", "i4", "i7", "iX",
    "M3", "M5", "M2", "Other"
  ],
  "Mercedes-Benz": [
    "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "CLA", "A-Class",
    "G-Class", "EQE", "EQS", "AMG GT", "Other"
  ],
  "Audi": [
    "A4", "A6", "A8 L", "Q3", "Q5", "Q7", "Q8", "e-tron", "RS5", "R8", "Other"
  ],
  "Jeep": [
    "Compass", "Meridian", "Wrangler", "Grand Cherokee", "Other"
  ],
  "Citroen": [
    "C3", "C3 Aircross", "Basalt", "C5 Aircross", "eC3", "Other"
  ],
  "Force Motors": [
    "Gurkha", "Trax", "Traveller", "Other"
  ],
  "Land Rover": [
    "Defender", "Discovery", "Range Rover", "Range Rover Evoque", "Range Rover Velar",
    "Range Rover Sport", "Other"
  ],
  "Jaguar": [
    "F-Pace", "XE", "XF", "XJ", "F-Type", "I-Pace", "Other"
  ],
  "Volvo": [
    "XC40", "XC60", "XC90", "S90", "EX30", "C40 Recharge", "Other"
  ],
  "BYD": [
    "Atto 3", "Seal", "e6", "Other"
  ],
  "Porsche": [
    "Macan", "Cayenne", "911", "Panamera", "Taycan", "Other"
  ],
  "Lexus": [
    "ES", "RX", "NX", "LX", "LM", "Other"
  ],
  "Isuzu": [
    "D-Max", "V-Cross", "MU-X", "Other"
  ],
  "Mini": [
    "Cooper", "Countryman", "Other"
  ],
  "Ferrari": ["Roma", "296 GTB", "SF90 Stradale", "Purosangue", "812 Superfast", "Other"],
  "Lamborghini": ["Urus", "Revuelto", "Huracan", "Aventador", "Other"],
  "Rolls-Royce": ["Phantom", "Ghost", "Cullinan", "Spectre", "Other"],
  "Bentley": ["Continental GT", "Flying Spur", "Bentayga", "Other"],
  "Other Brand": ["Other Model"]
};

// Years list from 2026 down to 1990
export const VEHICLE_YEARS = Array.from({ length: 37 }, (_, i) => (2026 - i).toString());

// Standard automotive colors in India
export const VEHICLE_COLORS = [
  "White",
  "Pearl White",
  "Black",
  "Midnight Black",
  "Silver",
  "Metallic Grey",
  "Slate Grey",
  "Red",
  "Crimson Red",
  "Blue",
  "Ocean Blue",
  "Green",
  "Forest Green",
  "Brown / Copper",
  "Beige / Gold",
  "Orange / Yellow",
  "Dual Tone (Black Roof)",
  "Other Color"
];
