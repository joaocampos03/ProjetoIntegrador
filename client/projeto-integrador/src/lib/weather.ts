interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon?: string;
}

export const getWeather = async (latitude: number, longitude: number): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=America/Sao_Paulo`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const current = data.current;

    const weatherCodes: { [key: number]: string } = {
      0: "Céu limpo",
      1: "Principalmente limpo",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Nevoeiro",
      48: "Nevoeiro gelado",
      51: "Chuva leve",
      53: "Chuva moderada",
      55: "Chuva forte",
      56: "Chuva congelante leve",
      57: "Chuva congelante forte",
      61: "Chuva leve",
      63: "Chuva moderada",
      65: "Chuva forte",
      66: "Chuva congelante leve",
      67: "Chuva congelante forte",
      71: "Neve leve",
      73: "Neve moderada",
      75: "Neve forte",
      77: "Grãos de neve",
      80: "Pancadas de chuva leve",
      81: "Pancadas de chuva moderada",
      82: "Pancadas de chuva forte",
      85: "Pancadas de neve leve",
      86: "Pancadas de neve forte",
      95: "Trovoada",
      96: "Trovoada com granizo leve",
      99: "Trovoada com granizo forte",
    };

    return {
      temperature: Math.round(current.temperature_2m),
      condition: weatherCodes[current.weather_code] || "Desconhecido",
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
    };
  } catch (error) {
    console.error("Erro ao buscar clima:", error);
    return null;
  }
};

