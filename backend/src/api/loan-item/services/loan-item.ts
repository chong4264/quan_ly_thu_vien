import { factories } from "@strapi/strapi";
import {
  ACTIVE, ApplicationError, compensationTable, NotFoundError, UID, addDays, docs, getSettings, lateDays, todayStr,
} from "../../../utils/library";

export default factories.createCoreService("api::loan-item.loan-item", ({ strapi }) => ({
  // ═══════════ DANH SÁCH SÁCH ĐANG MƯỢN CỦA 1 ĐỘC GIẢ ═══════════
  async byPatron(barcode?: string) {
    if (!barcode) throw new ApplicationError("Cần truyền barcode");
    const [patron] = await docs(strapi, UID.patron).findMany({
      filters: { $or: [{ cardBarcode: { $eq: barcode } }, { studentCode: { $eq: barcode } }] },
      populate: { patronType: true },
      limit: 1,
    });
    if (!patron) throw new NotFoundError("Không tìm thấy độc giả");

    const s = await getSettings(strapi);
    const finePerDay = s.finePerDay;
    const today = todayStr();
    const items = await docs(strapi, UID.loanItem).findMany({
      filters: { status: { $in: ACTIVE }, loan: { patron: { documentId: { $eq: patron.documentId } } } },
      populate: { loan: true, copy: { populate: { book: true } } },
      sort: ["dueDate:asc"],
      limit: 100,
    });
    const max = patron.patronType?.maxRenewals ?? 0;
    const cardOk = !["locked", "expired"].includes(patron.cardStatus);

    return {
      patron: { documentId: patron.documentId, fullName: patron.fullName, className: patron.className, cardStatus: patron.cardStatus },
      finePerDay,
      data: items.map((i: any) => {
        const late = lateDays(i.dueDate, today);
        const price = Number(i.copy?.book?.price || 0);
        return {
          loanItemId: i.documentId,
          loanCode: i.loan?.code,
          accessionNo: i.copy?.accessionNo,
          barcode: i.copy?.barcode,
          title: i.copy?.book?.title,
          loanedAt: i.loan?.loanedAt,
          dueDate: i.dueDate,
          renewCount: i.renewCount,
          maxRenewals: max,
          canRenew: cardOk && late === 0 && i.renewCount < max,
          lateDays: late,
          fine: late * finePerDay,
          bookPrice: price,
          compensation: compensationTable(price, s),
        };
      }),
    };
  },

  // ═══════════ GIA HẠN ═══════════
  async renew(documentId: string) {
    const item = await docs(strapi, UID.loanItem).findOne({
      documentId,
      populate: { loan: { populate: { patron: { populate: { patronType: true } } } } },
    });
    if (!item) throw new NotFoundError("Không tìm thấy lượt mượn");
    if (!ACTIVE.includes(item.status)) throw new ApplicationError("Sách này đã được trả");
    if (lateDays(item.dueDate) > 0) throw new ApplicationError("Sách đã quá hạn, không thể gia hạn");

    const patron = item.loan?.patron;
    const type = patron?.patronType;
    if (!patron || !type) throw new ApplicationError("Thiếu thông tin độc giả");
    if (["locked", "expired"].includes(patron.cardStatus)) throw new ApplicationError("Thẻ không còn hiệu lực");
    if (item.renewCount >= type.maxRenewals)
      throw new ApplicationError(`Đã gia hạn tối đa ${type.maxRenewals} lần`);

    const newDueDate = addDays(item.dueDate, type.renewDays);
    await docs(strapi, UID.loanItem).update({
      documentId,
      data: { dueDate: newDueDate, renewCount: item.renewCount + 1 },
    });
    return { newDueDate, renewCount: item.renewCount + 1, maxRenewals: type.maxRenewals };
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
