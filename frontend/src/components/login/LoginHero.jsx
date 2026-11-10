const IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqLmWabI18y_p2jiAPIReTpyOrSJYoV4rqVtHxcC5-nWvC7cxLADflBXNYzPo8dCtmLhGwz3Vw1OlSOL04vfbI12eM28EQ3E5t22JRx8Zqne2Qfj6AyB6CSWwGiPk-xVXWaIUnD8Y2gO2tpGO-jAeavpIaOBFE8AZTBKnvaXb8Y_E1i3e1Ac_B4uMspY1fF2nBHF1p40jqnAdqbNVrMYPW3drdLpsXuzDVmnfoyw';

const FEATURES = [
  { icon: 'verified', title: 'Định danh VnEdu / SMAS', sub: 'Đồng bộ dữ liệu Sở GD&ĐT' },
  { icon: 'nfc', title: 'Thẻ RFID ISO 15693', sub: 'Mượn trả tự động Self-Check' },
];

export default function LoginHero() {
  return (
    <div className="lg:col-span-6 relative p-space-xl flex flex-col justify-between overflow-hidden bg-primary text-on-primary">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-on-primary-fixed-variant opacity-95 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-primary-fixed/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-space-lg">
        <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-sm bg-surface-container-lowest/15 backdrop-blur-md">
          <span className="material-symbols-outlined text-[16px] text-secondary-fixed">auto_stories</span>
          <span className="font-label-sm text-label-sm text-secondary-fixed tracking-wide uppercase">Cổng Tri Thức Học Thuật Số Hóa 4.0</span>
        </div>
        <div className="space-y-space-sm">
          <h1 className="font-headline-xl text-headline-xl text-on-primary leading-tight">Khai mở kho tàng tri thức Bưởi - Chu Văn An</h1>
          <p className="font-body-md text-body-md text-on-primary-container max-w-lg">
            Truy cập không giới hạn giáo trình chuyên sâu, tài liệu chuyên khảo bồi dưỡng học sinh giỏi quốc gia và cơ sở dữ liệu số chuẩn quốc tế.
          </p>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow-lg group">
          <img className="w-full h-44 object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out" alt="Thư viện số trường THPT Chuyên Chu Văn An" src={IMG} />
          <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/90 via-inverse-surface/40 to-transparent flex flex-col justify-end p-space-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-headline-sm text-headline-sm text-surface-bright">Phòng Chuyên đề &amp; Đọc số</p>
                <p className="font-body-sm text-body-sm text-surface-dim">Tòa nhà Thư viện - Di sản kiến trúc Thăng Long</p>
              </div>
              <div className="px-space-sm py-1 rounded bg-secondary-container text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">wifi_tethering</span><span>Mở cửa 07:00 - 21:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-space-md rounded-lg bg-surface-container-lowest/10 backdrop-blur-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-lg bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">menu_book</span>
            </div>
            <div>
              <div className="flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-primary">18,400+</span>
                <span className="font-label-sm text-label-sm text-secondary-fixed uppercase">Bản quyền số hóa</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-primary-container">Sách giáo khoa, chuyên khảo Olimpic, luận văn và tạp chí khoa học chuyên ngành tích hợp sẵn.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-space-lg space-y-space-sm">
        <div className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">Tiêu chuẩn công nghệ tích hợp</div>
        <div className="grid grid-cols-2 gap-space-sm">
          {FEATURES.map((f) => (
            <div key={f.icon} className="flex items-center gap-space-xs p-space-sm rounded bg-surface-container-lowest/10">
              <span className="material-symbols-outlined text-secondary-fixed text-[18px]">{f.icon}</span>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-primary font-medium">{f.title}</span>
                <span className="font-body-sm text-body-sm text-on-primary-container text-[11px]">{f.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
