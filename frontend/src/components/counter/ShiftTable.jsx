import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

/** Bảng lịch sử trong ca. columns: [{ head, cell: (row) => node }] */
export default function ShiftTable({ title, endpoint, columns, refreshKey, onCount }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`${endpoint}?mine=true`)
      .then((r) => { setRows(r.data); onCount?.(r.data.length); setError(''); })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, endpoint]);

  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
      <span className="font-headline-sm text-headline-sm text-on-surface">{title}</span>
      {error && <p className="text-error font-body-sm text-body-sm">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="font-label-sm text-label-sm uppercase text-outline">
              {columns.map((c) => <th key={c.head} className="py-2 pr-4">{c.head}</th>)}
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {rows.map((r) => (
              <tr key={r.code} className="border-t border-outline-variant/40">
                {columns.map((c) => <td key={c.head} className="py-2 pr-4">{c.cell(r)}</td>)}
              </tr>
            ))}
            {!rows.length && !error && <tr><td colSpan={columns.length} className="py-6 text-center text-on-surface-variant">Chưa có giao dịch nào trong ca này</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
