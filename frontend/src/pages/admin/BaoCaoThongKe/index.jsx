import Section1 from './Section1';
import Section2 from './Section2';
import XuHuongMuonTra from './XuHuongMuonTra';
import TyLeKhaiThac from './TyLeKhaiThac';
import DanhSachBanDoc from './DanhSachBanDoc';

export default function BaoCaoThongKePage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full"><div className="p-space-lg max-w-[1600px] w-full mx-auto space-y-space-lg">
      <Section1 />
      <Section2 />
      <XuHuongMuonTra />
      <TyLeKhaiThac />
      <DanhSachBanDoc />
    </div></div></main>
  );
}
