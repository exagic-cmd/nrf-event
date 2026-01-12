export const getIP = async () => {
  try {
    // Check if IP is already cached in localStorage
    const cachedIP = localStorage.getItem("cachedIPInfo");
    if (cachedIP) {
      return JSON.parse(cachedIP);
    }

    const res = await fetch('https://api64.ipify.org?format=json');
    const data = await res.json();

    if (data && data.ip) {
      // Cache the IP info for future use
      localStorage.setItem("cachedIPInfo", JSON.stringify(data));
      return data;
    }
    return {};
  } catch (error) {
    console.warn("⚠️ Failed to fetch IP:", error);
    return {};
  }
};
