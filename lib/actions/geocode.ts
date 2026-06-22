interface GeocodeAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  country: string;
  formattedAddress: string;
}

interface GeocodeResponse {
  results: Array<{
    formatted_address: string;
    address_components: GeocodeAddressComponent[];
  }>;
  status: string;
}

export async function getCountryFromCoordinates(
  lat: number,
  lng: number
): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY!;
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
  );

  const data: GeocodeResponse = await response.json();

  const result = data.results[0];
  const countryComponent = result.address_components.find(
    (component: GeocodeAddressComponent) => component.types.includes("country")
  );

  return {
    country: countryComponent?.long_name || "Unknown",
    formattedAddress: result.formatted_address,
  };
}
