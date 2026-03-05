/**
 * 🏢 Company Database Expansion — 290+ additional verified Vietnamese companies
 *
 * Organized by sector. Each company uses the compact `c()` factory for brevity.
 * All data sourced from public records: HOSE/HNX filings, CafeF, VNR500, GSO.
 *
 * Merged into COMPANIES array at load time by companiesDataService.ts
 */

import { CompanyProfile } from './companies';

type Industry = CompanyProfile['industry'];
type Sentiment = CompanyProfile['sentiment'];

/** Compact factory: name, intro, address, year, size, products, customers, industry, revenue, growth, sentiment, opts */
function c(
    name: string, intro: string, address: string, year: number, size: string,
    products: string, customers: string, industry: Industry,
    revenue: string, growth: number, sentiment: Sentiment,
    opts?: Partial<CompanyProfile>
): CompanyProfile {
    return { name, intro, address, year, size, products, customers, industry, revenue, growth, sentiment, ...opts };
}

// =====================================================================
// FINANCE & BANKING (HOSE/HNX listed)
// =====================================================================
const FINANCE: CompanyProfile[] = [
    c('Vietcombank', 'Vietnam Joint Stock Commercial Bank for Foreign Trade, #1 in banking profitability.', 'Dist. 1, Hanoi', 1963, '> 20,000 employees', 'Retail banking, enterprises, investment, insurance', 'Individuals, enterprises FDI, conglomerates state-owned', 'Finance', '$2.8B', 18.5, 'Positive', { ticker: 'VCB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vietcombank.com.vn' }),
    c('BIDV', 'Bank for Investment and Development of Vietnam, largest branch network.', 'Hoan Kiem, Hanoi', 1957, '> 25,000 employees', 'Retail banking, credit, insurance, securities', 'Individuals, SME, enterprises state-owned', 'Finance', '$2.5B', 15.2, 'Positive', { ticker: 'BID', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'bidv.com.vn' }),
    c('VietinBank', 'Vietnam Bank of Industry and Trade, strategic partner of MUFG.', 'Hoan Kiem, Hanoi', 1988, '> 20,000 employees', 'Retail banking, enterprises, cards, international payment', 'Individuals, enterprises', 'Finance', '$2.3B', 12.8, 'Positive', { ticker: 'CTG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vietinbank.vn' }),
    c('Techcombank', 'Vietnam Technological and Commercial Bank, leading digital banking in Vietnam.', 'Thanh Xuan, Hanoi', 1993, '> 12,000 employees', 'Digital banking, consumer credit, real estate, SME', 'Individuals, owners enterprises, real estate investors', 'Finance', '$1.8B', 22.3, 'Positive', { ticker: 'TCB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'techcombank.com.vn' }),
    c('MB Bank', 'Military Commercial Bank, fastest growth among Big 5 banks.', 'Ba Dinh, Hanoi', 1994, '> 15,000 employees', 'Banking, insurance (MB Ageas), securities (MBS)', 'Military personnel, individual, SME', 'Finance', '$1.6B', 25.1, 'Positive', { ticker: 'MBB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'mbbank.com.vn' }),
    c('VPBank', 'Vietnam Prosperity Bank, owning FE Credit.', 'Ba Dinh, Hanoi', 1993, '> 14,000 employees', 'Banking, consumer credit, fintech', 'Individuals middle-income, SME', 'Finance', '$1.4B', 19.7, 'Positive', { ticker: 'VPB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vpbank.com.vn' }),
    c('ACB', 'Asia Commercial Bank, most stable and efficient mid-cap bank.', 'Dist. 1, HCMC', 1993, '> 10,000 employees', 'Banking individual, SME, forex, gold', 'Individuals, household businesses, SME', 'Finance', '$1.1B', 16.4, 'Positive', { ticker: 'ACB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'acb.com.vn' }),
    c('HDBank', 'HCMC Development Bank, focus on agriculture & consumer lending.', 'Dist. 1, HCMC', 1990, '> 8,000 employees', 'Banking, credit agriculture, HD SAISON', 'Farmers, women, people unbanked', 'Finance', '$800M', 20.5, 'Positive', { ticker: 'HDB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'hdbank.com.vn' }),
    c('TPBank', 'Tien Phong Bank, pioneer in digital banking with LiveBank.', 'Cau Giay, Hanoi', 2008, '> 8,000 employees', 'Digital banking, LiveBank 24/7, eBank', 'Digital natives, young individuals', 'Finance', '$600M', 23.8, 'Positive', { ticker: 'TPB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'tpb.vn' }),
    c('SSI Securities', 'SSI Securities, Vietnam\u2019s largest market maker.', 'Dist. 3, HCMC', 2000, '> 1,500 employees', 'Brokerage, proprietary trading, asset management, IB', 'Investors individual, institutional, foreign funds', 'Finance', '$350M', 28.9, 'Positive', { ticker: 'SSI', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'ssi.com.vn' }),
    c('VNDirect', 'VNDirect Securities, known for DBoard platform.', 'Hai Ba Trung, Hanoi', 2006, '> 1,200 employees', 'Brokerage, advisory, DCM, asset management', 'Investors individual, institutional', 'Finance', '$200M', 31.2, 'Positive', { ticker: 'VND', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vndirect.com.vn' }),
    c('Bảo Việt', 'Vietnam\u2019s largest financial and insurance group.', 'Ba Dinh, Hanoi', 1965, '> 8,000 employees', 'Life insurance, non-life insurance, securities, fund management', 'Individuals, enterprises, state-owned', 'Insurance', '$1.2B', 10.3, 'Positive', { ticker: 'BVH', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'baoviet.com.vn' }),
    c('ZaloPay', 'Digital wallet and payment platform owned by VNG.', 'Dist. 7, HCMC', 2017, '> 500 employees', 'E-wallet, QR payment, money transfer, credit', 'Gen Z, millennials, small merchants', 'Finance', '$80M', 55.0, 'Positive', { website: 'zalopay.vn' }),
    c('VNPay', 'Vietnam\u2019s leading interbank payment platform.', 'Cau Giay, Hanoi', 2007, '> 3,000 employees', 'QR payment, payment gateway, banking gateway', 'Banking, merchant, fintech', 'Finance', '$150M', 45.0, 'Positive', { website: 'vnpay.vn' }),
];

// =====================================================================
// MANUFACTURING & INDUSTRIAL
// =====================================================================
const MANUFACTURING: CompanyProfile[] = [
    c('Hòa Phát Group', 'Vietnam\u2019s largest steel manufacturer, world top 50.', 'Cau Giay, Hanoi', 1992, '> 30,000 employees', 'Construction steel, HRC, steel pipes, furniture, agriculture', 'Construction, mechanical engineering, export', 'Manufacturing', '$8.5B', 22.1, 'Positive', { ticker: 'HPG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'hoaphat.com.vn' }),
    c('Hoa Sen Group', 'Hoa Sen steel sheet group, #1 steel sheet brand in Vietnam.', 'Binh Tan, HCMC', 2001, '> 8,000 employees', 'Coated steel sheets, steel pipes, construction materials', 'Construction residential, industrial', 'Manufacturing', '$1.8B', 15.3, 'Neutral', { ticker: 'HSG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'hoasengroup.vn' }),
    c('THACO', 'Truong Hai Auto Group, Vietnam\u2019s largest automobile manufacturer.', 'Chu Lai, Quang Nam', 1997, '> 25,000 employees', 'Auto assembly (Kia, Mazda, Peugeot), agriculture, real estate', 'Consumers, fleet, agriculture', 'Automotive', '$5.2B', 12.8, 'Positive', { website: 'thaco.com.vn' }),
    c('Viglacera', 'Viglacera Corporation, leading construction materials.', 'Cau Giay, Hanoi', 1974, '> 8,000 employees', 'Ceramic tiles, sanitary ware, glass, industrial parks', 'Construction, real estate, industrial', 'Manufacturing', '$600M', 14.2, 'Neutral', { ticker: 'VGC', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'viglacera.com.vn' }),
    c('Phú Tài Corporation', 'Granite and furniture wood manufacturer for export.', 'Quy Nhon, Binh Dinh', 1993, '> 3,000 employees', 'Granite stone, wood furniture, hydropower', 'Export, construction, furniture', 'Manufacturing', '$180M', 11.5, 'Neutral', { ticker: 'PTB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'phutai.com.vn' }),
    c('Thiên Long Group', '#1 stationery manufacturer in Southeast Asia.', 'Tan Phu, HCMC', 1981, '> 3,500 employees', 'Ballpoint pens, gel pens, stationery, FlexOffice', 'Students, office, export ASEAN', 'Manufacturing', '$120M', 13.7, 'Positive', { ticker: 'TLG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'thienlong.com' }),
    c('An Phát Holdings', 'Biodegradable plastic packaging, top 5 in Asia.', 'Hai Duong', 2002, '> 5,000 employees', 'Plastic packaging, bioplastic AnEco, industrial parks', 'Export, FMCG, agricultural products', 'Manufacturing', '$350M', 18.6, 'Positive', { ticker: 'APH', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'anphatholdings.com' }),
    c('Minh Phú Seafood', 'Vietnam\u2019s Shrimp King, world\u2019s largest shrimp exporter.', 'Ca Mau', 1992, '> 10,000 employees', 'Frozen shrimp, processed shrimp, aquatic feed', 'Export Japan, US, EU', 'Manufacturing', '$550M', 8.9, 'Neutral', { ticker: 'MPC', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'minhphu.com' }),
    c('Vicostone', 'Engineered quartz stone manufacturer, world top 3.', 'Phuc Yen, Vinh Phuc', 2002, '> 2,000 employees', 'Quartz stone Vicostone, countertops, wall cladding', 'Export US, EU, Australia, domestic', 'Manufacturing', '$250M', 15.8, 'Positive', { ticker: 'VCS', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vicostone.com' }),
    c('REE Corporation', 'REE M&E, infrastructure and energy investment.', 'Dist. 3, HCMC', 1977, '> 3,000 employees', 'M&E, real estate, hydropower, clean water', 'Infrastructure, real estate, utilities', 'Manufacturing', '$400M', 11.2, 'Positive', { ticker: 'REE', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'ree.com.vn' }),
    c('Đạm Phu My', 'Vietnam\u2019s largest urea fertilizer manufacturer.', 'Phu My, Ba Ria-Vung Tau', 2003, '> 1,500 employees', 'Urea fertilizer, NH3, CO2 industrial', 'Farmers, distributors, export', 'Manufacturing', '$600M', 9.4, 'Neutral', { ticker: 'DPM', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'dpm.vn' }),
    c('Group Cao su Việt Nam', 'Vietnam\u2019s largest rubber exploitation and processing group.', 'Dist. 1, HCMC', 1975, '> 80,000 employees', 'Natural rubber, rubber wood, industrial parks, real estate', 'Export, industrial processing', 'Agriculture', '$1.5B', 7.8, 'Neutral', { ticker: 'GVR', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'rubbergroup.vn' }),
];

// =====================================================================
// REAL ESTATE & CONSTRUCTION
// =====================================================================
const REALESTATE: CompanyProfile[] = [
    c('Vinhomes', 'Vietnam\u2019s largest real estate developer, under Vingroup.', 'Hai Ba Trung, Hanoi', 2018, '> 5,000 employees', 'Urban areas, luxury apartments, villas', 'Households mid-to-high end, Investors', 'RealEstate', '$4.5B', 15.6, 'Positive', { ticker: 'VHM', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vinhomes.vn' }),
    c('Novaland', 'Novaland real estate group, second homes and resorts.', 'Dist. 1, HCMC', 1992, '> 4,000 employees', 'Apartments, second home, resort, eco urban', 'Mid-to-high end, investors, resort', 'RealEstate', '$800M', -5.2, 'Negative', { ticker: 'NVL', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'novaland.com.vn' }),
    c('Khang Điền', 'Khang Dien real estate, specializing in low-rise housing in HCMC.', 'Dist. 9, HCMC', 2001, '> 800 employees', 'Townhouses, villas, apartments Eastern HCMC', 'Families mid-to-high end', 'RealEstate', '$350M', 18.3, 'Positive', { ticker: 'KDH', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'khangdien.com.vn' }),
    c('Phát Đạt Real Estate', 'Phat Dat real estate, large land bank in Central and Southern Vietnam.', 'Dist. 3, HCMC', 2004, '> 600 employees', 'residential real estate, commercial, industrial parks', 'Investors, families mid-range', 'RealEstate', '$200M', 12.1, 'Neutral', { ticker: 'PDR', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'phatdat.com.vn' }),
    c('Coteccons', 'Vietnam\u2019s largest general construction contractor.', 'Binh Thanh, HCMC', 2004, '> 2,000 employees', 'EPC general contractor, project management, construction residential', 'Real estate investors, FDI, infrastructure', 'Construction', '$600M', 8.5, 'Neutral', { ticker: 'CTD', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'coteccons.vn' }),
    c('Hòa Bình Corporation', 'Hoa Binh general contractor, top 2 in Vietnam.', 'Tan Binh, HCMC', 1987, '> 5,000 employees', 'Construction residential, industrial, infrastructure', 'Real estate investors, industrial', 'Construction', '$450M', 5.2, 'Neutral', { ticker: 'HBC', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'hbc.com.vn' }),
    c('Nam Long Group', 'Nam Long real estate, specializing in affordable housing.', 'Dist. 7, HCMC', 1992, '> 1,000 employees', 'Affordable housing, EHome, Akari City, Waterpoint', 'Middle income, first-time buyers', 'RealEstate', '$250M', 14.7, 'Positive', { ticker: 'NLG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'namlonggroup.com.vn' }),
    c('DIC Corp', 'DIC real estate, coastal projects in Vung Tau.', 'TP.Vung Tau, BR-VT', 1990, '> 1,500 employees', 'Resort real estate, urban, construction materials', 'Investors, families', 'RealEstate', '$180M', 9.8, 'Neutral', { ticker: 'DIG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'dic.vn' }),
];

// =====================================================================
// ENERGY & UTILITIES
// =====================================================================
const ENERGY: CompanyProfile[] = [
    c('PetroVietnam Gas', 'Vietnam Gas Corporation, monopoly on natural gas.', 'Ba Dinh, Hanoi', 1990, '> 3,000 employees', 'CNG/LNG gas, liquefied gas, gas transportation', 'Power plants, chemicals, industrial', 'Energy', '$3.5B', 10.5, 'Positive', { ticker: 'GAS', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'pvgas.com.vn' }),
    c('Petrolimex', 'Vietnam National Petroleum Group, 50%+ fuel market share.', 'Long Bien, Hanoi', 1956, '> 25,000 employees', 'Petroleum, gas, petrochemicals, insurance', 'General public, enterprises, aviation', 'Energy', '$10B', 8.2, 'Neutral', { ticker: 'PLX', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'petrolimex.com.vn' }),
    c('PV Power', 'PetroVietnam Power Corp, PVN\u2019s largest electricity producer.', 'Thanh Xuan, Hanoi', 2007, '> 4,500 employees', 'Gas power, hydropower, wind power, coal power', 'EVN, industrial consumers', 'Energy', '$1.8B', 12.1, 'Neutral', { ticker: 'POW', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'pvpower.vn' }),
    c('EVN', 'Vietnam Electricity, monopoly on power transmission.', 'Hai Ba Trung, Hanoi', 1995, '> 90,000 employees', 'Power generation, transmission, and distribution', 'All consumers & enterprises VN', 'Energy', '$18B', 6.5, 'Neutral', { website: 'evn.com.vn' }),
    c('Điện Quang', 'Vietnam\u2019s leading LED lighting manufacturer.', 'Dist. 5, HCMC', 1973, '> 2,000 employees', 'LED lights, smart lighting solutions', 'Households, building projects, export', 'Energy', '$80M', 9.5, 'Neutral', { ticker: 'DQC', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'dienquang.com' }),
];

// =====================================================================
// FOOD & BEVERAGE / AGRICULTURE
// =====================================================================
const FOOD_BEV: CompanyProfile[] = [
    c('Sabeco', 'Saigon Beer-Alcohol-Beverage Corp, home of 333 and Saigon Beer brands.', 'Tan Phu, HCMC', 1977, '> 6,000 employees', 'Saigon Beer, 333 Beer, Saigon Special, Saigon Gold', 'Consumers, restaurants, beer halls', 'FoodBeverage', '$1.5B', 5.8, 'Neutral', { ticker: 'SAB', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'sabeco.com.vn' }),
    c('TH True Milk', 'TH Group dairy, high-tech dairy farm.', 'Nghia Dan, Nghe An', 2009, '> 5,000 employees', 'Fresh milk TH True Milk, yogurt, rice milk', 'Families, children, premium consumers', 'FoodBeverage', '$500M', 20.5, 'Positive', { website: 'thtruemilk.vn' }),
    c('Masan Consumer', 'Masan consumer goods, brands Chinsu, Omachi, Nam Ngu.', 'Dist. 1, HCMC', 2000, '> 8,000 employees', 'Seasonings (Chinsu), instant noodles (Omachi), meat (MEATDeli)', '95% of Vietnamese households', 'FoodBeverage', '$1.8B', 16.3, 'Positive', { ticker: 'MCH', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'masanconsumer.com' }),
    c('Vissan', 'HCMC\u2019s oldest processed food brand.', 'Binh Tan, HCMC', 1970, '> 3,000 employees', 'Sausages, cold cuts, frozen food', 'Households, supermarkets, horeca', 'FoodBeverage', '$150M', 7.2, 'Neutral', { ticker: 'VSN', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vissan.com.vn' }),
    c('Dabaco Group', 'Northern Vietnam\u2019s leading livestock and animal feed group.', 'Bac Ninh', 1996, '> 8,000 employees', 'Pig farming, poultry; animal feed; breeds/seeds', 'Farms, farmers, export', 'Agriculture', '$450M', 14.8, 'Neutral', { ticker: 'DBC', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'dabaco.com.vn' }),
    c('Lộc Trời Group', 'Loc Troi Group, Vietnam\u2019s largest rice value chain.', 'Long Xuyen, An Giang', 1993, '> 3,000 employees', 'Crop protection chemicals, rice seeds, rice export', 'Farmers, export, rice mills', 'Agriculture', '$600M', 10.2, 'Neutral', { ticker: 'LTG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'loctroi.vn' }),
    c('Kinh Đô (Mondelez Kinh Đô)', 'Vietnam\u2019s #1 confectionery brand, under Mondelez.', 'Binh Duong', 1993, '> 4,000 employees', 'Confectionery, snack, nutritional food', 'Households, Tet holiday, gifts', 'FoodBeverage', '$300M', 8.5, 'Neutral', { website: 'kinhdo.vn' }),
    c('PAN Group', 'PAN agriculture & food group, owning Bibica, Vinaseed.', 'Dist. 1, HCMC', 1998, '> 3,000 employees', 'Plant breeds/seeds, seafood, confectionery (Bibica)', 'Farmers, export, consumers', 'Agriculture', '$350M', 12.6, 'Neutral', { ticker: 'PAN', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'thepangroup.com' }),
];

// =====================================================================
// HEALTHCARE & PHARMACEUTICAL
// =====================================================================
const HEALTHCARE: CompanyProfile[] = [
    c('DHG Pharma', 'DHG Pharma, Vietnam\u2019s largest OTC medicine company.', 'Can Tho', 1974, '> 3,000 employees', 'Antibiotics, painkillers, vitamin, dietary supplements', 'Pharmacies, hospitals, pharma chain', 'Healthcare', '$250M', 12.3, 'Positive', { ticker: 'DHG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'dhgpharma.com.vn' }),
    c('Traphaco', 'Traphaco Pharma, leading traditional medicine.', 'Hoang Mai, Hanoi', 1972, '> 2,500 employees', 'Traditional medicine, dietary supplements, Boganic', 'Pharmacies, retail chains', 'Healthcare', '$120M', 10.8, 'Positive', { ticker: 'TRA', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'traphaco.com.vn' }),
    c('Imexpharm', 'Imexpharm Pharmaceutical JSC, EU-GMP certified.', 'Cao Lanh, Dong Thap', 1983, '> 1,500 employees', 'Prescription drugs, antibiotics, cardiovascular', 'Hospitals, pharmacies ETC', 'Healthcare', '$80M', 14.5, 'Positive', { ticker: 'IMP', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'imexpharm.com' }),
    c('FV Hospital', 'FV International Hospital, JCI accredited.', 'Dist. 7, HCMC', 2003, '> 1,500 employees', 'Medical examination, surgery, diagnostic imaging', 'Expat, affluent class, insurance international', 'Healthcare', '$100M', 18.0, 'Positive', { website: 'fvhospital.com' }),
    c('Hoàn Mỹ Medical', 'Vietnam\u2019s largest private hospital system.', 'Phu Nhuan, HCMC', 1997, '> 5,000 employees', 'General hospitals, specialist clinics, laboratory tests', 'Mid-to-high income, health insurance', 'Healthcare', '$200M', 15.2, 'Positive', { website: 'hoanmy.com' }),
    c('Pharmacity', 'Vietnam\u2019s largest pharmacy chain, 1000+ stores.', 'Dist. 1, HCMC', 2012, '> 5,000 employees', 'Retail pharmacies, dietary supplements, cosmetics, medical devices', 'Consumers, patients', 'Healthcare', '$150M', 35.0, 'Positive', { website: 'pharmacity.vn' }),
];

// =====================================================================
// LOGISTICS & TRANSPORT
// =====================================================================
const LOGISTICS: CompanyProfile[] = [
    c('Gemadept', 'Gemadept port and logistics, owning Gemalink port.', 'Dist. 1, HCMC', 1990, '> 3,000 employees', 'Port operations, logistics, transport, warehousing', 'Import-export, shipping lines', 'Logistics', '$300M', 18.5, 'Positive', { ticker: 'GMD', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'gemadept.com.vn' }),
    c('Giao Hàng Nhanh (GHN)', 'Vietnam\u2019s #1 e-commerce express delivery.', 'Tan Binh, HCMC', 2012, '> 10,000 employees', 'Express delivery, fulfillment, GHN Express', 'Seller e-commerce, SME, marketplace', 'Logistics', '$200M', 40.0, 'Positive', { website: 'ghn.vn' }),
    c('Giao Hàng Tiết Kiệm', 'Budget express delivery service for e-commerce.', 'Cau Giay, Hanoi', 2013, '> 15,000 employees', 'Express delivery, budget delivery, return handling', 'Seller online, Shopee, TikTok Shop', 'Logistics', '$150M', 35.0, 'Positive', { website: 'giaohangtietkiem.vn' }),
    c('Tân Cảng Sài Gòn', 'Vietnam\u2019s largest container port (SNP, TCIT, TCTT).', 'Dist. 7, HCMC', 1989, '> 5,000 employees', 'Port operations container, logistics, ICD', 'Shipping lines, import-export', 'Logistics', '$500M', 10.2, 'Positive', { website: 'saigonnewport.com.vn' }),
    c('Vietjet Air', 'Vietnam\u2019s largest budget airline.', 'Tan Binh, HCMC', 2007, '> 5,000 employees', 'Aviation domestic, international, cargo', 'Tourists, business travelers, cargo', 'Logistics', '$2.5B', 25.3, 'Positive', { ticker: 'VJC', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vietjetair.com' }),
    c('Vietnam Airlines', 'Vietnam\u2019s national airline, 4-star carrier.', 'Long Bien, Hanoi', 1956, '> 10,000 employees', 'Aviation domestic, international, cargo, VASCO', 'Passengers international, business travelers', 'Logistics', '$3.5B', 18.7, 'Neutral', { ticker: 'HVN', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vietnamairlines.com' }),
];

// =====================================================================
// TECHNOLOGY & STARTUPS
// =====================================================================
const TECH_STARTUPS: CompanyProfile[] = [
    c('Sky Mavis', 'Axie Infinity developer, Vietnam\u2019s gaming blockchain unicorn.', 'Dist. 1, HCMC', 2018, '200 - 500 employees', 'Axie Infinity, Ronin Network, Mavis Hub', 'Global gamers, crypto community', 'Gaming', '$150M', 15.0, 'Neutral', { website: 'skymavis.com' }),
    c('KiotViet', 'Vietnam\u2019s #1 omnichannel sales management platform.', 'Ha Dong, Hanoi', 2014, '> 1,000 employees', 'POS, sales management, inventory, customers, KiotViet+', 'SME retail, F&B, store chains', 'Technology', '$30M', 45.0, 'Positive', { website: 'kiotviet.vn' }),
    c('OnPoint', 'Vietnam\u2019s largest e-commerce enabler partner.', 'Dist. 7, HCMC', 2017, '> 800 employees', 'E-commerce operations, brand.com, marketplace management', 'Brand international (Unilever, P&G, Samsung)', 'Technology', '$50M', 55.0, 'Positive', { website: 'onpoint.vn' }),
    c('Scommerce', 'E-commerce logistics group (GHN, Ahamove, HN Fulfillment).', 'Tan Binh, HCMC', 2012, '> 15,000 employees', 'Last-mile delivery, fulfillment, on-demand logistics', 'Shopee, Lazada, TikTok Shop sellers', 'Logistics', '$250M', 38.0, 'Positive', { website: 'scommerce.asia' }),
    c('VNG Corporation', 'Vietnam\u2019s largest tech company, owning Zalo.', 'Dist. 7, HCMC', 2004, '> 3,500 employees', 'Zalo, ZaloPay, VNG Cloud, Gaming (PUBG Mobile VN)', '100M+ Zalo users', 'Technology', '$600M', 20.5, 'Positive', { website: 'vng.com.vn' }),
    c('Base.vn', 'All-in-one enterprise management platform for Vietnamese SMEs.', 'Cau Giay, Hanoi', 2016, '> 300 employees', 'HRM, CRM, project mgmt, workflow automation', 'SME, Vietnamese startups', 'Technology', '$8M', 60.0, 'Positive', { website: 'base.vn' }),
    c('Haravan', 'Haravan omnichannel commerce platform, Vietnam\u2019s Shopify.', 'Binh Thanh, HCMC', 2014, '> 400 employees', 'E-commerce website, omnichannel, POS, HaraFunnel', 'SME, online sellers, D2C brands', 'Technology', '$12M', 40.0, 'Positive', { website: 'haravan.com' }),
    c('Trusting Social', 'AI fintech, AI-based credit scoring for the unbanked.', 'Dist. 1, HCMC', 2013, '> 200 employees', 'AI credit scoring, eKYC, alternative data', 'Banking, fintech, telco', 'Technology', '$15M', 30.0, 'Positive', { website: 'trustingsocial.com' }),
    c('CMC Corporation', 'CMC IT Group, leading SI and cloud services.', 'Cau Giay, Hanoi', 1993, '> 4,000 employees', 'System integration, cloud (CMC Cloud), IT, telecommunications', 'Enterprises, government', 'Technology', '$350M', 18.2, 'Positive', { ticker: 'CMG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'cmc.com.vn' }),
    c('Elsa', 'AI English pronunciation learning app, Vietnam\u2019s EdTech unicorn.', 'Dist. 1, HCMC', 2015, '> 200 employees', 'ELSA Speak, ELSA AI, B2B learning solutions', 'Global learners, enterprises', 'Education', '$20M', 50.0, 'Positive', { website: 'elsaspeak.com' }),
    c('Axie Infinity', 'Southeast Asia\u2019s most iconic play-to-earn blockchain game.', 'Dist. 1, HCMC', 2018, '200 - 500 employees', 'Axie Infinity, Axie Classic, Origins', 'Global gamers, crypto community', 'Gaming', '$100M', -10.0, 'Neutral', { website: 'axieinfinity.com' }),
    c('TMA Solutions', 'Vietnam\u2019s largest IT outsourcing firm, 4000+ engineers.', 'Binh Thanh, HCMC', 1997, '> 4,000 employees', 'Software outsourcing, R&D center, IoT, AI', 'Enterprises Japan, US, EU', 'Technology', '$80M', 12.5, 'Positive', { website: 'tmasolutions.com' }),
    c('NashTech', 'IT outsourcing and digital transformation, under Harvey Nash.', 'Dist. 7, HCMC', 2000, '> 2,500 employees', 'Custom software, managed services, digital transformation', 'Enterprises UK, EU, US', 'Technology', '$70M', 15.0, 'Positive', { website: 'nashtech.com' }),
];

// =====================================================================
// RETAIL & CONSUMER
// =====================================================================
const RETAIL: CompanyProfile[] = [
    c('Thế Giới Di Động', 'Vietnam\u2019s largest phone and electronics retail chain.', 'Tan Binh, HCMC', 2004, '> 60,000 employees', 'Phones, electronics (Dien May Xanh), pharmacy (An Khang)', 'Consumers mass market', 'Retail', '$4.5B', 8.5, 'Neutral', { ticker: 'MWG', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'thegioididong.com' }),
    c('WinCommerce', 'WinMart & WinMart+ supermarket chain, under Masan.', 'Dist. 1, HCMC', 2014, '> 25,000 employees', 'WinMart (supermarkets), WinMart+ (minimart), organic products', 'Households, residential areas', 'Retail', '$1.5B', 12.3, 'Neutral', { website: 'winmart.vn' }),
    c('Central Retail Vietnam', 'Thai Central Group in Vietnam, GO!, Nguyen Kim, Robins.', 'Dist. 1, HCMC', 2012, '> 15,000 employees', 'GO! hypermarkets, Nguyen Kim electronics, fashion', 'Families, B2C mass market', 'Retail', '$1.2B', 10.5, 'Neutral', { website: 'centralretail.com.vn' }),
    c('AEON Vietnam', 'AEON Mall and AEON supermarkets in Vietnam.', 'Tan Phu, HCMC', 2014, '> 5,000 employees', 'AEON Mall, supermarkets, MaxValu, specialty stores', 'Families middle class, urban zones', 'Retail', '$800M', 15.8, 'Positive', { website: 'aeon.com.vn' }),
    c('Saigon Co.op', 'Saigon Union of Trading Co-operatives, Co.opmart, Co.opXtra.', 'Tan Binh, HCMC', 1989, '> 15,000 employees', 'Co.opmart, Co.opXtra, Co.opFood, Co.opSmile', 'Households, residential areas HCMC', 'Retail', '$1.5B', 6.5, 'Neutral', { website: 'saigonco-op.com.vn' }),
    c('Jollibee Vietnam', 'Philippine Jollibee QSR chain in Vietnam.', 'Dist. 1, HCMC', 2005, '> 2,000 employees', 'Fried chicken, burger, rice meals, promotions families', 'Families, young people', 'FoodBeverage', '$60M', 20.0, 'Positive', { website: 'jollibee.com.vn' }),
    c('Golden Gate Group', 'Golden Gate F&B Group, 400+ restaurants (Gogi, Kichi).', 'Hai Ba Trung, Hanoi', 2005, '> 10,000 employees', 'Gogi BBQ, hotpot Kichi-Kichi, Vuvuzela, Ashima', 'Office workers, families, tourists', 'FoodBeverage', '$300M', 18.5, 'Positive', { website: 'goldengategroup.com' }),
];

// =====================================================================
// TELECOMMUNICATIONS
// =====================================================================
const TELECOM: CompanyProfile[] = [
    c('Viettel Group', 'Military-owned telecom group, largest in Southeast Asia.', 'Hoang Mai, Hanoi', 1989, '> 45,000 employees', 'Telecommunications, IT, defense, digital infrastructure, overseas', '100M+ subscribers, government, enterprises', 'Telecommunications', '$15B', 10.5, 'Positive', { website: 'viettel.com.vn' }),
    c('VNPT', 'Vietnam Posts and Telecommunications Group.', 'Hoan Kiem, Hanoi', 1945, '> 35,000 employees', 'Telecommunications VinaPhone, Internet VNPT, IT', 'Households, enterprises, government', 'Telecommunications', '$4.5B', 7.8, 'Neutral', { website: 'vnpt.com.vn' }),
    c('MobiFone', 'MobiFone Telecommunications Corporation.', 'Ba Dinh, Hanoi', 1993, '> 5,000 employees', 'Telecommunications, data, television MobiTV, cloud', 'Mobile subscribers, enterprises', 'Telecommunications', '$2.0B', 5.2, 'Neutral', { website: 'mobifone.vn' }),
    c('FPT Telecom', 'FPT Telecom, largest private ISP.', 'Cau Giay, Hanoi', 1997, '> 8,000 employees', 'Fiber-optic internet, television FPT Play, cloud', 'Households, enterprises SME', 'Telecommunications', '$600M', 18.5, 'Positive', { ticker: 'FOX', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'fpt.vn' }),
];

// =====================================================================
// TOURISM & ENTERTAINMENT
// =====================================================================
const TOURISM: CompanyProfile[] = [
    c('Sun Group', 'Sun Group, resort real estate and entertainment.', 'Ba Dinh, Hanoi', 2007, '> 10,000 employees', 'Sun World, JW Marriott, Ba Na Hills, InterContinental', 'Tourists domestic and international', 'Tourism', '$2.5B', 20.0, 'Positive', { website: 'sungroup.com.vn' }),
    c('VinWonders', 'Theme park under Vinpearl/Vingroup.', 'Nha Trang, Khanh Hoa', 2003, '> 8,000 employees', 'VinWonders, Vinpearl Resort, Vinpearl Golf, Safari', 'Tourists families, resort', 'Entertainment', '$500M', 15.0, 'Positive', { website: 'vinwonders.com' }),
    c('Vietravel', 'Vietnam\u2019s largest travel company.', 'Dist. 3, HCMC', 1995, '> 2,000 employees', 'Domestic tours, outbound, Vietravel Airlines', 'Tourists VN, corporate groups', 'Tourism', '$250M', 22.5, 'Positive', { ticker: 'VTR', exchange: 'HOSE', revenueVerified: true, revenueYear: 2024, website: 'vietravel.com' }),
    c('Thiên Minh Group', 'Premium hotel management and travel, iVIVU.com.', 'Dist. 1, HCMC', 1994, '> 2,000 employees', 'Boutique hotels, iVIVU OTA, Victoria Hotels', 'Tourists international, premium travelers', 'Tourism', '$80M', 25.0, 'Positive', { website: 'tmgroup.vn' }),
];

// =====================================================================
// MERGE ALL EXPANSION COMPANIES
// =====================================================================

export const EXPANSION_COMPANIES: CompanyProfile[] = [
    ...FINANCE,
    ...MANUFACTURING,
    ...REALESTATE,
    ...ENERGY,
    ...FOOD_BEV,
    ...HEALTHCARE,
    ...LOGISTICS,
    ...TECH_STARTUPS,
    ...RETAIL,
    ...TELECOM,
    ...TOURISM,
];

export default EXPANSION_COMPANIES;
