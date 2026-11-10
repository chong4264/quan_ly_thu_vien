import { useToast } from '../../../context/ToastContext';

export default function TaiLieuCungChuyen() {
  const toast=useToast();
  return (
    <>
<div className="mt-space-lg flex flex-col gap-space-md"> <div className="flex items-center justify-between"> <div> <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Tài liệu cùng chuyên đề & Khuyến nghị đọc thêm
          </h2> <p className="font-body-sm text-body-sm text-on-surface-variant">
            Được giáo viên bộ môn Toán & Tin học THPT Chuyên Chu Văn An đề xuất
          </p> </div> <a href="#" onClick={(e)=>e.preventDefault()} className="font-label-md text-label-md text-primary font-semibold hover:underline flex items-center gap-1">
          Xem toàn bộ danh mục Toán học
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span> </a> </div>  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">  <div className="bg-surface-container-lowest p-space-md rounded-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"> <div> <div className="relative aspect-[1/1.35] w-full rounded-sm overflow-hidden bg-surface-container-high mb-space-sm"> <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Modern textbook cover for Mathematical Analysis for Gifted High School Students, minimalist clean layout, vibrant indigo and emerald accents with differential calculus symbols on clean white canvas" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDaHliOI0pdCeZZdf6sh1J8FwfiYy34s1X-N1fY6dmJeYM0KYTs04q7o06tkwk9j3WAwv02TzRHJorZOSsPuIZiOSLtUY0D63Y-DnNYiZvL5QDDo8CDNPPTyJ8GAQwP1fDAPEMjCvi36kxDHZa9oebJ7H7Gl1obeYZzKJxGf8sY7NCXhTQNC9kbEkPTMm6jLB8XuHT3EwQIQR7KQuzJB35Alvq2BBtfhfthKDsnuQ" /> <span className="absolute top-2 right-2 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-1.5 py-0.5 rounded-sm font-bold">
                Còn 4 bản
              </span> </div> <span className="font-code-md text-label-sm text-primary font-bold">DDC 515.1</span> <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-1">
              Giải Tích Toán Học Chuyên Sâu (Tập 1: Đạo Hàm & Vi Phân)
            </h3> <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              GS. Đoàn Quỳnh, TS. Nguyễn Huy Đoan
            </p> </div> <div className="mt-space-md pt-space-xs flex items-center justify-between"> <span className="font-label-sm text-label-sm text-outline">Kệ K03-T2-01</span> <button className="h-8 px-space-sm bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface rounded-sm font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1" onClick={()=>toast("Xem chi tiết")}> <span className="material-symbols-outlined text-[16px]">visibility</span>
              Xem chi tiết
            </button> </div> </div>  <div className="bg-surface-container-lowest p-space-md rounded-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"> <div> <div className="relative aspect-[1/1.35] w-full rounded-sm overflow-hidden bg-surface-container-high mb-space-sm"> <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Book cover for Linear Algebra Done Right Vietnamese edition, abstract geometric vectors, matrix patterns in monochrome blue and metallic copper, sleek scientific aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqpYksYehpg8D71qZq7nqsOuV6CVtl91V_g90_v_I3M6sbgBetDM8fCzymWuVUmaeFS1Dguo0nd4tKnFSVhsvipjCc0ot47DhOB7OGV5ybfqN5zyktaw6ksVa5XLHLBmzXCWSdod_36Znpsw1NgsRu9hjuuabOvIg6xE4GPL8DzAAP9w_-R2aARkp9J_sGoJh_NgfQWpNKfcGqetiI-Mjc7ynocnpSgyI2X8DVmQ" /> <span className="absolute top-2 right-2 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-1.5 py-0.5 rounded-sm font-bold">
                Còn 2 bản
              </span> </div> <span className="font-code-md text-label-sm text-primary font-bold">DDC 512.55</span> <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-1">
              Đại Số Tuyến Tính Nâng Cao & Không Gian Vector
            </h3> <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Sheldon Axler (Bản dịch ĐH Sư Phạm)
            </p> </div> <div className="mt-space-md pt-space-xs flex items-center justify-between"> <span className="font-label-sm text-label-sm text-outline">Kệ K03-T2-05</span> <button className="h-8 px-space-sm bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface rounded-sm font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1" onClick={()=>toast("Xem chi tiết")}> <span className="material-symbols-outlined text-[16px]">visibility</span>
              Xem chi tiết
            </button> </div> </div>  <div className="bg-surface-container-lowest p-space-md rounded-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"> <div> <div className="relative aspect-[1/1.35] w-full rounded-sm overflow-hidden bg-surface-container-high mb-space-sm"> <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Academic computer science textbook cover on Mathematical Foundations of Machine Learning and Data Algorithms with technical grid lines, neural nodes and crisp typography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8EMyoj2tUCdEk8E25MZkwCXevnpA_0pjRLbPhgW4a8zoXVzzila8MQMwJkbsefGdeRJt3iY484d0-OdugqM1A1q0rJoeAcBaaa51JqPr_bpo5HMKYwZMJlJCRZxeFeEf0GRq0lU7nZi_4NRS33fou46p8_61oXBf12693zbCuGcUMWcU7oM2fw3Fmi10L9CyEJFC0ZdDoscXg2DaAy24fxcxKHhfUV2q2GZo40w" /> <span className="absolute top-2 right-2 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-1.5 py-0.5 rounded-sm font-bold">
                Đang mượn hết
              </span> </div> <span className="font-code-md text-label-sm text-primary font-bold">DDC 006.31</span> <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-1">
              Cơ Sở Toán Học Cho Học Máy & Trí Tuệ Nhân Tạo
            </h3> <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Marc Peter Deisenroth, A. Aldo Faisal
            </p> </div> <div className="mt-space-md pt-space-xs flex items-center justify-between"> <span className="font-label-sm text-label-sm text-outline">Kệ T01-T2-02</span> <button className="h-8 px-space-sm bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface rounded-sm font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1" onClick={()=>toast("Xem chi tiết")}> <span className="material-symbols-outlined text-[16px]">visibility</span>
              Xem chi tiết
            </button> </div> </div>  <div className="bg-surface-container-lowest p-space-md rounded-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"> <div> <div className="relative aspect-[1/1.35] w-full rounded-sm overflow-hidden bg-surface-container-high mb-space-sm"> <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Textbook cover for Olympiad Geometry and Vector Geometry in Vietnamese, clean geometric diagrams of circles, lines and triangles, dark blue and gold embossed title" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBc3_HCtyyIT-TJft3-w2umgVRtaqiPct8-JGK3GJAstCysM_b3Gb1Ku5ZDIcag_4A2d7-eNgIrHI1VPGTuWWGlgRpI1C6Zr3CeMcS3pd0A8dFpjyWk9Fb8fsw1VB9cWaTRw_OXybV3U5YKaxszAYCBqGaJKZrvQDOc8aNJi5orenmYU_JfJbNVyhu30P5TFO3rViPR54NI1UtABKa3mW6MHOibwWXfBGWBjFLoZQ" /> <span className="absolute top-2 right-2 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-1.5 py-0.5 rounded-sm font-bold">
                Còn 7 bản
              </span> </div> <span className="font-code-md text-label-sm text-primary font-bold">DDC 516.2</span> <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mt-1">
              Hình Học Vector & Tọa Độ Trong Bồi Dưỡng Học Sinh Giỏi
            </h3> <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              TS. Nguyễn Minh Hà, Đỗ Bá Chủ
            </p> </div> <div className="mt-space-md pt-space-xs flex items-center justify-between"> <span className="font-label-sm text-label-sm text-outline">Kệ K03-T2-06</span> <button className="h-8 px-space-sm bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface rounded-sm font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1" onClick={()=>toast("Xem chi tiết")}> <span className="material-symbols-outlined text-[16px]">visibility</span>
              Xem chi tiết
            </button> </div> </div> </div> </div>
    </>
  );
}
