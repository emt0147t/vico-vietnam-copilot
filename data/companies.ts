
export interface CompanyProfile {
  name: string;
  intro: string;
  address: string;
  year: number;
  size: string;
  products: string;
  customers: string;
  industry: 'Automotive' | 'Technology' | 'Education' | 'Retail' | 'Finance';
  website?: string;
  revenue: string;
  growth: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  logoUrl?: string;
  intro_new?: string; // Từ CSV cột "Giới thiệu mới"
  products_new?: string; // Từ CSV cột "Sản phẩm dịch vụ mới"
  customers_new?: string; // Từ CSV cột "Khách hàng tiềm năng mới"
}

export const COMPANIES: CompanyProfile[] = [
  {
    name: "VinFast (Vingroup)",
    intro: "Nhà sản xuất ô tô và xe máy điện đầu tiên của Việt Nam vươn tầm thế giới.",
    address: "Khu kinh tế Đình Vũ - Cát Hải, Hải Phòng",
    year: 2017,
    size: "> 6.000 người",
    revenue: "$1.2B",
    growth: 15.5,
    sentiment: "Neutral",
    products: "Ô tô điện (VF3, VF5, VF8, VF9), Xe máy điện, Xe buýt điện",
    customers: "Người tiêu dùng Việt Nam, thị trường Mỹ, Châu Âu, các hãng taxi xanh.",
    industry: "Automotive",
    website: "vinfastauto.com",
    logoUrl: "https://logo.clearbit.com/vinfastauto.com"
  },
  {
    name: "Toyota Việt Nam",
    intro: "Liên doanh ô tô Nhật Bản, dẫn đầu thị phần tại Việt Nam trong nhiều năm.",
    address: "Phúc Thắng, Phúc Yên, Vĩnh Phúc",
    year: 1995,
    size: "> 1.900 người",
    revenue: "$1.8B",
    growth: 5.2,
    sentiment: "Positive",
    products: "Vios, Camry, Corolla Cross, Innova, Fortuner (Lắp ráp & Nhập khẩu)",
    customers: "Gia đình, doanh nghiệp vận tải, cơ quan nhà nước.",
    industry: "Automotive",
    website: "toyota.com.vn",
    logoUrl: "https://logo.clearbit.com/toyota.com.vn"
  },
  {
    name: "Thaco Auto (Trường Hải)",
    intro: "Tập đoàn ô tô lớn nhất VN, lắp ráp và phân phối nhiều thương hiệu quốc tế.",
    address: "Khu kinh tế mở Chu Lai, Quảng Nam",
    year: 1997,
    size: "> 20.000 người",
    revenue: "$3.5B",
    growth: 8.4,
    sentiment: "Positive",
    products: "Lắp ráp xe Kia, Mazda, Peugeot, BMW, xe tải/bus Thaco",
    customers: "Đa dạng phân khúc từ bình dân đến hạng sang, doanh nghiệp logistics.",
    industry: "Automotive",
    website: "thacoauto.vn",
    logoUrl: "https://logo.clearbit.com/thacoauto.vn"
  },
  {
    name: "Hyundai Thành Công",
    intro: "Đơn vị sản xuất và phân phối độc quyền xe du lịch Hyundai tại Việt Nam.",
    address: "KCN Gián Khẩu, Gia Viễn, Ninh Bình",
    year: 1999,
    size: "> 5.000 người",
    revenue: "$2.1B",
    growth: 12.1,
    sentiment: "Positive",
    products: "Accent, Santa Fe, Tucson, Grand i10, Creta",
    customers: "Khách hàng trẻ, gia đình trẻ, người chạy dịch vụ công nghệ.",
    industry: "Automotive",
    website: "hyundai.tcmotor.vn",
    logoUrl: "https://logo.clearbit.com/hyundai.com"
  },
  {
    name: "Ford Việt Nam",
    intro: "Thương hiệu Mỹ, nổi tiếng với các dòng xe gầm cao và bán tải mạnh mẽ.",
    address: "Phường Tứ Minh, TP Hải Dương, Hải Dương",
    year: 1995,
    size: "> 700 người",
    revenue: "$950M",
    growth: -2.3,
    sentiment: "Neutral",
    products: "Ranger, Everest, Territory, Transit",
    customers: "Người yêu thích Off-road, chủ doanh nghiệp, công ty du lịch vận tải.",
    industry: "Automotive",
    website: "ford.com.vn",
    logoUrl: "https://logo.clearbit.com/ford.com.vn"
  },
  {
    name: "FPT Smart Cloud (FPT.AI)",
    intro: "Công ty thành viên của FPT, cung cấp nền tảng AI toàn diện nhất VN.",
    address: "Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội",
    year: 2020,
    size: "> 1.000 người",
    revenue: "$50M",
    growth: 85.0,
    sentiment: "Positive",
    products: "FPT.AI (Chatbot, Voicebot, eKYC), FPT Cloud",
    customers: "Ngân hàng (TPBank, VPBank), Công ty tài chính, Bảo hiểm, Bán lẻ.",
    industry: "Technology",
    website: "fpt.ai",
    logoUrl: "https://logo.clearbit.com/fpt.ai"
  },
  {
    name: "VinBigData",
    intro: "Công ty công nghệ thuộc Vingroup, tập trung vào Khoa học dữ liệu và AI.",
    address: "KĐT Vinhomes Riverside, Long Biên, Hà Nội",
    year: 2018,
    size: "> 500 chuyên gia",
    revenue: "$25M",
    growth: 45.5,
    sentiment: "Neutral",
    products: "ViGPT (ChatGPT Việt), VinBase (Trợ lý ảo), VinDr (Y tế)",
    customers: "Hệ sinh thái Vingroup (VinFast, VinMec), Chính phủ, Ngân hàng.",
    industry: "Technology",
    website: "vinbigdata.com",
    logoUrl: "https://logo.clearbit.com/vinbigdata.com"
  },
  {
    name: "Viettel AI",
    intro: "Đơn vị chủ lực của Viettel về AI và Big Data.",
    address: "Tòa nhà Viettel, Cầu Giấy, Hà Nội",
    year: 2014,
    size: "> 500 kỹ sư",
    revenue: "$80M",
    growth: 30.2,
    sentiment: "Positive",
    products: "Viettel AI Platform, eKYC, Social Listening, Cyber Security",
    customers: "Chính phủ (Dịch vụ công), Quân đội, Doanh nghiệp lớn.",
    industry: "Technology",
    website: "viettelsolutions.vn",
    logoUrl: "https://logo.clearbit.com/viettelsolutions.vn"
  },
  {
    name: "Samsung R&D Vietnam (SRV)",
    intro: "Trung tâm R&D lớn nhất của Samsung tại ĐNÁ, tập trung mạnh vào AI di động.",
    address: "KĐT Tây Hồ Tây, Bắc Từ Liêm, Hà Nội",
    year: 2012,
    size: "> 2.200 kỹ sư",
    revenue: "N/A",
    growth: 10.0,
    sentiment: "Positive",
    products: "Nghiên cứu AI cho điện thoại Galaxy (Voice, Vision, Language)",
    customers: "Người dùng thiết bị Samsung toàn cầu (Dữ liệu nội bộ).",
    industry: "Technology",
    website: "samsung.com",
    logoUrl: "https://logo.clearbit.com/samsung.com"
  },
  {
    name: "Zalo AI (VNG)",
    intro: "Bộ phận nghiên cứu AI của kỳ lân công nghệ VNG.",
    address: "VNG Campus, Quận 7, TP.HCM",
    year: 2004,
    size: "> 3.000 người",
    revenue: "$400M",
    growth: 18.5,
    sentiment: "Neutral",
    products: "Trợ lý giọng nói Kiki, Zalo AI (eKYC, Content filtering)",
    customers: "70 triệu người dùng Zalo, ZingMP3, Chủ xe ô tô (tích hợp Kiki).",
    industry: "Technology",
    website: "zalo.ai",
    logoUrl: "https://logo.clearbit.com/zalo.ai"
  },
  {
    name: "Tesla Inc.",
    intro: "Công ty xe điện và năng lượng sạch giá trị nhất thế giới.",
    address: "Austin, Texas, Hoa Kỳ",
    year: 2003,
    size: "> 127.000 người",
    revenue: "$96.7B",
    growth: 19.0,
    sentiment: "Neutral",
    products: "Xe điện (Model S/3/X/Y), Pin Powerwall, Mái ngói năng lượng mặt trời",
    customers: "Thị trường toàn cầu, người dùng cao cấp, chính phủ các nước.",
    industry: "Automotive",
    website: "tesla.com",
    logoUrl: "https://logo.clearbit.com/tesla.com"
  },
  {
    name: "Elsa Corp (Elsa Speak)",
    intro: "Startup EduTech nổi tiếng toàn cầu do người Việt sáng lập, dùng AI luyện phát âm.",
    address: "TP.HCM & San Francisco, USA",
    year: 2015,
    size: "100 - 200 người",
    revenue: "$15M",
    growth: 120.0,
    sentiment: "Positive",
    products: "App ELSA Speak (Luyện nói tiếng Anh bằng AI nhận diện giọng nói)",
    customers: "Người học tiếng Anh toàn cầu, Trường học, Doanh nghiệp đào tạo nhân sự.",
    industry: "Education",
    website: "elsaspeak.com",
    logoUrl: "https://logo.clearbit.com/elsaspeak.com"
  }
];

export const getCompetitorsByIndustry = (industry: string, excludeName: string) => {
  return COMPANIES
    .filter(c => c.industry === industry && c.name !== excludeName)
    .map(c => ({ name: c.name, selected: false }));
};
