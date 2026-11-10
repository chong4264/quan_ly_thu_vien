import QuanLyDanhMuc from './QuanLyDanhMuc';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';
import Section5 from './Section5';

export default function QuanLyDauSachPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="w-full max-w-[1600px] mx-auto p-space-lg"><div className="flex flex-col w-full gap-space-lg">
      <QuanLyDanhMuc />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
    </div></div></main>
  );
}
