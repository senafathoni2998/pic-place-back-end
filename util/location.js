const axios = require("axios");

async function getCoordsForAddress(address) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: address,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "pic-place-back-end/1.0 (aokiji2025@gmail.com)",
      },
    }
  );

  const data = response.data;

  if (!data || data.length === 0) {
    throw new Error("Could not find location for the specified address.");
  }

  const coordinates = data[0];
  return {
    lat: parseFloat(coordinates.lat),
    lng: parseFloat(coordinates.lon),
  };
}

exports.getCoordsForAddress = getCoordsForAddress;
