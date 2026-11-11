import { useEffect, useState } from 'react';
import { LANGUAGE, fmtTime } from '../../../lib/format';

/** Form tra cứu. Trạng thái nằm ở trang cha (đồng bộ với URL) nên ô này chỉ giữ chữ đang gõ. */
export default function ManageSearchTraCuu({ params, facets, onChange }) {
  const [text, setText] = useState(params.q);
  useEffect(() => setText(params.q), [params.q]);

  const submit = () => onChange({ q: text.trim() });
  const chipOn = 'h-7 px-2.5 bg-surface-container hover:bg-surface-container-high rounded-sm font-label-sm text-label-sm text-on-surface flex items-center gap-1 transition-colors';
  const chipOff = 'h-7 px-2.5 bg-surface-container-low hover:bg-surface-container rounded-sm font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors';

  return (
    <section className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-1">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-[20px]">manage_search</span>
            Tra cứu Danh mục Thư viện
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {facets ? `Tìm kiếm trên ${new Intl.NumberFormat('vi-VN').format(facets.total)} đầu sách của thư viện` : 'Tìm kiếm trong danh mục đầu sách của thư viện'}
          </p>
        </div>
        {facets?.updatedAt && (
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Kho dữ liệu:</span>
            <span className="font-label-sm text-label-sm bg-surface-container-high text-primary px-2 py-0.5 rounded-sm font-semibold">Cập nhật {fmtTime(facets.updatedAt)}</span>
          </div>
        )}
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-12 gap-space-sm items-center" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="lg:col-span-8 relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[22px]">search</span>
          <input
            className="w-full h-11 pl-11 pr-10 bg-surface-container-low rounded-sm font-body-md text-body-md text-on-surface placeholder-on-surface-variant focus:bg-surface-container-lowest focus:outline-none transition-all shadow-inner"
            id="searchInput"
            placeholder="Nhập tên sách, tác giả, chuyên đề hoặc mã vạch ISBN..."
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-sm" title="Xóa nội dung" type="button" onClick={() => { setText(''); onChange({ q: '' }); }}>
              <span className="material-symbols-outlined text-[18px]">backspace</span>
            </button>
          )}
        </div>
        <div className="lg:col-span-4 flex items-center gap-space-sm">
          <div className="w-full relative">
            <select
              className="w-full h-11 pl-3 pr-8 bg-surface-container-low rounded-sm font-label-md text-label-md text-on-surface appearance-none focus:bg-surface-container-lowest focus:outline-none transition-all"
              value={params.category}
              onChange={(e) => onChange({ category: e.target.value })}
            >
              <option value="">Mọi thể loại & chuyên đề</option>
              {facets?.categories.map((c) => (
                <option key={c.documentId} value={c.documentId}>{c.name} ({c.count})</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
          </div>
          <button className="h-11 px-6 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shrink-0 transition-colors shadow-sm" type="submit">
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Tìm</span>
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
        <div className="flex flex-wrap items-center gap-2">
          {!!facets?.languages.length && (
            <span className="font-label-sm text-label-sm text-outline font-semibold uppercase tracking-wider mr-1">Ngôn ngữ:</span>
          )}
          {facets?.languages.map((l) => {
            const on = params.language === l.code;
            return (
              <button key={l.code} type="button" className={on ? chipOn : chipOff} onClick={() => onChange({ language: on ? '' : l.code })}>
                <span>{LANGUAGE[l.code] || l.code}</span>
                {on && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-space-sm cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input checked={params.available} onChange={(e) => onChange({ available: e.target.checked })} className="sr-only peer" id="stockToggle" type="checkbox" />
            <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-dim after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary" />
          </div>
          <span className="font-label-md text-label-md text-on-surface font-medium">Chỉ hiện sách có sẵn trên kệ</span>
        </label>
      </div>
    </section>
  );
}
