import UniversityBrand from '../common/UniversityBrand';

export default function LoginHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-surface-container bg-surface-container-lowest/95 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-margin-desktop">
        <UniversityBrand />
        <span className="hidden text-sm text-on-surface-variant sm:block">Cổng thông tin thư viện</span>
      </div>
    </header>
  );
}
