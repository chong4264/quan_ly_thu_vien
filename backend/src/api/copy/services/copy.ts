import { factories } from "@strapi/strapi";
import { ApplicationError, NotFoundError, UID, docs } from "../../../utils/library";

export const copyBlockReason = (c: any): string | null => {
  if (c.circulationStatus === "borrowed") return "Bản sao đang được mượn";
  if (c.circulationStatus === "processing") return "Bản sao đang xử lý, chưa cho mượn";
  if (c.circulationStatus === "lost") return "Bản sao đã bị mất";
  if (c.condition === "damaged") return "Bản sao đang hư hỏng";
  if (c.book?.referenceOnly) return "Sách chỉ đọc tại chỗ";
  if (c.book?.allowHomeLoan === false) return "Sách không cho mượn về nhà";
  return null;
};

export default factories.createCoreService("api::copy.copy", ({ strapi }) => ({
  /** Quét mã vạch (barcode) hoặc mã ĐKCB của bản sao */
  async lookup(barcode?: string) {
    if (!barcode) throw new ApplicationError("Cần truyền barcode");
    const [c] = await docs(strapi, UID.copy).findMany({
      filters: { $or: [{ barcode: { $eq: barcode } }, { accessionNo: { $eq: barcode } }] },
      populate: { book: true, shelf: true },
      limit: 1,
    });
    if (!c) throw new NotFoundError("Không tìm thấy bản sao với mã này");
    const blockReason = copyBlockReason(c);
    return {
      documentId: c.documentId,
      accessionNo: c.accessionNo,
      barcode: c.barcode,
      book: c.book && { title: c.book.title, author: c.book.author, isbn: c.book.isbn },
      shelf: c.shelf && { code: c.shelf.code },
      circulationStatus: c.circulationStatus,
      condition: c.condition,
      canBorrow: !blockReason,
      blockReason,
    };
  },
}));
