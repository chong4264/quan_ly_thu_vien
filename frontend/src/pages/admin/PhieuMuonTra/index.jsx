import QuanLyPhieuMuon from './QuanLyPhieuMuon';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';
import Section5 from './Section5';
import QuyCheMuonSach from './QuyCheMuonSach';

export default function PhieuMuonTraPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full">
      <QuanLyPhieuMuon />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <QuyCheMuonSach />
    </div></main>
  );
}
