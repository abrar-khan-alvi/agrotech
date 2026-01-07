import axios from 'axios';

// Open-Meteo API
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
    // Current Conditions
    temperature: number;
    windspeed: number;
    humidity: number;
    isDay: number;
    weatherCode: number;
    precipitation: number;
    soilReader: {
        moisture: number; // 0-1cm
        temperature: number; // 0cm
    };

    // Forecast
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        precipitation_sum: number[];
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        relativehumidity_2m: number[];
        precipitation: number[];
    }
}

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                latitude: lat,
                longitude: lng,
                current_weather: true,
                hourly: 'temperature_2m,relativehumidity_2m,precipitation,soil_moisture_0_1cm,soil_temperature_0cm',
                daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
                forecast_days: 7,
                timezone: 'Asia/Dhaka'
            }
        });

        const current = response.data.current_weather;
        const hourly = response.data.hourly;
        const daily = response.data.daily;

        // Find index for current hour
        // OpenMeteo returns time in ISO 8601 usually, but check format.
        // It matches current_weather.time usually.
        const currentTimeStr = current.time;
        const index = hourly.time.findIndex((t: string) => t === currentTimeStr);
        const safeIndex = index !== -1 ? index : 0;

        return {
            temperature: current.temperature,
            windspeed: current.windspeed,
            isDay: current.is_day,
            weatherCode: current.weathercode,
            humidity: hourly.relativehumidity_2m[safeIndex] || 0,
            precipitation: hourly.precipitation[safeIndex] || 0,
            soilReader: {
                moisture: hourly.soil_moisture_0_1cm[safeIndex] || 0,
                temperature: hourly.soil_temperature_0cm[safeIndex] || 0
            },
            daily: {
                time: daily.time,
                temperature_2m_max: daily.temperature_2m_max,
                temperature_2m_min: daily.temperature_2m_min,
                precipitation_sum: daily.precipitation_sum
            },
            hourly: {
                time: hourly.time,
                temperature_2m: hourly.temperature_2m,
                relativehumidity_2m: hourly.relativehumidity_2m,
                precipitation: hourly.precipitation
            }
        };

    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
};
