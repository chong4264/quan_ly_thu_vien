import HoSoDocGia from './HoSoDocGia';
import Section2 from './Section2';

export default function HoSoCaNhanPage() {
  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="flex flex-col w-full">
      <HoSoDocGia />
      <Section2 />
    </div></main>
  );
}
