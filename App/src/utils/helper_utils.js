import moment from "moment";

export const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: "", time: "" };

    const date = new Date(timestamp);

    return {
        date: new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        }).format(date),
        time: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        }).format(date),
    };
};

export const getLastNDays = (data, n) => {
    const today = moment().startOf("day");
    return Object.keys(data)
      .filter((date) => moment(date).isSameOrBefore(today)) // Ensure past dates
      .sort((a, b) => moment(a).diff(moment(b))) // Sort in ascending order
      .slice(-n) // Get last N days
      .reduce((acc, date) => {
        acc[date] = data[date];
        return acc;
      }, {});
  };


  export const getLastNHours = (data, hours) => {
    // Sort timestamps chronologically
    const sortedEntries = Object.entries(data)
      .filter(([timestamp, value]) => {
        const isValidTimestamp = moment(timestamp, "YYYY-MM-DD HH:mm:ss", true).isValid();
        const isValidNumber = !isNaN(parseFloat(value)) && isFinite(value);
  
        if (!isValidTimestamp) console.error(`🚨 Invalid timestamp: ${timestamp}`);
        if (!isValidNumber) console.error(`🚨 Invalid temp value: ${value} at ${timestamp}`);
  
        return isValidTimestamp && isValidNumber;
      })
      .sort(([a], [b]) => moment(a, "YYYY-MM-DD HH:mm:ss").diff(moment(b, "YYYY-MM-DD HH:mm:ss")));
  
    // Take the last N records instead of filtering by time
    const lastNEntries = sortedEntries.slice(-hours);
  
    // Convert back to object format
    const filteredData = lastNEntries.reduce((acc, [timestamp, value]) => {
      acc[timestamp] = Math.round(parseFloat(value), 1);
      return acc;
    }, {});
  
    console.log("✅ Filtered Temp Data (Last N Entries):", filteredData);
    return filteredData;
  };
  
  
// Fetch air pollution index (returns a number)
export const fetchAirPollution = async (lat, lon, apiKey) => {
  try {
      const response = await fetch(
          `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      const data = await response.json();
    //   console.log(data.list[0].main.aqi)
      return data.list[0].main.aqi; // Air Quality Index (AQI)
  } catch (error) {
      console.error("Error fetching air pollution data:", error);
      return null;
  }
};

// Fetch weather description (returns a string)
export const fetchWeather = async (lat, lon, apiKey) => {
  try {
      const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      const data = await response.json();
    //   console.log(data.weather[0].main, data.weather[0].icon)
      return {weatherValue: data.weather[0].main, weatherIcon: data.weather[0].icon};
  } catch (error) {
      console.error("Error fetching weather data:", error);
      return "Unavailable";
  }
};