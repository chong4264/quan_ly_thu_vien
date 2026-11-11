export default function LoginHero() {
  return (
    <section className="relative flex flex-col justify-between gap-8 overflow-hidden bg-primary p-8 text-on-primary lg:col-span-6 lg:p-10">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-secondary-fixed">Thư viện số HaUI</p>
        <h1 className="mt-4 text-3xl font-bold leading-tight">Không gian tri thức Đại học Công nghiệp Hà Nội</h1>
        <p className="mt-4 leading-relaxed text-on-primary-container">Tra cứu giáo trình, tài liệu chuyên ngành và quản lý hoạt động mượn trả phục vụ học tập, giảng dạy và nghiên cứu.</p>
      </div>
      <div className="flex items-center gap-6 rounded-xl bg-white/10 p-6">
        <img src="/haui-logo.png" alt="Logo Đại học Công nghiệp Hà Nội" className="h-28 w-28 rounded-lg object-contain sm:h-36 sm:w-36" />
        <div><p className="text-2xl font-bold">HaUI</p><p className="mt-2 text-sm text-on-primary-container">Đồng hành cùng sinh viên, giảng viên và cán bộ nhà trường.</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-white/10 p-4"><span className="material-symbols-outlined" aria-hidden="true">manage_search</span><p className="mt-2 font-semibold">Tra cứu tài liệu</p><p className="mt-1 text-on-primary-container">Tìm theo tên sách, tác giả và ISBN.</p></div>
        <div className="rounded-lg bg-white/10 p-4"><span className="material-symbols-outlined" aria-hidden="true">auto_stories</span><p className="mt-2 font-semibold">Theo dõi mượn trả</p><p className="mt-1 text-on-primary-container">Xem sách đang mượn và lịch sử cá nhân.</p></div>
      </div>
    </section>
  );
}
