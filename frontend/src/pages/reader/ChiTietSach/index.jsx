import Section1 from './Section1';
import DaiSoTuyenTinh from './DaiSoTuyenTinh';
import TaiLieuCungChuyen from './TaiLieuCungChuyen';
import ThanhCong from './ThanhCong';

export default function ChiTietSachPage() {
  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="flex flex-col w-full"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      <Section1 />
      <DaiSoTuyenTinh />
      <TaiLieuCungChuyen />
      <ThanhCong />
    </div></div></main>
  );
}
