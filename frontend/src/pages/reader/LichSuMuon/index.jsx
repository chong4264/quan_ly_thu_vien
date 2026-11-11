import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMyLoanHistory } from '../../../lib/reader-loans';
import NhatKyMuonTra from './NhatKyMuonTra';
import Section2 from './Section2';
import Section3 from './Section3';
import Section4 from './Section4';

const DEFAULT_FILTERS = { q: '', status: 'all', from: '', to: '', page: 1, pageSize: 10 };

function UnlinkedNotice() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-xl shadow-sm text-center flex flex-col items-center gap-space-md">
      <div className="w-14 h-14 rounded-full bg-surface-container text-primary flex items-center justify-center">
        <span className="material-symbols-outlined text-[30px]">link_off</span>
      </div>
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface">Tài khoản chưa được liên kết hồ sơ độc giả</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl mx-auto">
          Lịch sử mượn chỉ hiển thị khi tài khoản đăng nhập được gắn với một hồ sơ Patron trong Strapi. Vui lòng liên hệ thủ thư để cập nhật trường <strong>user</strong> của hồ sơ độc giả.
        </p>
      </div>
    </div>
  );
}

export default function LichSuMuonPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({ loading: true, error: '', payload: null });
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((current) => (current.q === search ? current : { ...current, q: search, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    void refreshKey;
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const payload = await fetchMyLoanHistory(filters);
      if (id === requestId.current) setState({ loading: false, error: '', payload });
    } catch (e) {
      if (id === requestId.current) setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, [filters, refreshKey]);

  useEffect(() => { load(); }, [load]);

  const applyFilters = (patch) => {
    setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 }));
  };

  const clearFilters = () => {
    setSearch('');
    setFilters((current) => ({ ...DEFAULT_FILTERS, pageSize: current.pageSize }));
  };

  const payload = state.payload;

  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="flex flex-col w-full"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-lg flex flex-col gap-space-lg">
      <NhatKyMuonTra payload={payload} loading={state.loading} />
      {payload?.linked === false ? (
        <UnlinkedNotice />
      ) : (
        <>
          <Section2 payload={payload} loading={state.loading} />
          <Section3
            filters={filters}
            counts={payload?.counts}
            meta={payload?.meta}
            search={search}
            loading={state.loading}
            onSearch={setSearch}
            onFilter={applyFilters}
            onRefresh={() => setRefreshKey((n) => n + 1)}
            onClear={clearFilters}
          />
          <Section4
            payload={payload}
            loading={state.loading}
            error={state.error}
            onRetry={load}
            onPage={(page) => applyFilters({ page })}
            onPageSize={(pageSize) => applyFilters({ pageSize, page: 1 })}
            onClear={clearFilters}
          />
        </>
      )}
    </div></div></main>
  );
}
