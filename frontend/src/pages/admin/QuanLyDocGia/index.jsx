import QuanLyDocGia from './QuanLyDocGia';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';

export default function QuanLyDocGiaPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full"><div className="w-full max-w-[1600px] mx-auto px-margin md:px-margin-desktop py-space-lg space-y-space-lg">
      <QuanLyDocGia />
      <Section2 />
      <Section3 />
      <Section4 />
    </div></div></main>
  );
}
