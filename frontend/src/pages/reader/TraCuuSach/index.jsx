import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../lib/api';
import Section1 from './Section1';
import ManageSearchTraCuu from './ManageSearchTraCuu';
import KetQuaTraCuu from './KetQuaTraCuu';
import SachMoiNhapThang from './SachMoiNhapThang';

/** Tham số tra cứu nằm trên URL (?q=&category=&language=&available=0&sort=&page=&browse=1)
 *  để nút Back, tải lại trang và ô tìm kiếm trên thanh header đều hoạt động. */
export default function TraCuuSachPage() {
  const [sp, setSp] = useSearchParams();
  const [facets, setFacets] = useState(null);

  useEffect(() => {
    api('/books/facets').then(setFacets).catch(() => setFacets(null));
  }, []);

  const params = useMemo(() => ({
    q: sp.get('q') || '',
    category: sp.get('category') || '',
    language: sp.get('language') || '',
    available: sp.get('available') !== '0',
    sort: sp.get('sort') || 'newest',
    page: Math.max(1, parseInt(sp.get('page'), 10) || 1),
    browse: sp.get('browse') === '1',
  }), [sp]);

  const onChange = (patch) => {
    const next = { ...params, page: 1, ...patch };
    const out = {};
    if (next.q) out.q = next.q;
    if (next.category) out.category = next.category;
    if (next.language) out.language = next.language;
    if (!next.available) out.available = '0';
    if (next.sort !== 'newest') out.sort = next.sort;
    if (next.page > 1) out.page = String(next.page);
    if (next.browse) out.browse = '1';
    setSp(out);
  };

  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-lg"><div className="flex flex-col w-full gap-space-xl">
      <Section1 />
      <ManageSearchTraCuu params={params} facets={facets} onChange={onChange} />
      <SachMoiNhapThang>
        <KetQuaTraCuu params={params} onChange={onChange} />
      </SachMoiNhapThang>
    </div></div></main>
  );
}
