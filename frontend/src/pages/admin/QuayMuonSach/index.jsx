import { useState } from 'react';
import CounterHeader from '../../../components/counter/CounterHeader';
import PatronLookup from '../../../components/counter/PatronLookup';
import BorrowCart from '../../../components/counter/BorrowCart';
import ShiftTable from '../../../components/counter/ShiftTable';
import { fmtTime, fmtDate } from '../../../lib/format';

export default function QuayMuonSachPage() {
  const [patron, setPatron] = useState(null);
  const [refresh, setRefresh] = useState(0);
  const [count, setCount] = useState(0);
  const done = () => setRefresh((n) => n + 1);

  return (
    <main className="relative pt-16 bg-surface min-h-screen">
      <div className="w-full max-w-[1600px] mx-auto p-space-lg flex flex-col gap-space-lg">
        <CounterHeader active="borrow" count={count} />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <div className="lg:col-span-5"><PatronLookup patron={patron} onChange={setPatron} refreshKey={refresh} /></div>
          <div className="lg:col-span-7"><BorrowCart patron={patron} onDone={done} /></div>
        </div>
        <ShiftTable
          title="Lịch sử mượn trong ca trực" endpoint="/loans/shift-history" refreshKey={refresh} onCount={setCount}
          columns={[
            { head: 'Mã phiếu', cell: (r) => <span className="font-code-md text-code-md">{r.code}</span> },
            { head: 'Thời gian', cell: (r) => fmtTime(r.loanedAt) },
            { head: 'Độc giả', cell: (r) => `${r.patron?.fullName ?? ''} (${r.patron?.className ?? ''})` },
            { head: 'SL', cell: (r) => r.itemCount },
            { head: 'Tài liệu', cell: (r) => r.titles.join(', ') },
            { head: 'Hạn trả', cell: (r) => fmtDate(r.dueDate) },
          ]}
        />
      </div>
    </main>
  );
}
