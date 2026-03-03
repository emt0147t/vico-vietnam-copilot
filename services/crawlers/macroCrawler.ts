import axios from 'axios';

export const fetchMacroEconomics = async () => {
  try {
    console.log("🌍 Fetching macroeconomic data from World Bank...");

    // World Bank API URL for Vietnam (Code: VNM)
    // GDP Growth: NY.GDP.MKTP.KD.ZG
    // Inflation (CPI): FP.CPI.TOTL.ZG
    // FDI: BX.KLT.DINV.CD.WD
    const indicators = [
      'NY.GDP.MKTP.KD.ZG', 
      'FP.CPI.TOTL.ZG',
      'BX.KLT.DINV.CD.WD' 
    ];

    const results = [];

    for (const indicator of indicators) {
      // Call API to get data for the last 5 years
      const url = `https://api.worldbank.org/v2/country/VNM/indicator/${indicator}?format=json&per_page=5&date=2020:2025`;
      const response = await axios.get(url);
      
      // World Bank returns array: [Metadata, Data[]]
      const data = response.data[1]; 
      
      if (data && data.length > 0) {
        // Get the most recent year with data
        const latest = data.find((d: any) => d.value !== null);
        results.push({
          indicator: latest.indicator.value,
          year: latest.date,
          value: latest.value,
          unit: indicator === 'BX.KLT.DINV.CD.WD' ? 'USD' : '%'
        });
      }
    }

    console.log("✅ Macro results:", results);
    return results; // Will be saved to DB later

  } catch (error) {
    console.error("❌ Error fetching Macro data:", error);
    return [];
  }
};