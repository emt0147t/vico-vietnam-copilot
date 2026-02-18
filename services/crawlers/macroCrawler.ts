import axios from 'axios';

export const fetchMacroEconomics = async () => {
  try {
    console.log("🌍 Đang lấy dữ liệu Vĩ mô từ World Bank...");

    // URL API World Bank cho Việt Nam (Mã: VNM)
    // GDP Growth: NY.GDP.MKTP.KD.ZG
    // Lạm phát (CPI): FP.CPI.TOTL.ZG
    // FDI: BX.KLT.DINV.CD.WD
    const indicators = [
      'NY.GDP.MKTP.KD.ZG', 
      'FP.CPI.TOTL.ZG',
      'BX.KLT.DINV.CD.WD' 
    ];

    const results = [];

    for (const indicator of indicators) {
      // Gọi API lấy dữ liệu 5 năm gần nhất
      const url = `https://api.worldbank.org/v2/country/VNM/indicator/${indicator}?format=json&per_page=5&date=2020:2025`;
      const response = await axios.get(url);
      
      // World Bank trả về mảng: [Metadata, Data[]]
      const data = response.data[1]; 
      
      if (data && data.length > 0) {
        // Lấy năm gần nhất có số liệu
        const latest = data.find((d: any) => d.value !== null);
        results.push({
          indicator: latest.indicator.value,
          year: latest.date,
          value: latest.value,
          unit: indicator === 'BX.KLT.DINV.CD.WD' ? 'USD' : '%'
        });
      }
    }

    console.log("✅ Kết quả Vĩ mô:", results);
    return results; // Sau này sẽ lưu vào DB

  } catch (error) {
    console.error("❌ Lỗi lấy Macro data:", error);
    return [];
  }
};