import Section2 from "./Section2_2";
import QuanLyDocGia from "./QuanLyDocGia";
import Section4 from "./Section4";

export default function QuanLyDocGiaPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-[1600px] mx-auto px-margin md:px-margin-desktop py-space-lg space-y-space-lg">
          {/* Thẻ thống kê tổng quan độc giả */}
          <Section2 />

          {/* Bảng quản lý độc giả chính kết nối API backend /patrons/admin-list */}
          <QuanLyDocGia />

          {/* Tiện ích phần cứng RFID, thông báo và đồng bộ */}
          <Section4 />
        </div>
      </div>
    </main>
  );
}
