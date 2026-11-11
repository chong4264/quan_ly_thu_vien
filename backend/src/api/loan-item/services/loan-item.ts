import { factories } from "@strapi/strapi";
import type { Core } from "@strapi/strapi";
import { lockDocument } from "../../../utils/circulation-locks";
import {
  ACTIVE, ApplicationError, ForbiddenError, NotFoundError, UID, UnauthorizedError,
  addDays, compensationTable, daysBetween, docs, getSettings, lateDays, todayStr,
} from "../../../utils/library";

const HISTORY_STATUSES = ["all", "borrowing", "overdue", "returned_ontime", "returned_late"] as const;
type HistoryStatus = (typeof HISTORY_STATUSES)[number];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const one = (value: any) => (Array.isArray(value) ? value[0] : value);

const coverOf = (book: any) => {
  const cover = one(book?.cover);
  return cover?.url ?? null;
};

const bookOf = (item: any) => item?.copy?.book ?? null;

/** Tìm hồ sơ Patron đang gắn với tài khoản Users & Permissions. */
async function findPatronByUser(strapi: Core.Strapi, user: any) {
  if (!user) throw new UnauthorizedError("Vui lòng đăng nhập để xem dữ liệu mượn sách");
  const filters = user.id != null
    ? { user: { id: { $eq: user.id } } }
    : { user: { documentId: { $eq: user.documentId } } };
  const [patron] = await docs(strapi, UID.patron).findMany({
    filters,
    populate: { patronType: true },
    limit: 1,
  });
  return patron ?? null;
}

const cardState = (patron: any, today: string) => {
  if (!patron) return { ok: false, reason: "Chưa có hồ sơ độc giả" };
  if (patron.cardStatus === "locked") return { ok: false, reason: "Thẻ đang bị khóa" };
  if (patron.cardStatus === "expired" || (patron.cardExpiresAt && patron.cardExpiresAt < today)) {
    return { ok: false, reason: "Thẻ đã hết hạn" };
  }
  return { ok: true, reason: null };
};

const patronDto = (patron: any) => ({
  documentId: patron.documentId,
  fullName: patron.fullName,
  studentCode: patron.studentCode,
  className: patron.className,
  cardBarcode: patron.cardBarcode,
  cardStatus: patron.cardStatus,
  cardExpiresAt: patron.cardExpiresAt,
  patronType: patron.patronType && {
    name: patron.patronType.name,
    maxBooks: patron.patronType.maxBooks,
    loanDays: patron.patronType.loanDays,
    maxRenewals: patron.patronType.maxRenewals,
    renewDays: patron.patronType.renewDays,
  },
});

const settingsDto = (settings: any) => ({
  finePerDay: settings.finePerDay,
  remindBeforeDays: settings.remindBeforeDays,
  autoLockAfterDays: settings.autoLockAfterDays,
});

const emptySummary = { borrowingCount: 0, maxBooks: 0, remaining: 0, dueSoonCount: 0, overdueCount: 0, fine: 0 };

/** Dòng sách còn đang giữ, đã tính trạng thái quá hạn theo ngày Việt Nam. */
function activeItemDto(item: any, patron: any, today: string, finePerDay: number, remindBeforeDays: number) {
  const book = bookOf(item);
  const loan = item.loan ?? {};
  const dueDate: string = item.dueDate;
  const loanedAt: string | null = loan.loanedAt ?? null;
  const loanedDate = loanedAt ? todayStr(new Date(loanedAt)) : null;
  const late = lateDays(dueDate, today);
  const daysLeft = daysBetween(today, dueDate);
  const maxRenewals = Number(patron?.patronType?.maxRenewals ?? 0);
  const renewDays = Number(patron?.patronType?.renewDays ?? 0);
  const renewCount = Number(item.renewCount ?? 0);
  const card = cardState(patron, today);
  const cycleDays = loanedDate ? Math.max(1, daysBetween(loanedDate, dueDate)) : 1;
  const elapsed = loanedDate ? Math.max(0, daysBetween(loanedDate, today)) : 0;
  const progress = late > 0 ? 100 : Math.min(100, Math.max(0, Math.round((elapsed / cycleDays) * 100)));

  let renewBlockedReason: string | null = null;
  if (!card.ok) renewBlockedReason = card.reason;
  else if (late > 0) renewBlockedReason = `Sách đã quá hạn ${late} ngày`;
  else if (renewCount >= maxRenewals) renewBlockedReason = `Đã gia hạn tối đa ${maxRenewals} lần`;

  return {
    loanItemId: item.documentId,
    loanCode: loan.code ?? null,
    accessionNo: item.copy?.accessionNo ?? null,
    barcode: item.copy?.barcode ?? null,
    title: book?.title ?? "Không xác định",
    author: book?.author ?? "",
    publisher: book?.publisher ?? null,
    publishYear: book?.publishYear ?? null,
    categoryName: book?.category?.name ?? null,
    ddcMain: book?.ddcMain ?? null,
    callNumber: book?.callNumber ?? null,
    coverUrl: coverOf(book),
    loanedAt,
    loanedDate,
    dueDate,
    renewCount,
    maxRenewals,
    renewDays,
    status: late > 0 ? "overdue" : "borrowing",
    statusLabel: late > 0
      ? `Quá hạn ${late} ngày`
      : daysLeft === 0
        ? "Đến hạn hôm nay"
        : `Còn ${daysLeft} ngày`,
    lateDays: late,
    daysLeft,
    dueSoon: late === 0 && daysLeft <= remindBeforeDays,
    fine: late * finePerDay,
    canRenew: card.ok && late === 0 && renewCount < maxRenewals,
    renewBlockedReason,
    progress,
    cycleDays,
    elapsedDays: Math.max(0, elapsed),
  };
}

/** Dòng lịch sử: một loan-item đang mượn hoặc đã trả. */
function historyItemDto(item: any, patron: any, today: string, finePerDay: number) {
  const book = bookOf(item);
  const loan = item.loan ?? {};
  const dueDate: string = item.dueDate;
  const loanedAt: string | null = loan.loanedAt ?? null;
  const loanedDate = loanedAt ? todayStr(new Date(loanedAt)) : null;
  const returnedAt: string | null = item.returnedAt ?? null;
  const returnedDate = returnedAt ? todayStr(new Date(returnedAt)) : null;
  const receipt = one(item.returnReceipt);
  const isReturned = item.status === "returned" || (!!returnedAt && !ACTIVE.includes(item.status));

  let status: HistoryStatus;
  let late = 0;
  let fine: number;

  if (isReturned) {
    late = returnedDate ? lateDays(dueDate, returnedDate) : Number(item.lateDays ?? 0);
    status = late > 0 ? "returned_late" : "returned_ontime";
    // "Tiền phạt đã ghi nhận" là số đã chốt khi trả sách, không tính lại theo ngày hiện tại.
    fine = Number(item.fine ?? 0);
  } else {
    late = lateDays(dueDate, today);
    status = late > 0 ? "overdue" : "borrowing";
    fine = late * finePerDay;
  }

  const statusLabel = status === "borrowing"
    ? "Đang mượn"
    : status === "overdue"
      ? `Quá hạn ${late} ngày`
      : status === "returned_late"
        ? `Đã trả trễ ${late} ngày`
        : "Đã trả đúng hạn";

  return {
    loanItemId: item.documentId,
    loanCode: loan.code ?? null,
    accessionNo: item.copy?.accessionNo ?? null,
    barcode: item.copy?.barcode ?? null,
    title: book?.title ?? "Không xác định",
    author: book?.author ?? "",
    publisher: book?.publisher ?? null,
    publishYear: book?.publishYear ?? null,
    categoryName: book?.category?.name ?? null,
    ddcMain: book?.ddcMain ?? null,
    callNumber: book?.callNumber ?? null,
    coverUrl: coverOf(book),
    loanedAt,
    loanedDate,
    dueDate,
    returnedAt,
    returnedDate,
    renewCount: Number(item.renewCount ?? 0),
    maxRenewals: Number(patron?.patronType?.maxRenewals ?? 0),
    renewDays: Number(patron?.patronType?.renewDays ?? 0),
    status,
    statusLabel,
    lateDays: late,
    daysLeft: isReturned ? null : daysBetween(today, dueDate),
    isReturned,
    fine,
    fineCollected: !!item.fineCollected,
    returnCondition: item.returnCondition ?? null,
    returnReceipt: receipt
      ? { code: receipt.code ?? null, returnedAt: receipt.returnedAt ?? null, note: receipt.note ?? null }
      : null,
  };
}

const historyCounts = (rows: any[]) => ({
  all: rows.length,
  borrowing: rows.filter((r) => r.status === "borrowing").length,
  overdue: rows.filter((r) => r.status === "overdue").length,
  returned_ontime: rows.filter((r) => r.status === "returned_ontime").length,
  returned_late: rows.filter((r) => r.status === "returned_late").length,
});

const historyStats = (rows: any[]) => {
  const returned = rows.filter((r) => r.isReturned);
  const onTime = returned.filter((r) => r.status === "returned_ontime").length;
  return {
    total: rows.length,
    borrowing: rows.filter((r) => r.status === "borrowing").length,
    overdue: rows.filter((r) => r.status === "overdue").length,
    returned: returned.length,
    returnedOnTime: onTime,
    returnedLate: returned.length - onTime,
    onTimeRate: returned.length ? Math.round((onTime / returned.length) * 1000) / 10 : null,
    totalFine: rows.reduce((sum, r) => sum + Number(r.fine || 0), 0),
    unpaidFine: rows.reduce((sum, r) => (r.fineCollected ? sum : sum + Number(r.fine || 0)), 0),
  };
};

export default factories.createCoreService("api::loan-item.loan-item", ({ strapi }) => ({
  // ═══════════ DANH SÁCH SÁCH ĐANG MƯỢN CỦA 1 ĐỘC GIẢ (quầy thủ thư) ═══════════
  async byPatron(barcode?: string) {
    if (!barcode) throw new ApplicationError("Cần truyền barcode");
    const [patron] = await docs(strapi, UID.patron).findMany({
      filters: { $or: [{ cardBarcode: { $eq: barcode } }, { studentCode: { $eq: barcode } }] },
      populate: { patronType: true },
      limit: 1,
    });
    if (!patron) throw new NotFoundError("Không tìm thấy độc giả");

    const settings = await getSettings(strapi);
    const finePerDay = settings.finePerDay;
    const today = todayStr();
    const items = await docs(strapi, UID.loanItem).findMany({
      filters: { status: { $in: ACTIVE }, loan: { patron: { documentId: { $eq: patron.documentId } } } },
      populate: { loan: true, copy: { populate: { book: true } } },
      sort: ["dueDate:asc"],
      limit: 100,
    });
    const card = cardState(patron, today);

    return {
      patron: { documentId: patron.documentId, fullName: patron.fullName, className: patron.className, cardStatus: patron.cardStatus },
      finePerDay,
      data: items.map((i: any) => {
        const late = lateDays(i.dueDate, today);
        const max = Number(patron.patronType?.maxRenewals ?? 0);
        const renewCount = Number(i.renewCount ?? 0);
        const price = Number(i.copy?.book?.price || 0);
        return {
          loanItemId: i.documentId,
          loanCode: i.loan?.code,
          accessionNo: i.copy?.accessionNo,
          barcode: i.copy?.barcode,
          title: i.copy?.book?.title,
          author: i.copy?.book?.author,
          loanedAt: i.loan?.loanedAt,
          dueDate: i.dueDate,
          renewCount,
          maxRenewals: max,
          canRenew: card.ok && late === 0 && renewCount < max,
          lateDays: late,
          fine: late * finePerDay,
          status: late > 0 ? "overdue" : "borrowing",
          bookPrice: price,
          compensation: compensationTable(price, settings),
        };
      }),
    };
  },

  // ═══════════ API CÁ NHÂN: SÁCH ĐANG MƯỢN ═══════════
  async currentForUser(user: any) {
    const settings = await getSettings(strapi);
    const patron = await findPatronByUser(strapi, user);
    if (!patron) {
      return {
        linked: false,
        patron: null,
        settings: settingsDto(settings),
        summary: emptySummary,
        data: [],
        generatedAt: todayStr(),
      };
    }

    const today = todayStr();
    const items = await docs(strapi, UID.loanItem).findMany({
      filters: {
        status: { $in: ACTIVE },
        loan: { patron: { documentId: { $eq: patron.documentId } } },
      },
      populate: {
        loan: true,
        copy: { populate: { book: { populate: { category: true, cover: true } } } },
      },
      limit: 500,
    });

    const data = items
      .map((i: any) => activeItemDto(i, patron, today, settings.finePerDay, settings.remindBeforeDays))
      .sort((a: any, b: any) => String(a.dueDate).localeCompare(String(b.dueDate)));

    const maxBooks = Number(patron.patronType?.maxBooks ?? 0);
    const summary = {
      borrowingCount: data.length,
      maxBooks,
      remaining: Math.max(0, maxBooks - data.length),
      dueSoonCount: data.filter((i: any) => i.dueSoon).length,
      overdueCount: data.filter((i: any) => i.lateDays > 0).length,
      fine: data.reduce((sum: number, i: any) => sum + i.fine, 0),
    };

    return {
      linked: true,
      patron: patronDto(patron),
      settings: settingsDto(settings),
      summary,
      data,
      generatedAt: today,
    };
  },

  // ═══════════ API CÁ NHÂN: LỊCH SỬ MƯỢN ═══════════
  async historyForUser(user: any, query: any = {}) {
    const settings = await getSettings(strapi);
    const patron = await findPatronByUser(strapi, user);
    if (!patron) {
      return {
        linked: false,
        patron: null,
        settings: settingsDto(settings),
        stats: historyStats([]),
        counts: historyCounts([]),
        data: [],
        meta: { page: 1, pageSize: 10, total: 0, pageCount: 1 },
        filters: { q: "", status: "all", from: "", to: "", page: 1, pageSize: 10 },
      };
    }

    const today = todayStr();
    const items = await docs(strapi, UID.loanItem).findMany({
      filters: { loan: { patron: { documentId: { $eq: patron.documentId } } } },
      populate: {
        loan: { populate: { patron: true } },
        copy: { populate: { book: { populate: { category: true, cover: true } } } },
        returnReceipt: true,
      },
      limit: 5000,
    });

    const rows = items
      .map((i: any) => historyItemDto(i, patron, today, settings.finePerDay))
      .sort((a: any, b: any) => {
        const at = a.loanedAt ? new Date(a.loanedAt).getTime() : 0;
        const bt = b.loanedAt ? new Date(b.loanedAt).getTime() : 0;
        if (bt !== at) return bt - at;
        return String(b.loanItemId).localeCompare(String(a.loanItemId));
      });

    const stats = historyStats(rows);
    const counts = historyCounts(rows);

    const q = String(query.q ?? "").trim();
    const rawStatus = String(query.status ?? "all");
    const status: HistoryStatus = (HISTORY_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as HistoryStatus)
      : "all";
    const from = DATE_RE.test(String(query.from ?? "")) ? String(query.from) : "";
    const to = DATE_RE.test(String(query.to ?? "")) ? String(query.to) : "";
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 10));
    const requestedPage = Math.max(1, Number.parseInt(query.page, 10) || 1);

    const needle = q.toLocaleLowerCase("vi");
    const filtered = rows.filter((r: any) => {
      if (status !== "all" && r.status !== status) return false;
      if (from && (!r.loanedDate || r.loanedDate < from)) return false;
      if (to && (!r.loanedDate || r.loanedDate > to)) return false;
      if (needle) {
        const haystack = [r.loanCode, r.title, r.author, r.accessionNo]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("vi");
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, pageCount);
    const data = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      linked: true,
      patron: patronDto(patron),
      settings: settingsDto(settings),
      stats,
      counts,
      data,
      meta: { page, pageSize, total, pageCount },
      filters: { q, status, from, to, page, pageSize },
    };
  },

  // ═══════════ GIA HẠN ═══════════
  // currentUser chỉ được truyền từ API cá nhân; khi đó bắt buộc kiểm tra quyền sở hữu.
  async renew(documentId: string, currentUser?: any) {
    return strapi.db.transaction(async ({ trx }) => {
      const candidate = await docs(strapi, UID.loanItem).findOne({
        documentId, populate: { loan: { populate: { patron: true } } },
      });
      if (!candidate) throw new NotFoundError("Không tìm thấy lượt mượn");
      if (!candidate.loan?.patron) throw new ApplicationError("Thiếu thông tin độc giả");
      await lockDocument(strapi, UID.patron, candidate.loan.patron.documentId, trx);
      await lockDocument(strapi, UID.loanItem, documentId, trx);

      const item = await docs(strapi, UID.loanItem).findOne({
        documentId,
        populate: { loan: { populate: { patron: { populate: { patronType: true } } } } },
      });
      if (!item) throw new NotFoundError("Không tìm thấy lượt mượn");

      const patron = item.loan?.patron;
      if (currentUser) {
        const owner = await findPatronByUser(strapi, currentUser);
        if (!owner) {
          throw new ApplicationError("Tài khoản chưa được liên kết hồ sơ độc giả. Vui lòng liên hệ thủ thư.");
        }
        if (!patron || patron.documentId !== owner.documentId) {
          throw new ForbiddenError("Bạn không có quyền gia hạn lượt mượn này");
        }
      }

      // Đọc lại trạng thái ngay trong transaction để tránh gia hạn một cuốn vừa được trả tại quầy.
      if (!ACTIVE.includes(item.status)) throw new ApplicationError("Sách này đã được trả");
      if (lateDays(item.dueDate) > 0) throw new ApplicationError("Sách đã quá hạn, không thể gia hạn");

      const type = patron?.patronType;
      if (!patron || !type) throw new ApplicationError("Thiếu thông tin độc giả");
      const card = cardState(patron, todayStr());
      if (!card.ok) throw new ApplicationError(card.reason!);

      const renewCount = Number(item.renewCount ?? 0);
      const maxRenewals = Number(type.maxRenewals ?? 0);
      if (renewCount >= maxRenewals) throw new ApplicationError(`Đã gia hạn tối đa ${maxRenewals} lần`);
      if (!Number.isInteger(Number(type.renewDays)) || Number(type.renewDays) <= 0)
        throw new ApplicationError("Nhóm độc giả chưa có số ngày gia hạn hợp lệ");

      const newDueDate = addDays(item.dueDate, Number(type.renewDays ?? 0));
      await docs(strapi, UID.loanItem).update({
        documentId,
        data: { dueDate: newDueDate, renewCount: renewCount + 1 },
      });

      // Nếu thao tác trả tại quầy đã chen vào trước khi ghi, hoàn nguyên toàn bộ transaction.
      const after = await docs(strapi, UID.loanItem).findOne({
        documentId,
        fields: ["status"],
      });
      if (after?.status === "returned") {
        throw new ApplicationError("Sách vừa được trả tại quầy, vui lòng tải lại danh sách");
      }

      return {
        newDueDate,
        renewCount: renewCount + 1,
        maxRenewals,
        renewDays: Number(type.renewDays ?? 0),
      };
    });
  },

  async bulkRenew(ids?: string[]) {
    if (!Array.isArray(ids) || !ids.length) throw new ApplicationError("Chưa chọn lượt mượn nào");
    const svc = strapi.service("api::loan-item.loan-item");
    const renewed: any[] = [];
    const failed: any[] = [];
    for (const id of ids) {
      try {
        renewed.push({ id, ...(await svc.renew(id)) });
      } catch (e: any) {
        failed.push({ id, reason: e.message });
      }
    }
    return { renewed, failed };
  },
}));
