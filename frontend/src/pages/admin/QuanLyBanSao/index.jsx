import QuanLyBanSao from './QuanLyBanSao';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';

export default function QuanLyBanSaoPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full">
      <QuanLyBanSao />
      <Section2 />
      <Section3 />
      <Section4 />
    </div></main>
  );
}
