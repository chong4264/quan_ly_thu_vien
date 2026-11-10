import ThemMoiDauSach from './ThemMoiDauSach';
import S1ThongTinCo from './S1ThongTinCo';
import Section3 from './Section3';
import Section4 from './Section4';

export default function ThemMoiSuaSachPage() {
  return (
    <main className="relative pt-16 bg-surface min-h-screen"><div className="flex flex-col w-full"><div className="p-space-lg max-w-[1560px] mx-auto w-full space-y-space-lg">
      <ThemMoiDauSach />
      <S1ThongTinCo />
      <Section3 />
      <Section4 />
    </div></div></main>
  );
}
