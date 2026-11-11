export default function Section4({ selectedCount = 0, total = 0, onRemind, onRenew, onPrint, onClear }) {
  const hasSelection = selectedCount > 0;
  return <div className="px-margin-desktop mb-2">
    <div className="max-w-[1600px] mx-auto bg-surface-container-highest px-space-md py-2.5 rounded-sm flex flex-wrap items-center justify-between gap-space-sm shadow-sm">
      <div className="flex flex-wrap items-center gap-space-md">
        <div className="font-label-md text-on-surface font-semibold">
          <span className="material-symbols-outlined align-middle text-primary mr-1">checklist</span>
          Đã chọn: <strong className="text-primary">{selectedCount}</strong>{total ? ` / ${total} phiếu` : ' phiếu'}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button disabled={!hasSelection} onClick={onRemind} title={hasSelection ? 'Gửi email nhắc trả cho các sách đang mượn trong phiếu đã chọn' : 'Chọn ít nhất một phiếu để gửi email'} className="h-8 px-3 bg-surface-container-lowest rounded-sm text-label-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined align-middle text-[16px] text-error mr-1">outgoing_mail</span>Gửi email nhắc trả
          </button>
          <button disabled={!hasSelection} onClick={onRenew} title={hasSelection ? 'Gia hạn các lượt mượn đủ điều kiện trong phiếu đã chọn' : 'Chọn ít nhất một phiếu để gia hạn'} className="h-8 px-3 bg-surface-container-lowest rounded-sm text-label-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined align-middle text-[16px] text-secondary mr-1">update</span>Gia hạn hàng loạt theo quy định
          </button>
          <button disabled={!hasSelection} onClick={onPrint} title={hasSelection ? 'In các phiếu đã chọn' : 'Chọn ít nhất một phiếu để in'} className="h-8 px-3 bg-surface-container-lowest rounded-sm text-label-sm disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined align-middle text-[16px] mr-1">print</span>In phiếu đã chọn
          </button>
        </div>
      </div>
      <button disabled={!hasSelection} onClick={onClear} className="h-8 px-2 text-on-surface-variant hover:text-error text-label-sm disabled:opacity-40 disabled:cursor-not-allowed">
        <span className="material-symbols-outlined align-middle text-[16px]">close</span> Bỏ chọn
      </button>
    </div>
    {!hasSelection && <p className="max-w-[1600px] mx-auto mt-1 text-xs text-on-surface-variant">Chọn một hoặc nhiều phiếu ở cột đầu tiên để bật chức năng gửi email nhắc trả, gia hạn hàng loạt hoặc in phiếu.</p>}
  </div>;
}
