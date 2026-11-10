import TuSachDangMuon from './TuSachDangMuon';
import Section2 from './Section2';
import DanhMucAnPham from './DanhMucAnPham';

export default function SachDangMuonPage() {
  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="flex flex-col w-full"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-xl flex flex-col gap-space-xl">
      <TuSachDangMuon />
      <Section2 />
      <DanhMucAnPham />
    </div></div></main>
  );
}
