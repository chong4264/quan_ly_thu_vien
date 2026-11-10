import { useState } from 'react';
import CounterHeader from '../../../components/counter/CounterHeader';
import PatronLookup from '../../../components/counter/PatronLookup';
import ReturnList from '../../../components/counter/ReturnList';
import ShiftTable from '../../../components/counter/ShiftTable';
import { CONDITION, fmtTime, money } from '../../../lib/format';

export default function QuayTraGiaHanPage() {
  const [patron, setPatron] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [count, setCount] = useState(0);
  const done = () => setRefresh((n) => n + 1);

  return (
    <main className="relative pt-16 bg-surface min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto p-space-lg flex flex-col gap-space-lg">
        <CounterHeader active="return" count={count} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-5"><PatronLookup patron={patron} onChange={setPatron} refreshKey={refresh} /></div>
          <div className="lg:col-span-7"><ReturnList patron={patron} onDone={done} /></div>
        </div>
        <ShiftTable
          title="Lịch sử trả sách trong ca trực" endpoint="/return-receipts/shift-history" refreshKey={refresh} onCount={setCount}
          columns={[
            { head: 'Mã phiếu', cell: (r) => <span className="font-code-md text-code-md">{r.code}</span> },
            { head: 'Thời gian', cell: (r) => fmtTime(r.returnedAt) },
            { head: 'Độc giả', cell: (r) => r.patron?.fullName },
            { head: 'Sách', cell: (r) => `${r.bookTitle ?? ''} (${r.accessionNo ?? ''})` },
            { head: 'Tình trạng', cell: (r) => CONDITION[r.returnCondition] ?? r.returnCondition },
            { head: 'Phạt', cell: (r) => (r.fine ? `${money(r.fine)} ${r.fineCollected ? '(đã thu)' : '(chưa thu)'}` : '—') },
          ]}
        />
      </div>
    </main>
  );
}
