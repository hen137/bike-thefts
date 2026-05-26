import { BikeData, StartEndDates } from "@/types/map";

const QUERY_URL =
  "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Bicycle_Thefts_Open_Data/FeatureServer/0/query?";

const OUT_FIELDS = "outFields=";
const DEFAULT_OUT_FIELDS_PARAMS = "*";

const WHERE = "&where=";
const DEFAULT_WHERE_PARAM = "1%3D1";

const COUNT_QUERY_PARAM = "&returnCountOnly=true";

const GEOJSON_QUERY_PARAM = "&f=geojson";
const JSON_QUERY_PARAM = "&f=json";

const MAX_RECORDS = 2000;

// export function inToronto() {}

async function getBikeTotalRecords(where: string): Promise<number> {
  const resp = await fetch(
    QUERY_URL +
      OUT_FIELDS +
      DEFAULT_OUT_FIELDS_PARAMS +
      WHERE +
      where +
      COUNT_QUERY_PARAM +
      JSON_QUERY_PARAM
  );
  if (!resp.ok)
    throw new Error(`ArcGIS count request failed: ${resp.statusText}`);
  return (await resp.json()).count;
}

export async function getBikeData({
  endDate,
  startDate
}: StartEndDates): Promise<BikeData> {
  const lowBoundYear = startDate ? `(OCC_YEAR>=${startDate.year})` : "";
  const uppBoundYear = endDate ? `(OCC_YEAR<=${endDate.year})` : "";

  let where: string;
  if (lowBoundYear && uppBoundYear) where = lowBoundYear + "AND" + uppBoundYear;
  else if (lowBoundYear || uppBoundYear) where = lowBoundYear + uppBoundYear;
  else where = DEFAULT_WHERE_PARAM;

  const totalRecords = await getBikeTotalRecords(where);

  let bikeData: BikeData = [];
  for (let i = 0; i * MAX_RECORDS < totalRecords; i++) {
    const resp = await fetch(
      QUERY_URL +
        OUT_FIELDS +
        DEFAULT_OUT_FIELDS_PARAMS +
        WHERE +
        where +
        `&resultOffset=${MAX_RECORDS * i}` +
        GEOJSON_QUERY_PARAM
    );
    if (!resp.ok)
      throw new Error(`ArcGIS data request failed: ${resp.statusText}`);
    bikeData = bikeData.concat(await resp.json());
  }

  return bikeData;
}
