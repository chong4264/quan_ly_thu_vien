import { useCallback, useEffect, useState } from 'react';
import { fetchMyLoans } from '../../../lib/reader-loans';
import TuSachDangMuon from './TuSachDangMuon';
import Section2 from './Section2';
import DanhMucAnPham from './DanhMucAnPham';

export default function SachDangMuonPage() {
  const [state, setState] = useState({ loading: true, error: '', payload: null });

  const load = useCallback(async ({ silent = false } = {}) => {
    setState((s) => ({ ...s, loading: silent ? s.loading : true, error: '' }));
    try {
      const payload = await fetchMyLoans();
      setState({ loading: false, error: '', payload });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="w-full pt-[108px] bg-surface min-h-[calc(100vh-140px)]"><div className="flex flex-col w-full"><div className="w-full max-w-[1600px] mx-auto px-margin lg:px-margin-desktop py-space-xl flex flex-col gap-space-xl">
      <TuSachDangMuon payload={state.payload} loading={state.loading} error={state.error} />
      {state.payload?.linked !== false && <Section2 payload={state.payload} loading={state.loading} />}
      <DanhMucAnPham
        payload={state.payload}
        loading={state.loading}
        error={state.error}
        onRetry={() => load()}
        onReload={() => load({ silent: true })}
      />
    </div></div></main>
  );
}
