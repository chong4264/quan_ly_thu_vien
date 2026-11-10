import Section1 from './Section1';
import ManageSearchTraCuu from './ManageSearchTraCuu';
import SachMoiNhapThang from './SachMoiNhapThang';

export default function TraCuuSachPage() {
  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-lg"><div className="flex flex-col w-full gap-space-xl">
      <Section1 />
      <ManageSearchTraCuu />
      <SachMoiNhapThang />
    </div></div></main>
  );
}
