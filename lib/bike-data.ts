const QUERY_URL =
  "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts_Open_Data/FeatureServer/0/query";
const DEFAULT_QUERY_PARAMS = "?outFields=*&where=1%3D1&f=geojson";

export async function getBikeData(): Promise<{
  features: { geometry: { coordinates: number[] } }[];
}> {
  const resp = await fetch(QUERY_URL + DEFAULT_QUERY_PARAMS);
  return resp.json();
  // return new Promise(resolve => setTimeout(() => resolve(resp.json()), 5000))
}
