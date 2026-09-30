// Countries and major cities for "Deliver to". Prices stay in USD; this changes the delivery label only.
export type Country = { code: string; name: string; cities: string[] };

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "Seattle", "San Francisco", "Boston", "Miami", "Atlanta", "Denver"] },
  { code: "PK", name: "Pakistan", cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad"] },
  { code: "IN", name: "India", cities: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur"] },
  { code: "GB", name: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Leeds", "Edinburgh", "Bristol"] },
  { code: "CA", name: "Canada", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"] },
  { code: "AU", name: "Australia", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"] },
  { code: "AE", name: "United Arab Emirates", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman"] },
  { code: "SA", name: "Saudi Arabia", cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam"] },
  { code: "DE", name: "Germany", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"] },
  { code: "FR", name: "France", cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"] },
  { code: "IT", name: "Italy", cities: ["Rome", "Milan", "Naples", "Turin", "Florence"] },
  { code: "ES", name: "Spain", cities: ["Madrid", "Barcelona", "Valencia", "Seville"] },
  { code: "NL", name: "Netherlands", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"] },
  { code: "TR", name: "Turkey", cities: ["Istanbul", "Ankara", "Izmir", "Antalya"] },
  { code: "BD", name: "Bangladesh", cities: ["Dhaka", "Chittagong", "Khulna", "Sylhet"] },
  { code: "CN", name: "China", cities: ["Shanghai", "Beijing", "Shenzhen", "Guangzhou", "Chengdu"] },
  { code: "JP", name: "Japan", cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Kyoto"] },
  { code: "SG", name: "Singapore", cities: ["Singapore"] },
  { code: "MY", name: "Malaysia", cities: ["Kuala Lumpur", "George Town", "Johor Bahru"] },
  { code: "BR", name: "Brazil", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"] },
  { code: "MX", name: "Mexico", cities: ["Mexico City", "Guadalajara", "Monterrey", "Cancún"] },
  { code: "EG", name: "Egypt", cities: ["Cairo", "Alexandria", "Giza"] },
  { code: "NG", name: "Nigeria", cities: ["Lagos", "Abuja", "Kano"] },
  { code: "ZA", name: "South Africa", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria"] },
].sort((a, b) => (a.code === "US" ? -1 : b.code === "US" ? 1 : a.name.localeCompare(b.name)));

export type DeliveryLocation = { country: string; city: string | null; zip: string | null };

export const DEFAULT_LOCATION: DeliveryLocation = { country: "US", city: null, zip: null };

export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name ?? "United States";

// "Lahore, Pakistan", "98109, United States", "Seattle 98109, United States" or just "United States".
export function locationLabel(loc: DeliveryLocation) {
  const place = [loc.city, loc.zip].filter(Boolean).join(" ");
  return place ? `${place}, ${countryName(loc.country)}` : countryName(loc.country);
}

export function parseLocationCookie(raw: string | undefined): DeliveryLocation {
  if (!raw) return DEFAULT_LOCATION;
  const [country = "US", city = "", zip = ""] = decodeURIComponent(raw).split("|");
  const c = COUNTRIES.find((x) => x.code === country);
  if (!c) return DEFAULT_LOCATION;
  return {
    country: c.code,
    city: c.cities.includes(city) ? city : null,
    zip: c.code === "US" && /^\d{5}$/.test(zip) ? zip : null,
  };
}
