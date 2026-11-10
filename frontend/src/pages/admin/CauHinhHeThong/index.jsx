import CauHinhThamSo from './CauHinhThamSo';
import Section2 from './Section2';
import S1DinhMucMuon from './S1DinhMucMuon';
import Section4 from './Section4';

export default function CauHinhHeThongPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full"><div className="w-full max-w-[1520px] mx-auto px-space-md lg:px-space-xl py-space-lg space-y-space-lg">
      <CauHinhThamSo />
      <Section2 />
      <S1DinhMucMuon />
      <Section4 />
    </div></div></main>
  );
}
