import { useToast } from '../../../context/ToastContext';
import { coverUrl } from '../../../lib/api';
import { CIRCULATION, COPY_CONDITION, LANGUAGE, fmtDate } from '../../../lib/format';
import RequestButton from '../YeuCauMuon/RequestButton';

const STATUS_CHIP = {
  available: 'bg-secondary-fixed text-on-secondary-fixed',
  borrowed: 'bg-surface-container text-tertiary',
  processing: 'bg-primary-fixed text-on-primary-fixed',
  lost: 'bg-surface-container text-error',
};

const Field = ({ label, children, code, accent }) => (
  <div className="flex flex-col bg-surface-container-low p-space-sm rounded-sm">
    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">{label}</span>
    <span className={`${code ? 'font-code-md text-code-md' : 'font-body-md text-body-md'} ${accent ? 'text-primary' : 'text-on-surface'} font-bold mt-1`}>
      {children || '—'}
    </span>
  </div>
);

export default function DaiSoTuyenTinh({ book }) {
  const toast = useToast();
  const img = coverUrl(book.cover);
  const loc = book.location;
  const restricted = book.referenceOnly || !book.allowHomeLoan;

  const copyText = async (text, okMsg) => {
    if (!text) return toast('Chưa có thông tin để sao chép');
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg);
    } catch {
      toast(text);
    }
  };

  let hint = 'Mang theo thẻ thư viện và đến quầy thủ thư để làm thủ tục mượn';
  if (restricted) hint = 'Sách chỉ đọc tại chỗ, không cho mượn về nhà';
  else if (book.availableCopies === 0)
    hint = book.nextDueDate
      ? `Hiện chưa có bản nào trên kệ, bản gần nhất dự kiến trả ${fmtDate(book.nextDueDate)}`
      : 'Hiện chưa có bản nào trên kệ';

  const ready = book.availableCopies > 0;
  const paragraphs = (book.abstract || '').split(/\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
      <div className="lg:col-span-4 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest p-space-lg rounded-md shadow-sm flex flex-col items-center">
          <div className="relative w-full max-w-[280px] aspect-[1/1.45] rounded-sm shadow-md overflow-hidden bg-surface-container-high group">
            {img ? (
              <img className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={img} alt={book.title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[72px]">menu_book</span>
              </div>
            )}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <span className={`bg-surface-container-lowest/95 backdrop-blur-sm ${ready ? 'text-secondary' : 'text-error'} font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold shadow-sm flex items-center gap-1`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ready ? 'bg-secondary' : 'bg-error'}`} />
                {book.totalCopies ? `Còn ${book.availableCopies}/${book.totalCopies} bản sẵn sàng` : 'Chưa có bản sao'}
              </span>
              {book.ddcMain && (
                <span className="bg-primary-container text-on-primary font-code-md text-label-sm px-2 py-0.5 rounded-sm font-semibold shadow-sm w-fit">
                  DDC: {book.ddcMain}
                </span>
              )}
            </div>
            {(book.edition || book.publishYear) && (
              <div className="absolute bottom-2 right-2 bg-surface-dim/90 backdrop-blur-sm text-on-surface px-2 py-0.5 rounded-sm font-code-md text-label-sm shadow-sm">
                {book.edition ? `Lần xuất bản ${book.edition}` : `Xuất bản ${book.publishYear}`}
              </div>
            )}
          </div>

          <div className="w-full mt-space-lg grid grid-cols-2 gap-space-sm text-center">
            <div className="bg-surface-container-low p-space-sm rounded-sm">
              <span className="block font-label-sm text-label-sm text-on-surface-variant">Mượn 30 ngày qua</span>
              <span className="block font-headline-sm text-headline-sm font-bold text-primary">{book.stats.borrowRecent} lượt</span>
            </div>
            <div className="bg-surface-container-low p-space-sm rounded-sm">
              <span className="block font-label-sm text-label-sm text-on-surface-variant">Tổng lượt mượn</span>
              <span className="block font-headline-sm text-headline-sm font-bold text-secondary">{book.stats.borrowTotal} lượt</span>
            </div>
          </div>

          <div className="w-full mt-space-md flex flex-col gap-space-sm">
            <RequestButton key={book.documentId} book={book} />
            <button
              className="w-full h-10 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm transition-all focus:ring-2 focus:ring-primary focus:outline-none"
              onClick={() => copyText(book.callNumber || book.isbn, `Đã sao chép ký hiệu: ${book.callNumber || book.isbn}`)}
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
              Sao chép ký hiệu xếp giá
            </button>
            <div className="text-center font-label-sm text-label-sm text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">info</span>
              {hint}
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-md shadow-sm flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
              Sơ đồ định vị sách
            </span>
            {loc && (
              <span className="font-code-md text-code-md text-primary font-bold bg-primary-fixed px-2 py-0.5 rounded-sm">Kệ {loc.code}</span>
            )}
          </div>
          {loc ? (
            <div className="bg-surface-container-low p-space-md rounded-sm flex flex-col gap-space-xs text-on-surface font-body-sm text-body-sm">
              <div className="flex justify-between gap-3"><span className="text-on-surface-variant">Khu vực:</span><span className="font-semibold text-right">{loc.zone || '—'}</span></div>
              <div className="flex justify-between gap-3"><span className="text-on-surface-variant">Tầng:</span><span className="font-semibold text-right">{loc.floor || '—'}</span></div>
              {loc.description && <div className="flex justify-between gap-3"><span className="text-on-surface-variant">Ghi chú:</span><span className="font-semibold text-right">{loc.description}</span></div>}
              <div className="flex justify-between gap-3"><span className="text-on-surface-variant">Ký hiệu xếp giá:</span><span className="font-semibold text-right">{book.callNumber || '—'}</span></div>
            </div>
          ) : (
            <p className="font-body-sm text-body-sm text-on-surface-variant">Sách chưa được gán vị trí kệ. Vui lòng hỏi thủ thư.</p>
          )}
          <p className="font-label-sm text-label-sm text-on-surface-variant italic">
            * Bạn có thể đến trực tiếp giá sách để lấy tài liệu hoặc xuất trình mã vạch cho thủ thư tại quầy.
          </p>
        </div>
      </div>

      <div className="lg:col-span-8 flex flex-col gap-space-md">
        <div className="bg-surface-container-lowest p-space-xl rounded-md shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              {book.category && (
                <span className="bg-surface-container text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold">{book.category.name}</span>
              )}
              {book.publishYear && (
                <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">Xuất bản {book.publishYear}</span>
              )}
              {restricted && (
                <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold">Chỉ đọc tại chỗ</span>
              )}
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">{book.title}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
              Tác giả: <span className="text-primary font-semibold">{book.author}</span>
              {book.coAuthors ? `, ${book.coAuthors}` : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-space-md pt-space-sm">
            <Field label="Ký hiệu xếp giá" code>{book.callNumber}</Field>
            <Field label="Mã chuẩn ISBN" code>{book.isbn}</Field>
            <Field label="Nhà xuất bản">{book.publisher}</Field>
            <Field label="Quy cách ấn bản">{book.pages ? `${book.pages} trang` : null}</Field>
            <Field label="Ngôn ngữ">{LANGUAGE[book.language] || book.language}</Field>
            <Field label="Số phân loại Dewey (DDC)" code accent>
              {book.ddcMain ? `${book.ddcMain}${book.category?.ddcClass ? ` - ${book.category.ddcClass}` : ''}` : null}
            </Field>
          </div>

          <div className="mt-space-xs flex flex-col gap-space-xs">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">subject</span>
              Tóm tắt nội dung
            </h2>
            <div className="text-on-surface-variant font-body-md text-body-md leading-relaxed text-justify space-y-2">
              {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p>Chưa có tóm tắt nội dung cho đầu sách này.</p>}
            </div>
            {!!book.tags.length && (
              <div className="flex flex-wrap gap-1.5 mt-space-xs">
                {book.tags.map((t) => (
                  <span key={t} className="bg-surface-container text-on-surface-variant px-space-sm py-0.5 rounded-sm font-label-sm text-label-sm font-medium">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container-lowest p-space-lg rounded-md shadow-sm flex flex-col gap-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">inventory_2</span>
                Danh sách bản sao tại kho (Sổ đăng ký cá biệt)
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Hiện trạng từng cuốn theo mã vạch định danh của thư viện</p>
            </div>
            <span className="font-label-sm text-label-sm px-2 py-1 rounded-sm bg-surface-container font-semibold text-on-surface">
              Tổng cộng: {String(book.totalCopies).padStart(2, '0')} bản
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md text-body-md">
              <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3" scope="col">Mã ĐKCB</th>
                  <th className="py-2.5 px-3" scope="col">Mã Barcode</th>
                  <th className="py-2.5 px-3" scope="col">Vị trí lưu trữ</th>
                  <th className="py-2.5 px-3" scope="col">Hiện trạng</th>
                  <th className="py-2.5 px-3" scope="col">Tình trạng lưu thông</th>
                  <th className="py-2.5 px-3 text-right" scope="col">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {book.copies.map((c) => (
                  <tr key={c.documentId} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-3 font-code-md text-code-md font-bold text-on-surface">{c.accessionNo}</td>
                    <td className="py-3 px-3 font-code-md text-code-md text-on-surface-variant">{c.barcode}</td>
                    <td className="py-3 px-3 text-body-sm font-medium">{c.shelf ? `Kệ ${c.shelf}` : '—'}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 font-label-sm text-label-sm font-semibold ${c.condition === 'damaged' ? 'text-error' : 'text-secondary'}`}>
                        {COPY_CONDITION[c.condition] || c.condition}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block ${STATUS_CHIP[c.circulationStatus] || STATUS_CHIP.borrowed} font-label-sm text-label-sm px-2 py-0.5 rounded-sm font-semibold`}>
                        {CIRCULATION[c.circulationStatus] || c.circulationStatus}
                        {c.circulationStatus === 'borrowed' && c.dueDate ? ` (đến ${fmtDate(c.dueDate)})` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {c.circulationStatus === 'available' ? (
                        <button
                          className="h-7 px-3 bg-primary-container hover:bg-primary text-on-primary rounded-sm font-label-sm text-label-sm font-medium transition-colors"
                          title="Sao chép mã vạch để xuất trình tại quầy"
                          onClick={() => copyText(c.barcode, `Đã sao chép mã vạch ${c.barcode}`)}
                        >
                          Chép mã vạch
                        </button>
                      ) : (
                        <span className="font-label-sm text-label-sm text-outline">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!book.copies.length && (
                  <tr><td colSpan={6} className="py-6 text-center text-on-surface-variant">Đầu sách này chưa có bản sao nào trong kho</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
