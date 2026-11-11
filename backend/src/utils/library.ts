import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";

export const { ApplicationError, ForbiddenError, NotFoundError, UnauthorizedError } = errors;

export const UID = {
  shelf: "api::shelf.shelf",
  patronType: "api::patron-type.patron-type",
  book: "api::book.book",
  copy: "api::copy.copy",
  patron: "api::patron.patron",
  loan: "api::loan.loan",
  loanItem: "api::loan-item.loan-item",
  returnReceipt: "api::return-receipt.return-receipt",
  setting: "api::library-setting.library-setting",
} as const;

/** Trạng thái dòng sách còn đang ở phía độc giả */
export const ACTIVE = ["borrowing", "overdue"];

export const docs = (strapi: Core.Strapi, uid: string) => strapi.documents(uid as any) as any;

// ───── Ngày giờ theo múi giờ Việt Nam (dueDate là kiểu date: YYYY-MM-DD) ─────
const TZ = "Asia/Ho_Chi_Minh";
export const todayStr = (d = new Date()) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(d);
const utc = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export const addDays = (s: string, n: number) =>
  new Date(utc(s) + n * 86400000).toISOString().slice(0, 10);
export const lateDays = (due: string, today = todayStr()) =>
  Math.max(0, Math.round((utc(today) - utc(due)) / 86400000));
/** Số ngày từ mốc from đến mốc to (dương nếu to nằm sau from). */
export const daysBetween = (from: string, to: string) =>
  Math.round((utc(to) - utc(from)) / 86400000);
export const startOfTodayISO = () => `${todayStr()}T00:00:00+07:00`;

// ───── Cấu hình hệ thống ─────

export async function getSettings(strapi: Core.Strapi) {
  const s = await docs(strapi, UID.setting).findFirst();

  return {
    finePerDay: Number(s?.finePerDay ?? 1000),

    scratchedCompensationAmount: Number(
      s?.scratchedCompensationAmount ?? 20000
    ),

    damagedCompensationAmount: Number(
      s?.damagedCompensationAmount ?? 50000
    ),

    lostRate: Number(s?.lostCompensationRate ?? 100),

    autoLockAfterDays: Number(s?.autoLockAfterDays ?? 7),
    remindBeforeDays: Number(s?.remindBeforeDays ?? 3),
    overdueRemindEvery: s?.overdueRemindEvery ?? "daily",
  };
}


type Settings = Awaited<ReturnType<typeof getSettings>>;

/** Tiền bồi thường theo tình trạng sách khi trả (một nguồn duy nhất cho cả xem trước lẫn tính thật) */
export function compensationFor(condition: string, price: number, s: Settings): number {
  switch (condition) {
    case "scratched":
      return s.scratchedCompensationAmount;
    case "damaged":
      return s.damagedCompensationAmount;
    case "lost":
      return Math.round((price * s.lostRate) / 100);
    default:
      return 0;
  }
}

/** Bảng bồi thường cho cả 4 tình trạng, để giao diện hiển thị ngay khi thủ thư chọn */
export const compensationTable = (price: number, s: Settings) => ({
  normal: compensationFor("normal", price, s),
  scratched: compensationFor("scratched", price, s),
  damaged: compensationFor("damaged", price, s),
  lost: compensationFor("lost", price, s),
});

/** Sinh mã phiếu dạng PM-20261108-0001 */
export async function genCode(strapi: Core.Strapi, uid: string, letters: string) {
  const prefix = `${letters}-${todayStr().replace(/-/g, "")}-`;
  const n = await docs(strapi, uid).count({ filters: { code: { $startsWith: prefix } } });
  return `${prefix}${String(n + 1).padStart(4, "0")}`;
}

/** Tình trạng mượn của một độc giả (patron phải được populate patronType) */
export async function getPatronState(strapi: Core.Strapi, patron: any) {
  const { finePerDay } = await getSettings(strapi);
  const today = todayStr();
  const items = await docs(strapi, UID.loanItem).findMany({
    filters: {
      loan: { patron: { documentId: { $eq: patron.documentId } } },
      $or: [{ status: { $in: ACTIVE } }, { fine: { $gt: 0 }, fineCollected: false }],
    },
    limit: 500,
  });
  const active = items.filter((i: any) => ACTIVE.includes(i.status));
  const overdueCount = active.filter((i: any) => lateDays(i.dueDate, today) > 0).length;
  const unpaidFine = items.reduce((sum: number, i: any) => {
    if (ACTIVE.includes(i.status)) return sum + lateDays(i.dueDate, today) * finePerDay;
    return sum + Number(i.fine || 0);
  }, 0);

  const max = patron.patronType?.maxBooks ?? 0;
  let blockReason: string | null = null;
  if (patron.cardStatus === "locked") blockReason = "Thẻ đang bị khóa";
  else if (patron.cardStatus === "expired" || (patron.cardExpiresAt && patron.cardExpiresAt < today))
    blockReason = "Thẻ đã hết hạn";
  else if (overdueCount > 0) blockReason = `Đang có ${overdueCount} sách quá hạn chưa trả`;
  else if (active.length >= max) blockReason = `Đã mượn tối đa ${max} cuốn`;

  return {
    borrowingCount: active.length,
    overdueCount,
    unpaidFine,
    remaining: Math.max(0, max - active.length),
    canBorrow: !blockReason,
    blockReason,
  };
}

export const patronDto = (p: any, st: any) => ({
  documentId: p.documentId,
  fullName: p.fullName,
  studentCode: p.studentCode,
  className: p.className,
  cardBarcode: p.cardBarcode,
  cardStatus: p.cardStatus,
  cardExpiresAt: p.cardExpiresAt,
  patronType: p.patronType && {
    name: p.patronType.name,
    maxBooks: p.patronType.maxBooks,
    loanDays: p.patronType.loanDays,
    maxRenewals: p.patronType.maxRenewals,
    renewDays: p.patronType.renewDays,
  },
  ...st,
});
