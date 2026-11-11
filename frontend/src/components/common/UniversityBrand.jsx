export default function UniversityBrand({ compact = false }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img src="/haui-logo.png" alt="Logo Đại học Công nghiệp Hà Nội" className="h-12 w-12 shrink-0 object-contain" />
      <div className="min-w-0">
        <p className="font-bold text-on-surface leading-tight">{compact ? 'Thư viện HaUI' : 'Đại học Công nghiệp Hà Nội'}</p>
        <p className="mt-1 text-xs text-on-surface-variant">{compact ? 'Đại học Công nghiệp Hà Nội' : 'Thư viện số HaUI'}</p>
      </div>
    </div>
  );
}
