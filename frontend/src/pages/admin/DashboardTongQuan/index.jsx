import BangDieuKhienThu from './BangDieuKhienThu';
import Section2 from './Section2';
import XuHuongMuonTra from './XuHuongMuonTra';
import GiaoDichLuuThong from './GiaoDichLuuThong';
import Section5 from './Section5';

export default function DashboardTongQuanPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="w-full max-w-[1600px] mx-auto p-space-lg"><div className="flex flex-col w-full gap-space-lg">
      <BangDieuKhienThu />
      <Section2 />
      <XuHuongMuonTra />
      <GiaoDichLuuThong />
      <Section5 />
    </div></div></main>
  );
}
