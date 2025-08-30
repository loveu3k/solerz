import { locations } from "./locations";

console.log("Imported locations in cities.ts:", locations); // Debugging log

export const cities = locations; // Directly use the locations array

export const searchCities = (query) => {
  if (!query || typeof query !== "string") return [];
  return locations.filter((city) =>
    city.toLowerCase().includes(query.toLowerCase())
  );
};

export const formatCity = (city) => city; // No need to format
