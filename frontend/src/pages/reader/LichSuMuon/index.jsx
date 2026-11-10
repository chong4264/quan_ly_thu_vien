import NhatKyMuonTra from './NhatKyMuonTra';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';
import Section5 from './Section5';

export default function LichSuMuonPage() {
  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="flex flex-col w-full"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      <NhatKyMuonTra />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
    </div></div></main>
  );
}
