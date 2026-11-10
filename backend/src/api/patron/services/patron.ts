import { factories } from "@strapi/strapi";
import { ApplicationError, NotFoundError, UID, docs, getPatronState, patronDto } from "../../../utils/library";

export default factories.createCoreService("api::patron.patron", ({ strapi }) => ({
  /** Quét thẻ (barcode) hoặc tìm theo họ tên / mã học sinh (q) */
  async lookup({ barcode, q }: { barcode?: string; q?: string }) {
    let filters: any;
    if (barcode) {
      filters = { $or: [{ cardBarcode: { $eq: barcode } }, { studentCode: { $eq: barcode } }] };
    } else if (q && q.trim()) {
      filters = { $or: [{ fullName: { $containsi: q.trim() } }, { studentCode: { $containsi: q.trim() } }] };
    } else {
      throw new ApplicationError("Cần truyền barcode hoặc q");
    }
    const list = await docs(strapi, UID.patron).findMany({
      filters,
      populate: { patronType: true },
      limit: barcode ? 1 : 10,
    });
    if (!list.length) throw new NotFoundError("Không tìm thấy độc giả");

    const data = [];
    for (const p of list) data.push(patronDto(p, await getPatronState(strapi, p)));
    return { data };
  },
}));
