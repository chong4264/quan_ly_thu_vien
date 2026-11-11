import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../lib/api';
import { fetchCatalog } from '../../../lib/catalog';

const inputClass = 'w-full rounded-sm border border-outline-variant bg-surface px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-sm border border-outline-variant px-4 py-2 font-medium hover:bg-surface-container disabled:opacity-50';
const fields = [
  { name: 'title', label: 'Tên đầu sách', required: true, wide: true },
  { name: 'author', label: 'Tác giả chính', required: true },
  { name: 'coAuthors', label: 'Đồng tác giả / Người dịch' },
  { name: 'isbn', label: 'ISBN' },
  { name: 'publisher', label: 'Nhà xuất bản' },
  { name: 'publishYear', label: 'Năm xuất bản', type: 'number', min: 1, max: 9999 },
  { name: 'pages', label: 'Số trang', type: 'number', min: 1 },
  { name: 'edition', label: 'Lần xuất bản', type: 'number', min: 1 },
  { name: 'price', label: 'Giá bìa (đồng)', type: 'number', min: 0, step: '0.01' },
  { name: 'ddcMain', label: 'Mã phân loại DDC' },
  { name: 'callNumber', label: 'Ký hiệu xếp giá' },
];
const languages = [
  ['vie', 'Tiếng Việt'], ['eng', 'Tiếng Anh'], ['fra', 'Tiếng Pháp'],
  ['zho', 'Tiếng Trung'], ['rus', 'Tiếng Nga'],
];
const statuses = [
  ['active', 'Đang lưu hành'], ['low_stock', 'Sắp hết sách'],
  ['restricted', 'Hạn chế lưu hành'], ['discontinued', 'Ngừng lưu hành'],
];
const policies = [
  ['allowHomeLoan', 'Cho phép mượn về nhà'],
  ['referenceOnly', 'Tài liệu chỉ đọc tại chỗ'],
  ['priorityGifted', 'Ưu tiên học sinh chuyên'],
];

function formFromBook(book = {}) {
  const form = Object.fromEntries(fields.map(({ name }) => [name, book[name] ?? '']));
  return {
    ...form,
    abstract: book.abstract ?? '',
    tags: Array.isArray(book.tags) ? book.tags.join(', ') : '',
    language: book.language ?? 'vie',
    status: book.status ?? 'active',
    category: book.category?.documentId ?? '',
    shelf: book.shelf?.documentId ?? '',
    allowHomeLoan: book.allowHomeLoan ?? true,
    referenceOnly: book.referenceOnly ?? false,
    priorityGifted: book.priorityGifted ?? false,
  };
}

function preserveRelation(options, current) {
  if (!current || options.some((option) => option.documentId === current.documentId)) return options;
  return [current, ...options];
}

function BookEditor({ documentId, returnTo }) {
  const navigate = useNavigate();
  const toast = useToast();
  const savingRef = useRef(false);
  const tagsChanged = useRef(false);
  const originalTags = useRef([]);
  const [form, setForm] = useState(() => formFromBook());
  const [categories, setCategories] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCatalog('/categories'),
      fetchCatalog('/shelfs', 'code:asc'),
      documentId
        ? api(`/books/${encodeURIComponent(documentId)}?populate[category]=true&populate[shelf]=true`)
        : Promise.resolve(null),
    ]).then(([categoryRows, shelfRows, response]) => {
      if (!active) return;
      const book = response?.data;
      if (documentId && !book?.documentId) throw new Error('Không tìm thấy đầu sách cần sửa.');
      setForm(formFromBook(book));
      originalTags.current = book?.tags ?? [];
      tagsChanged.current = false;
      setCategories(preserveRelation(categoryRows, book?.category));
      setShelves(preserveRelation(shelfRows, book?.shelf));
    }).catch((error) => {
      if (active) setLoadError(error.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [documentId, retry]);

  function change(event) {
    const { name, value, type, checked } = event.target;
    if (name === 'tags') tagsChanged.current = true;
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
  }

  async function save(event) {
    event.preventDefault();
    if (savingRef.current || loading || loadError) return;
    setSaveError('');
    if (!form.title.trim() || !form.author.trim()) {
      setSaveError('Vui lòng nhập tên đầu sách và tác giả.');
      return;
    }

    const data = {};
    for (const field of fields) {
      const value = String(form[field.name]).trim();
      if (field.type === 'number') {
        const number = value === '' ? null : Number(value);
        const invalidRange = number !== null && (
          !Number.isFinite(number) || number < field.min || (field.max && number > field.max)
        );
        const invalidInteger = number !== null && field.name !== 'price' && !Number.isInteger(number);
        if (invalidRange || invalidInteger) {
          setSaveError(`Giá trị ${field.label.toLowerCase()} không hợp lệ.`);
          return;
        }
        data[field.name] = number;
      } else {
        data[field.name] = value || null;
      }
    }
    Object.assign(data, {
      abstract: form.abstract.trim(),
      tags: tagsChanged.current
        ? [...new Set(form.tags.split(',').map((tag) => tag.trim()).filter(Boolean))]
        : originalTags.current,
      language: form.language,
      status: form.status,
      category: form.category || null,
      shelf: form.shelf || null,
      allowHomeLoan: form.allowHomeLoan,
      referenceOnly: form.referenceOnly,
      priorityGifted: form.priorityGifted,
    });

    savingRef.current = true;
    setSaving(true);
    try {
      const endpoint = documentId ? `/books/${encodeURIComponent(documentId)}` : '/books';
      await api(endpoint, { method: documentId ? 'PUT' : 'POST', body: { data } });
      toast(documentId ? 'Đã cập nhật đầu sách.' : 'Đã thêm đầu sách mới.');
      navigate(returnTo, { replace: true });
    } catch (error) {
      setSaveError(error.message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface pt-16">
      <div className="mx-auto max-w-5xl space-y-6 p-space-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">{documentId ? 'Sửa đầu sách' : 'Thêm đầu sách mới'}</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Các trường có dấu * là bắt buộc.</p>
          </div>
          <Link to={returnTo} className={buttonClass} aria-disabled={saving} onClick={(event) => {
            if (saving) event.preventDefault();
          }}>Về danh sách</Link>
        </div>

        {loading && <p role="status" className="rounded-sm bg-surface-container-lowest p-6">Đang tải thông tin đầu sách...</p>}
        {loadError && (
          <div role="alert" className="space-y-3 rounded-sm bg-error-container p-4 text-on-error-container">
            <p>{loadError}</p>
            <button type="button" className={buttonClass} onClick={() => {
              setLoadError('');
              setLoading(true);
              setRetry((value) => value + 1);
            }}>Thử tải lại</button>
          </div>
        )}

        {!loading && !loadError && (
          <form onSubmit={save} className="space-y-6">
            <fieldset disabled={saving} className="space-y-6">
              <section className="space-y-5 rounded-sm bg-surface-container-lowest p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-on-surface">Thông tin xuất bản</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.name} className={field.wide ? 'sm:col-span-2' : ''}>
                      <label htmlFor={field.name} className="mb-1 block text-sm font-medium text-on-surface">
                        {field.label}{field.required ? ' *' : ''}
                      </label>
                      <input
                        id={field.name} name={field.name} value={form[field.name]} onChange={change}
                        required={field.required} type={field.type || 'text'} min={field.min} max={field.max}
                        step={field.step || (field.type === 'number' ? '1' : undefined)} className={inputClass}
                      />
                    </div>
                  ))}
                  <div>
                    <label htmlFor="language" className="mb-1 block text-sm font-medium text-on-surface">Ngôn ngữ</label>
                    <select id="language" name="language" value={form.language} onChange={change} className={inputClass}>
                      {languages.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="mb-1 block text-sm font-medium text-on-surface">Trạng thái lưu hành</label>
                    <select id="status" name="status" value={form.status} onChange={change} className={inputClass}>
                      {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-5 rounded-sm bg-surface-container-lowest p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-on-surface">Phân loại và nội dung</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="category" className="mb-1 block text-sm font-medium text-on-surface">Thể loại</label>
                    <select id="category" name="category" value={form.category} onChange={change} className={inputClass}>
                      <option value="">Chưa phân loại</option>
                      {categories.map((category) => (
                        <option key={category.documentId} value={category.documentId}>
                          {category.name}{category.status === 'inactive' ? ' (ngừng sử dụng)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="shelf" className="mb-1 block text-sm font-medium text-on-surface">Kệ sách</label>
                    <select id="shelf" name="shelf" value={form.shelf} onChange={change} className={inputClass}>
                      <option value="">Chưa xếp kệ</option>
                      {shelves.map((shelf) => <option key={shelf.documentId} value={shelf.documentId}>{shelf.code}{shelf.zone ? ` — ${shelf.zone}` : ''}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="tags" className="mb-1 block text-sm font-medium text-on-surface">Từ khóa</label>
                  <input id="tags" name="tags" value={form.tags} onChange={change} className={inputClass} placeholder="Văn học, Khoa học, Tham khảo..." />
                  <p className="mt-1 text-xs text-on-surface-variant">Phân cách các từ khóa bằng dấu phẩy.</p>
                </div>
                <div>
                  <label htmlFor="abstract" className="mb-1 block text-sm font-medium text-on-surface">Tóm tắt nội dung</label>
                  <textarea id="abstract" name="abstract" rows={5} value={form.abstract} onChange={change} className={inputClass} />
                </div>
                <div className="flex flex-wrap gap-5">
                  {policies.map(([name, label]) => (
                    <label key={name} className="flex items-center gap-2 text-sm text-on-surface">
                      <input type="checkbox" name={name} checked={form[name]} onChange={change} className="accent-primary" />
                      {label}
                    </label>
                  ))}
                </div>
              </section>
            </fieldset>

            {saveError && <p role="alert" className="rounded-sm bg-error-container p-4 text-on-error-container">{saveError}</p>}
            <div className="flex items-center justify-end gap-3 pb-6">
              <button type="button" className={buttonClass} disabled={saving} onClick={() => navigate(returnTo)}>Hủy</button>
              <button type="submit" disabled={saving} className="rounded-sm bg-primary px-5 py-2 font-semibold text-on-primary hover:opacity-90 disabled:opacity-50">
                {saving ? 'Đang lưu...' : documentId ? 'Lưu thay đổi' : 'Thêm đầu sách'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ThemMoiSuaSachPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const documentId = params.get('id') || '';
  const from = location.state?.from;
  const returnTo = typeof from === 'string' && /^\/quan-ly-dau-sach(?:\?|$)/.test(from)
    ? from
    : '/quan-ly-dau-sach';
  return <BookEditor key={documentId || 'new'} documentId={documentId} returnTo={returnTo} />;
}
