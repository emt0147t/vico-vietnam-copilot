
export interface NewsItem {
  title: string;
  link: string;
  content: string;
}

export const RAW_NEWS: NewsItem[] = [
  {
    title: "Xe mới của VinFast sẽ trông thế nào qua mắt AI?",
    link: "https://znews.vn/xe-moi-cua-vinfast-se-trong-the-nao-qua-mat-ai-post1608102.html",
    content: "Hình ảnh mô phỏng 2 mẫu xe mới từ VinFast thông qua AI được cộng đồng mạng tích cực chia sẻ chỉ trong vài giờ từ khi thông tin bản thiết kế xuất hiện. Các bức ảnh được dựng lại từ thiết kế đăng tải ở Công báo, kết hợp công cụ thông minh AI."
  },
  {
    title: "Giảm phụ thuộc Xanh SM, VinFast đang lên kế hoạch gì tiếp theo?",
    link: "https://nguoiquansat.vn/giam-phu-thuoc-xanh-sm-vinfast-dang-len-ke-hoach-gi-tiep-theo-258589.html",
    content: "Doanh số bán xe VinFast cho Xanh SM đã giảm đáng kể từ 72% năm 2023 xuống còn 23% chỉ trong 9 tháng đầu năm 2025. Xu hướng này cho thấy VinFast ngày càng giảm sự phụ thuộc vào Xanh SM, trong khi thị trường tiêu dùng cá nhân đón nhận xe điện mạnh mẽ."
  },
  {
    title: "VinFast cân nhắc sử dụng động cơ xăng để kéo dài quãng đường xe điện",
    link: "https://znews.vn/vinfast-can-nhac-su-dung-dong-co-xang-de-keo-dai-quang-duong-xe-dien-post1607857.html",
    content: "Hãng xe điện VinFast đang xem xét trang bị cho một số mẫu xe loại động cơ đốt trong cỡ nhỏ (ICE) để sạc lại pin và tăng phạm vi di chuyển (REEV). Nếu được triển khai, VF9 phiên bản mới sẽ vẫn vận hành bằng động cơ điện nhưng có thêm sự hỗ trợ của động cơ xăng."
  },
  {
    title: "Mẫu MPV 7 chỗ của Toyota khách Việt sẽ thích, giá hơn 300 triệu",
    link: "https://nguoiquansat.vn/mau-mpv-7-cho-cua-toyota-khach-viet-se-thich-gia-hon-300-trieu-6-tui-khi-hang-ghe-2-va-3-thuc-dung-thich-hop-chay-dich-vu-va-phuc-vu-gia-dinh-259408.html",
    content: "Toyota Rumion, mẫu MPV 7 chỗ dùng chung nền tảng với Suzuki Ertiga nhưng được tinh chỉnh để mang dấu ấn Toyota, đang gây chú ý với mức giá hấp dẫn khoảng 300 triệu đồng tại Ấn Độ. Xe trang bị động cơ 1.5L mild-hybrid tiết kiệm nhiên liệu."
  },
  {
    title: "Sedan siêu sang của Toyota được nâng cấp",
    link: "https://autobikes.vn/sedan-sieu-sang-cua-toyota-duoc-nang-cap-22151.html",
    content: "Thương hiệu Century tái định vị như dòng xe siêu sang độc lập. Mẫu sedan Century 2026 nhận được loạt nâng cấp về công nghệ an toàn Toyota Safety Sense mới nhất, dù thiết kế ngoại thất gần như giữ nguyên nét cổ điển danh tiếng."
  },
  {
    title: "‘Vua xe tải’ tại Việt Nam vừa trình làng mẫu sedan giá hơn 500 triệu",
    link: "https://nguoiquansat.vn/vua-xe-tai-tai-viet-nam-vua-trinh-lang-mau-sedan-gia-hon-500-trieu-dep-ngang-toyota-camry-pin-chay-rat-ben-vot-tu-0-100km-h-chi-trong-3-giay-259270.html",
    content: "Dongfeng giới thiệu mẫu sedan điện eπ 007+ với giá khởi điểm khoảng 534 triệu đồng. Xe trang bị hệ thống LiDAR tiêu chuẩn, chip Snapdragon 8295P, cạnh tranh trực tiếp trong phân khúc sedan cỡ trung."
  },
  {
    title: "Cuối năm chốt xe Toyota với ưu đãi lãi suất khủng: Từ 1,49%/năm",
    link: "https://ofnews.vn/cuoi-nam-chot-xe-toyota-voi-uu-dai-lai-suat-khung-tu-149nam-31584.html",
    content: "TFSVN tung gói lãi suất đặc quyền chỉ từ 1,49%/năm cho các dòng xe Toyota Hybrid và 1,99%/năm cho xe xăng chủ lực như Vios, Veloz Cross. Đây là đòn bẩy tài chính quan trọng giúp khách hàng sở hữu xe dịp cuối năm."
  },
  {
    title: "Toyota Việt Nam mở rộng hệ thống đại lý, ra mắt Toyota Ngọc Anh Lâm Đồng",
    link: "https://autobikes.vn/toyota-viet-nam-mo-rong-he-thong-dai-ly-ra-mat-toyota-ngoc-anh-lam-dong-22155.html",
    content: "Toyota Việt Nam nâng tổng số đại lý lên 86 với việc khai trương Toyota Ngọc Anh Lâm Đồng tại Đà Lạt. Đại lý mới được đầu tư theo tiêu chuẩn toàn cầu, quy mô hơn 3.000 m2."
  },
  {
    title: "Dự án THACO Chu Lai và khả năng tăng trưởng vượt bậc của Đà Nẵng",
    link: "https://diendandoanhnghiep.vn/du-an-thaco-chu-lai-va-kha-nang-tang-truong-vuot-bac-cua-da-nang-10160816.html",
    content: "Lãnh đạo TP Đà Nẵng làm việc với THACO về việc đẩy nhanh tiến độ giải phóng mặt bằng cho dự án mở rộng tổ hợp Cơ khí ô tô và KCN chuyên nông lâm nghiệp. THACO đang đầu tư khoảng 103.000 tỷ đồng để hình thành hệ sinh thái công nghệ đa ngành."
  },
  {
    title: "Lợi nhuận của THACO tăng trở lại, quy mô tài sản vượt 195.000 tỷ đồng",
    link: "https://thitruongtaichinhtiente.vn/loi-nhuan-cua-thaco-tang-tro-lai-quy-mo-tai-san-vuot-195-000-ty-dong-70494.html",
    content: "Năm 2024, THACO báo lãi sau thuế hơn 3.025 tỷ đồng, tăng 13,9%. Tổng tài sản đạt gần 195.600 tỷ đồng, khẳng định vị thế là một trong những tập đoàn tư nhân lớn nhất Việt Nam."
  },
  {
    title: "Tổng giám đốc Thaco từ chức",
    link: "https://vnexpress.net/tong-giam-doc-thaco-tu-chuc-4928284.html",
    content: "Ông Phạm Văn Tài tự nguyện xin nghỉ sau 7 năm giữ chức Tổng giám đốc THACO. Chủ tịch HĐQT Trần Bá Dương sẽ kiêm nhiệm vị trí này trong bối cảnh tập đoàn đang tái cấu trúc và chuyển đổi số mạnh mẽ."
  },
  {
    title: "Đây là 'vua doanh số' của Hyundai tại Việt Nam trong tháng 10",
    link: "https://nguoiquansat.vn/day-la-vua-doanh-so-cua-hyundai-tai-viet-nam-trong-thang-10-con-cung-cua-nguoi-dung-pho-thong-chi-phi-van-hanh-re-nhu-cho-255784.html",
    content: "Hyundai Creta vượt qua các mẫu xe khác để trở thành xe bán chạy nhất của Hyundai trong tháng 10 với 1.022 xe. Sự phục hồi doanh số của Hyundai được thúc đẩy bởi các chính sách ưu đãi."
  },
  {
    title: "Giảm giá kéo dài, khách Việt tiếp tục tăng mua ô tô Hyundai",
    link: "https://congluan.vn/giam-gia-keo-dai-khach-viet-tiep-tuc-tang-mua-o-to-hyundai-10317863.html",
    content: "Doanh số Hyundai tăng trưởng tháng thứ 3 liên tiếp nhờ các chương trình giảm giá mạnh tay. Santa Fe và Palisade được ưu đãi lên tới 200 triệu đồng."
  },
  {
    title: "Creta là mẫu xe bán tốt nhất tháng 10 của Hyundai",
    link: "https://khoahocphothong.vn/creta-la-mau-xe-ban-tot-nhat-thang-10-cua-hyundai-262046.html",
    content: "Tập đoàn Thành Công (TC GROUP) thông báo kết quả bán hàng tháng 10/2025 với tổng doanh số đạt 5.260 xe Hyundai, tăng trưởng 22,4%. Hyundai Creta dẫn đầu với 1.022 xe."
  },
  {
    title: "Ford Việt Nam ưu đãi dịp cuối năm lên đến 100% lệ phí trước bạ",
    link: "https://laodongthudo.vn/ford-viet-nam-uu-dai-dip-cuoi-nam-len-den-100-le-phi-truoc-ba-202594.html",
    content: "Ford triển khai chương trình ưu đãi lớn tháng 12, hỗ trợ 100% lệ phí trước bạ cho nhiều dòng xe như Ranger, Transit. Khách hàng mua xe còn có cơ hội trúng chuyến du lịch Bắc Âu."
  },
  {
    title: "Ford gọi sửa chữa Mustang Mach-E tại Việt Nam",
    link: "https://hanoionline.vn/ford-goi-sua-chua-mustang-mache-tai-viet-nam-374333.htm",
    content: "Ford Việt Nam triệu hồi 18 chiếc Mustang Mach-E để cập nhật phần mềm và kiểm tra mô-đun điều khiển. Đây là các xe đang lưu kho và chưa bán ra thị trường."
  },
  {
    title: "Bảng giá xe Ford cập nhật mới nhất tháng 12/2025",
    link: "https://congluan.vn/bang-gia-xe-ford-cap-nhat-moi-nhat-thang-12-2025-10321463.html",
    content: "Ford Việt Nam tiếp tục giảm giá loạt mẫu xe như Ranger, Everest, Transit và Mustang Mach-E. Đặc biệt Ranger Raptor được giảm giá tương đương 100% mức thu lệ phí trước bạ."
  },
  {
    title: "FPT.AI thắng giải nhà cung cấp dịch vụ AI tại ASOCIO Award 2025",
    link: "https://vnexpress.net/fpt-ai-thang-giai-nha-cung-cap-dich-vu-ai-tai-asocio-award-2025-4963314.html",
    content: "Nền tảng FPT.AI được ASOCIO vinh danh là Nhà cung cấp dịch vụ AI xuất sắc nhất. FPT.AI hiện phục vụ hàng nghìn doanh nghiệp với hơn 200 triệu tương tác mỗi tháng."
  },
  {
    title: "FPT trình diễn sức mạnh AI và hạ tầng vượt trội tại VIDW 2025",
    link: "https://vjst.vn/fpt-trinh-dien-suc-manh-ai-va-ha-tang-vuot-troi-tai-vidw-2025-76554.html",
    content: "Tại Tuần lễ Số quốc tế, FPT giới thiệu FPT AI Factory và FPT AI Agents. Với hạ tầng GPU H100 hợp tác cùng NVIDIA, FPT đang xây dựng nền tảng tính toán hiệu năng cao."
  },
  {
    title: "Vingroup sáp nhập VinBigData vào VinIT",
    link: "https://doanhnhansaigon.vn/vingroup-sap-nhap-vinbigdata-vao-vinit-321999.html",
    content: "Vingroup sáp nhập VinBigData vào VinIT để tối ưu hóa hoạt động nghiên cứu và ứng dụng AI. Động thái này nằm trong chiến lược tái cơ cấu mảng công nghệ của tập đoàn."
  },
  {
    title: "Viper trở thành quán quân Viettel AI Race 2025",
    link: "https://vnexpress.net/viper-tro-thanh-quan-quan-viettel-ai-race-2025-4989577.html",
    content: "Đội thi Viper đã xuất sắc giành giải nhất cuộc thi Viettel AI Race 2025 nhờ giải pháp tối ưu năng lượng mạng 5G. Cuộc thi là sân chơi công nghệ uy tín nhằm tìm kiếm các tài năng AI trẻ."
  },
  {
    title: "Sáu đội vào chung kết Viettel AI Race 2025",
    link: "https://vnexpress.net/sau-doi-vao-chung-ket-viettel-ai-race-2025-4971532.html",
    content: "Sau hơn một tháng tranh tài với 666 đội, Viettel AI Race 2025 tìm ra 6 đội cao điểm nhất vào chung kết. Các đội phải giải quyết các bài toán về tối ưu năng lượng, xử lý văn bản và thị giác máy tính."
  },
  {
    title: "LG sắp khai trương Trung tâm R&D thứ 3 tại Việt Nam",
    link: "https://nguoiquansat.vn/lg-sap-khai-truong-trung-tam-r-d-thu-3-tai-viet-nam-186827.html",
    content: "LG Electronics tiếp tục mở rộng đầu tư tại Việt Nam với kế hoạch khai trương trung tâm R&D thứ ba. Trung tâm mới sẽ tập trung vào các giải pháp thông tin giải trí trên xe (IVI) và nền tảng webOS."
  },
  {
    title: "Tung 7 game mới trong một quý, VNG \"bỏ túi\" hơn 1.900 tỷ đồng",
    link: "https://www.24h.com.vn/cong-nghe-thong-tin/tung-7-game-moi-trong-mot-quy-vng-bo-tui-hon-1900-ty-dong-c55a1685719.html",
    content: "Mảng Game của VNG ghi nhận doanh thu ấn tượng trong Quý 2/2025 với việc ra mắt 7 tựa game mới. Chiến lược 'Go Global' đang phát huy hiệu quả khi thị trường quốc tế đóng góp 17% vào tổng doanh thu."
  },
  {
    title: "Quý 2.2025, VNG duy trì đà tăng trưởng với doanh thu 2.571 tỷ đồng, có lãi trở lại",
    link: "https://markettimes.vn/quy-2-2025-vng-duy-tri-da-tang-truong-voi-doanh-thu-2-571-ty-dong-co-lai-tro-lai-87616.html",
    content: "Kết quả tích cực nhờ VNG kiểm soát chi phí vận hành và tăng trưởng từ các sản phẩm cốt lõi. VNGGames và Zalopay đều có những bước tiến quan trọng trong việc mở rộng thị trường."
  },
  {
    title: "Chủ tịch VNG Lê Hồng Minh nói về việc thu phí của Zalo",
    link: "https://www.24h.com.vn/cong-nghe-thong-tin/chu-tich-vng-le-hong-minh-noi-ve-viec-thu-phi-cua-zalo-c55a1676398.html",
    content: "Ông Lê Hồng Minh khẳng định Zalo hạn chế quảng cáo để bảo vệ trải nghiệm người dùng. Việc thu phí sẽ chỉ áp dụng cho các dịch vụ giá trị gia tăng, trong khi các tính năng cơ bản vẫn miễn phí."
  },
  {
    title: "Doanh số Tesla tại châu Âu tiếp tục lao dốc trong tháng 11",
    link: "https://znews.vn/doanh-so-tesla-tai-chau-au-tiep-tuc-lao-doc-trong-thang-11-post1607866.html",
    content: "Tesla đang gặp khó khăn tại châu Âu khi doanh số giảm mạnh tại các thị trường lớn như Pháp, Đức. Sự cạnh tranh gay gắt từ các hãng xe điện Trung Quốc là thách thức lớn."
  },
  {
    title: "Mức giá quá cao tại Ấn Độ, liệu Tesla Model Y đã đủ sức thuyết phục?",
    link: "https://znews.vn/muc-gia-qua-cao-tai-an-do-lieu-tesla-model-y-da-du-suc-thuyet-phuc-post1606616.html",
    content: "Tesla khẳng định chi phí vận hành rẻ có thể giúp khách hàng Ấn Độ tiết kiệm, tuy nhiên mức giá Model Y vẫn cao gấp đôi so với các thị trường khác do thuế nhập khẩu 100%."
  },
  {
    title: "Doanh số BYD tại châu Âu gấp 2,5 lần Tesla trong tháng 10",
    link: "https://znews.vn/doanh-so-byd-tai-chau-au-gap-2-5-lan-tesla-trong-thang-10-post1606219.html",
    content: "BYD đang bứt phá ngoạn mục tại châu Âu, bán gấp 2,5 lần Tesla trong tháng 10. Các hãng xe Trung Quốc đang dần chiếm lĩnh thị phần nhờ giá cạnh tranh."
  },
  {
    title: "Thay đổi ít người nhận ra trên Tesla Model X",
    link: "https://znews.vn/thay-doi-it-nguoi-nhan-ra-tren-tesla-model-x-post1604331.html",
    content: "Tesla Model X 2026 nhẹ hơn đáng kể so với bản ra mắt 2015 nhờ cải tiến động cơ và vật liệu, đi ngược lại xu hướng 'tăng cân' của xe điện hiện đại."
  },
  {
    title: "Tesla bổ sung tính năng mà Elon Musk 'ghét cay ghét đắng'",
    link: "https://znews.vn/tesla-bo-sung-tinh-nang-ma-elon-musk-ghet-cay-ghet-dang-post1603756.html",
    content: "Tesla đang thử nghiệm nội bộ việc tích hợp Apple CarPlay, đánh dấu sự thay đổi lập trường của Elon Musk nhằm thu hút thêm khách hàng trong bối cảnh doanh số chững lại."
  },
  {
    title: "ELSA hợp tác iSmart Education nâng cấp chương trình dạy tiếng Anh",
    link: "https://vnexpress.net/elsa-hop-tac-ismart-education-nang-cap-chuong-trinh-day-tieng-anh-4921310.html",
    content: "ELSA Corp tích hợp công nghệ AI nhận diện giọng nói vào hệ thống bài giảng số của iSmart Education, giúp học sinh Việt Nam được chấm điểm phát âm chuẩn xác."
  },
  {
    title: "Elsa Business hỗ trợ doanh nghiệp khắc phục rào cản tiếng Anh",
    link: "https://vnexpress.net/elsa-business-ho-tro-doanh-nghiep-khac-phuc-rao-can-tieng-anh-4869498.html",
    content: "ELSA ra mắt giải pháp ELSA Business giúp doanh nghiệp đào tạo tiếng Anh cho nhân viên theo chuyên ngành cụ thể, giúp nhân sự tự tin giao tiếp quốc tế."
  },
  {
    title: "TOP 10 app học tiếng Anh hiệu quả rất đáng để thử nếu muốn lên trình",
    link: "https://vieclam24h.vn/nghe-nghiep/ki-ot-vui-ve/10-app-hoc-tieng-anh-rat-dang-de-thu",
    content: "Bài viết tổng hợp các ứng dụng học tiếng Anh hàng đầu, trong đó ELSA Speak được đánh giá cao nhờ công nghệ AI nhận diện giọng nói tiên tiến."
  },
  {
    title: "Cô gái Việt dùng AI dạy tiếng Anh cho hàng triệu người",
    link: "https://vnexpress.net/co-gai-viet-dung-ai-day-tieng-anh-cho-hang-trieu-nguoi-4843380.html",
    content: "Văn Đinh Hồng Vũ, nhà sáng lập ELSA Speak, được vinh danh là người tiên phong trong công nghệ tại WEF. Ứng dụng hiện có hơn 50 triệu người dùng toàn cầu."
  }
];
