/**
 * book service
 */

import { factories } from '@strapi/strapi';
import { ACTIVE, NotFoundError, docs, UID } from '../../../utils/library';
import { copyBlockReason } from '../../copy/services/copy';

/** Đầu sách độc giả được phép nhìn thấy (ẩn sách đã ngừng lưu hành) */
const VISIBLE_STATUS = ['active', 'low_stock', 'restricted'];
const LANGUAGES = ['vie', 'eng', 'fra', 'zho', 'rus'];

/** Các trường được tìm theo từ khóa */
const SEARCH_FIELDS = ['title', 'author', 'coAuthors', 'publisher', 'isbn', 'ddcMain', 'callNumber'];

const SORTS: Record<string, string[]> = {
  newest: ['createdAt:desc'],
  title: ['title:asc'],
  year: ['publishYear:desc', 'title:asc'],
};

const BOOK_POPULATE = {
  cover: true,
  shelf: { fields: ['code'] },
  category: { fields: ['name', 'ddcCode'], populate: { shelf: { fields: ['code'] } } },
  copies: { fields: ['circulationStatus'] },
};

const str = (v: any) => (typeof v === 'string' ? v.trim() : '');
const int = (v: any, def: number) => {
  const n = parseInt(str(v), 10);
  return Number.isFinite(n) ? n : def;
};

/** Chuyển đầu sách sang dữ liệu trả cho độc giả (chỉ các trường công khai) */
const toDto = (b: any) => {
  const copies: any[] = b.copies ?? [];
  const availableCopies = copies.filter((c) => c.circulationStatus === 'available').length;
  const allowHomeLoan = b.allowHomeLoan !== false;
  return {
    documentId: b.documentId,
    title: b.title,
    author: b.author,
    coAuthors: b.coAuthors ?? null,
    publisher: b.publisher ?? null,
    publishYear: b.publishYear ?? null,
    isbn: b.isbn ?? null,
    language: b.language,
    pages: b.pages ?? null,
    abstract: b.abstract ? String(b.abstract).slice(0, 300) : null,
    ddcMain: b.ddcMain ?? null,
    callNumber: b.callNumber ?? null,
    status: b.status,
    category: b.category
      ? { documentId: b.category.documentId, name: b.category.name, ddcCode: b.category.ddcCode }
      : null,
    shelf: b.shelf?.code ?? b.category?.shelf?.code ?? null,
    cover: b.cover?.formats?.small?.url ?? b.cover?.url ?? null,
    totalCopies: copies.length,
    availableCopies,
    referenceOnly: !!b.referenceOnly,
    allowHomeLoan,
    canBorrow: availableCopies > 0 && !b.referenceOnly && allowHomeLoan,
  };
};

export default factories.createCoreService('api::book.book', ({ strapi }) => ({
  async search(raw: any = {}) {
    const q = str(raw.q).slice(0, 100);
    const category = str(raw.category);
    const languages = str(raw.language)
      .split(',')
      .filter((l) => LANGUAGES.includes(l));
    const availableOnly = ['1', 'true'].includes(str(raw.available));
    const page = Math.max(1, int(raw.page, 1));
    const pageSize = Math.min(48, Math.max(1, int(raw.pageSize, 12)));
    const sort = SORTS[str(raw.sort)] ?? SORTS.newest;

    const and: any[] = [{ status: { $in: VISIBLE_STATUS } }];

    // Mỗi từ khóa phải khớp ít nhất một trường (AND giữa các từ, OR giữa các trường)
    for (const term of q.split(/\s+/).filter(Boolean).slice(0, 6)) {
      const or: any[] = SEARCH_FIELDS.map((f) => ({ [f]: { $containsi: term } }));
      or.push({ category: { name: { $containsi: term } } });
      const noDash = term.replace(/-/g, '');
      if (noDash !== term) or.push({ isbn: { $containsi: noDash } });
      and.push({ $or: or });
    }
    if (category) and.push({ category: { documentId: { $eq: category } } });
    if (languages.length) and.push({ language: { $in: languages } });
    if (availableOnly) and.push({ copies: { circulationStatus: { $eq: 'available' } } });

    const filters = { $and: and };
    const [rows, total] = await Promise.all([
      docs(strapi, UID.book).findMany({
        filters,
        sort,
        populate: BOOK_POPULATE,
        limit: pageSize,
        start: (page - 1) * pageSize,
      }),
      docs(strapi, UID.book).count({ filters }),
    ]);

    return {
      data: rows.map(toDto),
      meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } },
    };
  },

  async newArrivals(raw: any = {}) {
    const limit = Math.min(24, Math.max(1, int(raw.limit, 8)));
    const filters = { status: { $in: VISIBLE_STATUS } };
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [rows, total, recent] = await Promise.all([
      docs(strapi, UID.book).findMany({
        filters,
        sort: SORTS.newest,
        populate: BOOK_POPULATE,
        limit,
      }),
      docs(strapi, UID.book).count({ filters }),
      docs(strapi, UID.book).count({ filters: { ...filters, createdAt: { $gte: since } } }),
    ]);
    return { data: rows.map(toDto), meta: { total, recent30Days: recent } };
  },

  /** Thông tin đầy đủ của một đầu sách kèm từng bản sao (sổ đăng ký cá biệt) */
  async detail(documentId: string) {
    const book = await docs(strapi, UID.book).findOne({
      documentId,
      populate: {
        cover: true,
        shelf: true,
        category: { populate: { shelf: true } },
        copies: { populate: { shelf: { fields: ['code'] } } },
      },
    });
    if (!book || !VISIBLE_STATUS.includes(book.status)) throw new NotFoundError('Không tìm thấy đầu sách');

    const ofBook = { copy: { book: { documentId: { $eq: documentId } } } };
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const [active, borrowTotal, borrowRecent] = await Promise.all([
      docs(strapi, UID.loanItem).findMany({
        filters: { ...ofBook, status: { $in: ACTIVE } },
        fields: ['dueDate'],
        populate: { copy: { fields: ['documentId'] } },
        limit: 500,
      }),
      docs(strapi, UID.loanItem).count({ filters: ofBook }),
      docs(strapi, UID.loanItem).count({ filters: { ...ofBook, createdAt: { $gte: since } } }),
    ]);

    // Hạn trả của từng bản đang được mượn (không lộ người mượn)
    const dueByCopy = new Map<string, string>();
    for (const i of active) if (i.copy?.documentId) dueByCopy.set(i.copy.documentId, i.dueDate);

    const copies = [...(book.copies ?? [])]
      .sort((a: any, b: any) => String(a.accessionNo).localeCompare(String(b.accessionNo)))
      .map((c: any) => {
        const blockReason = copyBlockReason({ ...c, book });
        return {
          documentId: c.documentId,
          accessionNo: c.accessionNo,
          barcode: c.barcode,
          condition: c.condition,
          circulationStatus: c.circulationStatus,
          shelf: c.shelf?.code ?? null,
          dueDate: dueByCopy.get(c.documentId) ?? null,
          canBorrow: !blockReason,
          blockReason,
        };
      });

    const shelf = book.shelf ?? book.category?.shelf ?? null;
    const dues = copies.filter((c) => c.circulationStatus === 'borrowed' && c.dueDate).map((c) => c.dueDate as string);

    return {
      data: {
        ...toDto(book),
        abstract: book.abstract ?? null,
        cover: book.cover?.url ?? null,
        edition: book.edition ?? null,
        tags: Array.isArray(book.tags) ? book.tags.filter((t: any) => typeof t === 'string') : [],
        category: book.category
          ? {
              documentId: book.category.documentId,
              name: book.category.name,
              ddcCode: book.category.ddcCode,
              ddcClass: book.category.ddcClass ?? null,
            }
          : null,
        location: shelf
          ? { code: shelf.code, zone: shelf.zone ?? null, floor: shelf.floor ?? null, description: shelf.description ?? null }
          : null,
        copies,
        nextDueDate: dues.length ? dues.sort()[0] : null,
        stats: { borrowTotal, borrowRecent },
      },
    };
  },

  /** Sách cùng thể loại (trừ chính nó) cho mục "Tài liệu cùng chuyên đề" */
  async related(documentId: string, raw: any = {}) {
    const limit = Math.min(12, Math.max(1, int(raw.limit, 4)));
    const book = await docs(strapi, UID.book).findOne({
      documentId,
      populate: { category: { fields: ['name'] } },
    });
    if (!book) throw new NotFoundError('Không tìm thấy đầu sách');
    if (!book.category) return { data: [] };

    const rows = await docs(strapi, UID.book).findMany({
      filters: {
        $and: [
          { status: { $in: VISIBLE_STATUS } },
          { documentId: { $ne: documentId } },
          { category: { documentId: { $eq: book.category.documentId } } },
        ],
      },
      sort: SORTS.newest,
      populate: BOOK_POPULATE,
      limit,
    });
    return { data: rows.map(toDto) };
  },

  async facets() {
    const visible = { status: { $in: VISIBLE_STATUS } };
    const [cats, total, latest, langCounts] = await Promise.all([
      docs(strapi, UID.category).findMany({
        filters: { status: { $eq: 'active' } },
        sort: ['name:asc'],
        limit: 200,
      }),
      docs(strapi, UID.book).count({ filters: visible }),
      docs(strapi, UID.book).findMany({
        filters: visible,
        sort: ['updatedAt:desc'],
        fields: ['updatedAt'],
        limit: 1,
      }),
      Promise.all(
        LANGUAGES.map(async (code) => ({
          code,
          count: await docs(strapi, UID.book).count({ filters: { ...visible, language: { $eq: code } } }),
        })),
      ),
    ]);

    const categories = await Promise.all(
      cats.map(async (c: any) => ({
        documentId: c.documentId,
        name: c.name,
        ddcCode: c.ddcCode,
        count: await docs(strapi, UID.book).count({
          filters: { ...visible, category: { documentId: { $eq: c.documentId } } },
        }),
      })),
    );

    return {
      total,
      updatedAt: latest[0]?.updatedAt ?? null,
      categories,
      languages: langCounts.filter((l) => l.count > 0),
    };
  },
}));
