$content = [System.IO.File]::ReadAllText('D:\vico---vietnam-copilot\data\companies.ts', [System.Text.Encoding]::UTF8)
$original = $content

# Map of Vietnamese intro -> English intro
$translations = @(
    @('Tập đoàn du lịch - giải trí hàng đầu VN, xây Bà Nà Hills, Sun World, InterContinental Đà Nẵng.', "Vietnam's leading tourism and entertainment conglomerate, built Ba Na Hills, Sun World, InterContinental Da Nang."),
    @('Công ty tư vấn quản lý hàng đầu thế giới, \"The Firm\" trong ngành consulting.', "World's leading management consulting firm, ""The Firm"" of consulting."),
    @('Công ty dược phẩm lớn nhất Vietnam, thương hiệu Hapacol, Kẹo ho.', "Vietnam's largest pharmaceutical company, known for Hapacol and cough drops."),
    @('Công ty dược liệu và đông dược hàng đầu Vietnam, nổi tiếng với Boganic.', "Vietnam's leading traditional medicine and herbal pharmaceutical company, famous for Boganic."),
    @('Hãng dược phẩm lớn nhất thế giới, nổi tiếng với vaccine COVID-19 và thuốc bom tấn.', "World's largest pharmaceutical company, known for COVID-19 vaccine and blockbuster drugs."),
    @('Tập đoàn y tế - dược phẩm đa quốc gia lớn nhất thế giới.', "World's largest multinational healthcare and pharmaceutical corporation."),
    @('Công ty hàng không vũ trụ tư nhân lớn nhất, tạo ra Falcon 9, Starship, Starlink.', "Largest private aerospace company, creator of Falcon 9, Starship, and Starlink."),
    @('Tập đoàn hàng không vũ trụ lớn nhất nước Mỹ, sản xuất 737/777/787 và vũ trụ.', "America's largest aerospace corporation, manufacturing 737/777/787 aircraft and space systems."),
    @('Studio game di động lớn nhất Vietnam, 2.5B+ downloads, leader music games toàn cầu.', "Vietnam's largest mobile game studio, 2.5B+ downloads, global leader in music games."),
    @('Studio game mobile Vietnam, tạo ra game million downloads như Tile Master, Tile Connect.', "Vietnamese mobile game studio, created million-download games like Tile Master, Tile Connect."),
    @('Nhà phát triển game hàng đầu thế giới, tạo ra League of Legends và Valorant.', "World's leading game developer, creator of League of Legends and Valorant."),
    @('Huyền thoại gaming Nhật Bản, tạo ra Super Mario, Zelda, Pokémon, Nintendo Switch.', "Legendary Japanese gaming company, creator of Super Mario, Zelda, Pokemon, Nintendo Switch."),
    @('Nhà phát triển Fortnite và Unreal Engine, nền tảng game store cạnh tranh Steam.', "Developer of Fortnite and Unreal Engine, game store platform competing with Steam."),
    @('Công ty cybersecurity hàng đầu thế giới, leader endpoint protection (Falcon Platform).', "World's leading cybersecurity company, leader in endpoint protection (Falcon Platform)."),
    @('Tập đoàn an ninh mạng lớn nhất thế giới, chuyên firewall, SASE, Cloud Security.', "World's largest network security corporation, specializing in firewall, SASE, Cloud Security."),
    @('Công ty an ninh mạng hàng đầu Vietnam, cung cấp dịch vụ SOC, Pentest, Compliance.', "Vietnam's leading cybersecurity company, providing SOC, Pentest, and Compliance services."),
    @('Sàn giao dịch crypto lớn nhất nước Mỹ, publicly traded, hơn 110M verified users.', "America's largest crypto exchange, publicly traded, over 110M verified users."),
    @('Sàn giao dịch cryptocurrency lớn nhất thế giới theo khối lượng giao dịch.', "World's largest cryptocurrency exchange by trading volume."),
    @('Tập đoàn truyền thông số lớn nhất Vietnam, sở hữu Dân Trí, CafeF, Kenh14, Soha.', "Vietnam's largest digital media group, owning Dan Tri, CafeF, Kenh14, Soha."),
    @('Đài truyền hình quốc gia Vietnam, kênh truyền thông chính thống lớn nhất.', "Vietnam's national television broadcaster, the largest official media channel."),
    @('Tập đoàn giải trí số hàng đầu Vietnam, network YouTube/TikTok lớn nhất VN.', "Vietnam's leading digital entertainment group, largest YouTube/TikTok network in VN."),
    @('Tập đoàn truyền thông tài chính lớn nhất thế giới, Bloomberg Terminal là standard ngành.', "World's largest financial media corporation, Bloomberg Terminal is the industry standard."),
    @('Thương hiệu Fashion gia đình Vietnam, 140+ stores toàn quốc.', "Vietnamese family fashion brand, 140+ stores nationwide."),
    @('Tập đoàn Fashion nam cao cấp Vietnam, sở hữu nhiều thương hiệu nổi tiếng.', "Vietnam's premium men's fashion group, owning multiple famous brands."),
    @('Tập đoàn Fashion lớn nhất thế giới, sở hữu Zara, Massimo Dutti, Pull&Bear.', "World's largest fashion group, owning Zara, Massimo Dutti, Pull&Bear."),
    @('Thương hiệu thể thao lớn nhất thế giới, iconic \"Just Do It\" và Swoosh logo.', "World's largest sports brand, iconic ""Just Do It"" and Swoosh logo."),
    @('Giải bóng đá vô địch quốc gia Vietnam V-League, quản lý bởi VPF.', "Vietnam's national football championship V-League, managed by VPF."),
    @('Liên đoàn bóng đá International, tổ chức World Cup và quản lý bóng đá toàn cầu.', "International football federation, organizing the World Cup and governing global football."),
    @('Website tuyển dụng trực tuyến lớn nhất Vietnam, 5M+ registered users.', "Vietnam's largest online recruitment website, 5M+ registered users."),
    @('Nền tảng tuyển dụng và tạo CV hàng đầu Vietnam, AI matching ứng viên.', "Vietnam's leading recruitment and CV platform, AI candidate matching."),
    @('Mạng xã hội nghề nghiệp lớn nhất thế giới thuộc Microsoft, 1B+ members.', "World's largest professional social network owned by Microsoft, 1B+ members."),
    @('Startup MarTech Vietnam, nền tảng Customer Data Platform (CDP) hàng đầu SEA.', "Vietnamese MarTech startup, leading Customer Data Platform (CDP) in SEA."),
    @('Agency digital marketing lớn nhất Vietnam, Google Premier Partner, Meta Partner.', "Vietnam's largest digital marketing agency, Google Premier Partner, Meta Partner."),
    @('Nền tảng CRM, Marketing, Sales all-in-one hàng đầu thế giới cho SMB.', "World's leading all-in-one CRM, Marketing, and Sales platform for SMBs."),
    @('Công ty năng lượng mặt trời và công nghệ xanh hàng đầu Vietnam.', "Vietnam's leading solar energy and green technology company."),
    @('Startup xe điện và xe tải điện hàng đầu nước Mỹ, đối thủ Tesla phân khúc adventure.', "America's leading electric vehicle and truck startup, Tesla competitor in adventure segment."),
    @('Tập đoàn công nghệ số mẹ của VNPay, hệ sinh thái thanh toán số lớn nhất VN.', "Parent digital technology group of VNPay, Vietnam's largest digital payment ecosystem."),
    @('Công ty công nghệ giải trí Vietnam, chuyên game publishing, ads, digital content.', "Vietnamese entertainment technology company, specializing in game publishing, ads, digital content."),
    @('Công ty mẹ của sàn TMĐT Tiki, đang chuyển đổi mạnh sang TikiNGON và logistics.', "Parent company of Tiki e-commerce platform, transitioning to TikiNGON and logistics."),
    @('Quỹ đầu tư tài chính lớn nhất Vietnam, quản lý hơn $4B AUM.', "Vietnam's largest financial investment fund, managing over $4B AUM."),
    @('Công ty chứng khoán lớn nhất Vietnam theo thị phần môi giới.', "Vietnam's largest securities company by brokerage market share."),
    @('Ngân hàng TMCP Xuất nhập khẩu Vietnam, chuyên trade finance và FX.', "Vietnam Joint Stock Commercial Bank for Import and Export, specializing in trade finance and FX."),
    @('Công ty tích hợp hệ thống IT lớn nhất VN, chuyên eGovernment, Banking IT, ERP.', "Vietnam's largest IT system integration company, specializing in eGovernment, Banking IT, ERP."),
    @('Công ty giải pháp số thuộc Viettel, chuyên Smart City, eGovernment, Digital Platform.', "Viettel's digital solutions company, specializing in Smart City, eGovernment, Digital Platforms."),
    @('Trung tâm an ninh mạng thuộc Viettel, bảo vệ hạ tầng quốc gia.', "Viettel's cybersecurity center, protecting national infrastructure."),
    @('Super app thanh toán điện tử, đầu tư, Insurance - fintech unicorn Vietnam.', "Electronic payment, investment, and insurance super app - Vietnam's fintech unicorn."),
    @('Sàn TMĐT lớn nhất SEA thuộc Alibaba, hoạt động tại 6 quốc gia.', "SEA's largest e-commerce platform owned by Alibaba, operating in 6 countries."),
    @('Mạng lưới thanh toán lớn nhất thế giới, xử lý hàng billion giao dịch mỗi năm.', "World's largest payment network, processing billions of transactions annually."),
    @('Mạng lưới thanh toán toàn cầu, đối thủ lớn nhất của Visa.', "Global payment network, Visa's largest competitor."),
    @('Nền tảng thanh toán trực tuyến lớn nhất thế giới, sở hữu Venmo.', "World's largest online payment platform, owning Venmo."),
    @('Ngân hàng lớn nhất nước Mỹ và thế giới theo tổng tài sản.', "America's and world's largest bank by total assets."),
    @('Ngân hàng đầu tư hàng đầu thế giới, \"The Firm\" phố Wall.', "World's leading investment bank, ""The Firm"" of Wall Street."),
    @('Công ty Big Data analytics hàng đầu, chuyên phân tích dữ liệu cho Government và quân đội.', "Leading Big Data analytics company, specializing in data analysis for government and military."),
    @('Nền tảng ride-sharing và food delivery lớn nhất thế giới.', "World's largest ride-sharing and food delivery platform."),
    @('Nền tảng HCM và Finance cloud hàng đầu cho Large enterprises.', "Leading HCM and Finance cloud platform for large enterprises."),
    @('Công ty tạo ra Elasticsearch, leader search và observability cho enterprises.', "Company behind Elasticsearch, leader in search and observability for enterprises."),
    @('Nền tảng monitoring và observability hàng đầu cho cloud infrastructure.', "Leading monitoring and observability platform for cloud infrastructure."),
    @('Công ty infrastructure automation, tạo ra Terraform, Vault, Consul - DevOps essentials.', "Infrastructure automation company, creator of Terraform, Vault, Consul - DevOps essentials."),
    @('Công ty đứng sau Apache Kafka, leader data streaming cho enterprises.', "Company behind Apache Kafka, leader in data streaming for enterprises."),
    @('Dịch vụ mobile money phổ biến nhất châu Phi, cách mạng tài chính di động.', "Africa's most popular mobile money service, revolutionizing mobile finance."),
    @('Tập đoàn hàng tiêu dùng lớn nhất thế giới, sở hữu Tide, Gillette, Pampers.', "World's largest consumer goods corporation, owning Tide, Gillette, Pampers."),
    @('Tập đoàn hàng tiêu dùng châu Âu, sở hữu Dove, Lipton, OMO, Rexona.', "European consumer goods conglomerate, owning Dove, Lipton, OMO, Rexona."),
    @('Nhà sản xuất điện tử gia dụng Nhật Bản, 3 nhà máy lớn tại Vietnam.', "Japanese home electronics manufacturer, 3 large factories in Vietnam."),
    @('Nhà sản xuất máy in, camera của Nhật, 4 nhà máy lớn tại Vietnam.', "Japanese printer and camera manufacturer, 4 large factories in Vietnam."),
    @('Nhà sản xuất thiết bị điện tử contract lớn nhất thế giới, lắp ráp cho Apple tại VN.', "World's largest contract electronics manufacturer, assembling for Apple in Vietnam."),
    @('Chuỗi stores tiện lợi Hàn Quốc tại VN, đối thủ Circle K và FamilyMart.', "Korean convenience store chain in Vietnam, competing with Circle K and FamilyMart."),
    @('Chuỗi stores tiện lợi hàng đầu Vietnam, 400+ stores.', "Vietnam's leading convenience store chain, 400+ stores."),
    @('Công ty dinh dưỡng và MLM toàn cầu, hoạt động lớn tại VN.', "Global nutrition and MLM company, with major operations in Vietnam.")
)

foreach ($pair in $translations) {
    $content = $content.Replace($pair[0], $pair[1])
}

$changed = ($content -ne $original)
if ($changed) {
    [System.IO.File]::WriteAllText('D:\vico---vietnam-copilot\data\companies.ts', $content, (New-Object System.Text.UTF8Encoding $true))
    "Done - translated intros"
} else {
    "No changes detected"
}
