import { factories } from "@strapi/strapi";
import { ApplicationError, NotFoundError, UID, docs, getPatronState } from "../../../utils/library";
import { findUserPatron } from "../../../utils/user-profile";
import { lockDocument } from "../../../utils/circulation-locks";
import { copyBlockReason } from "../../copy/services/copy";

const REQUEST = "api::loan-request.loan-request";
const STATUSES = ["pending", "fulfilled", "rejected", "cancelled"];
const populate = { book: { fields: ["title", "author", "isbn"] }, patron: true, loan: true, processedBy: { fields: ["username"] } };
const note = (value: unknown, required = false) => {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string" || value.trim().length > 500)
    throw new ApplicationError("Ghi chú phải là văn bản tối đa 500 ký tự");
  if (required && !value.trim()) throw new ApplicationError("Vui lòng nhập lý do từ chối");
  return value.trim();
};
const dto = (r: any, staff = false) => ({
  documentId: r.documentId, status: r.status, createdAt: r.createdAt,
  note: r.note || "", responseNote: r.responseNote || "", processedAt: r.processedAt,
  book: r.book && { documentId: r.book.documentId, title: r.book.title, author: r.book.author, isbn: r.book.isbn },
  loan: r.loan && { documentId: r.loan.documentId, code: r.loan.code },
  ...(staff ? { patron: r.patron && { documentId: r.patron.documentId, fullName: r.patron.fullName, studentCode: r.patron.studentCode, cardBarcode: r.patron.cardBarcode, phone: r.patron.phone }, processedBy: r.processedBy?.username || null } : {})
});
const pagination = (query: any) => {
  const positive = (v: unknown, fallback: number, max: number) => {
    const n = Number(v); return Number.isSafeInteger(n) && n > 0 ? Math.min(n, max) : fallback;
  };
  return { page: positive(query.page, 1, 100000), pageSize: positive(query.pageSize, 10, 100) };
};
const statusFilter = (value: unknown) => {
  if (!value) return {};
  if (typeof value !== "string" || !STATUSES.includes(value)) throw new ApplicationError("Trạng thái yêu cầu không hợp lệ");
  return { status: { $eq: value } };
};

export default factories.createCoreService(REQUEST as any, ({ strapi }) => {
  const records = () => docs(strapi, REQUEST);
  const get = async (id: string) => {
    const r = await records().findOne({ documentId: id, populate });
    if (!r) throw new NotFoundError("Không tìm thấy yêu cầu mượn");
    return r;
  };
  const linked = async (user: any) => {
    const p = await findUserPatron(strapi, user);
    if (!p) throw new ApplicationError("Tài khoản chưa được liên kết hồ sơ độc giả. Vui lòng liên hệ thủ thư cấp thẻ.");
    return p;
  };
  const pending = (r: any) => {
    if (r.status !== "pending") throw new ApplicationError("Yêu cầu đã được xử lý, hãy tải lại danh sách");
  };
  const list = async (filters: any, query: any, staff: boolean) => {
    const { page, pageSize } = pagination(query);
    return strapi.db.transaction(async () => {
      const total = await records().count({ filters });
      const rows = await records().findMany({ filters, populate, sort: ["createdAt:desc", "id:desc"], start: (page - 1) * pageSize, limit: pageSize });
      return { data: rows.map((r: any) => dto(r, staff)), meta: { pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } } };
    });
  };
  return {
    async mine(user: any, query: any = {}) {
      const patron = await findUserPatron(strapi, user);
      if (!patron) return { linked: false, data: [], meta: { pagination: { ...pagination(query), total: 0, pageCount: 0 } } };
      return { linked: true, ...(await list({ patron: { documentId: { $eq: patron.documentId } }, ...statusFilter(query.status) }, query, false)) };
    },
    async createMine(user: any, body: any) {
      if (typeof body.bookId !== "string" || !body.bookId.trim()) throw new ApplicationError("Vui lòng chọn đầu sách");
      const requestNote = note(body.note);
      const initial = await linked(user);
      return strapi.db.transaction(async ({ trx }) => {
        await lockDocument(strapi, UID.patron, initial.documentId, trx);
        // Re-read under the patron lock to serialize duplicate submissions and quota checks.
        const patron = await linked(user);
        if (patron.documentId !== initial.documentId) throw new ApplicationError("Hồ sơ độc giả đã thay đổi. Vui lòng thử lại.");
        const state = await getPatronState(strapi, patron);
        if (!state.canBorrow) throw new ApplicationError(state.blockReason || "Thẻ chưa đủ điều kiện mượn");
        const book = await docs(strapi, UID.book).findOne({ documentId: body.bookId.trim() });
        if (!book) throw new NotFoundError("Không tìm thấy đầu sách");
        if (!["active", "low_stock"].includes(book.status) || book.referenceOnly || !book.allowHomeLoan)
          throw new ApplicationError("Đầu sách này không cho đăng ký mượn về nhà");
        const existing = await records().count({ filters: { patron: { documentId: { $eq: patron.documentId } }, book: { documentId: { $eq: book.documentId } }, status: "pending" } });
        if (existing) throw new ApplicationError("Bạn đã có yêu cầu đang chờ cho đầu sách này");
        const waiting = await records().count({ filters: { patron: { documentId: { $eq: patron.documentId } }, status: "pending" } });
        if (waiting >= state.remaining) throw new ApplicationError("Số sách đang mượn và yêu cầu đang chờ đã đạt hạn mức. Hãy hủy yêu cầu cũ hoặc trả sách.");
        const available = await docs(strapi, UID.copy).count({ filters: { book: { documentId: { $eq: book.documentId } }, circulationStatus: "available", condition: { $ne: "damaged" } } });
        if (!available) throw new ApplicationError("Hiện chưa có bản sao sẵn sàng để đăng ký mượn");
        const created = await records().create({ data: { status: "pending", patron: patron.documentId, book: book.documentId, note: requestNote }, populate });
        return { data: dto(created) };
      });
    },
    async cancelMine(user: any, id: string) {
      const patron = await linked(user);
      return strapi.db.transaction(async ({ trx }) => {
        await lockDocument(strapi, REQUEST, id, trx);
        const request = await get(id);
        if (request.patron?.documentId !== patron.documentId) throw new NotFoundError("Không tìm thấy yêu cầu mượn");
        pending(request);
        const row = await records().update({ documentId: id, data: { status: "cancelled", processedAt: new Date().toISOString() }, populate });
        return { data: dto(row) };
      });
    },
    async adminList(query: any = {}) {
      const filters: any = statusFilter(query.status);
      const q = String(query.q || "").trim().slice(0, 150);
      if (q) filters.$or = [ { book: { title: { $containsi: q } } }, { patron: { fullName: { $containsi: q } } }, { patron: { studentCode: { $containsi: q } } } ];
      return list(filters, query, true);
    },
    async fulfill(id: string, body: any, user: any) {
      if (typeof body.copyBarcode !== "string" || !body.copyBarcode.trim()) throw new ApplicationError("Vui lòng quét hoặc nhập mã bản sao giao cho độc giả");
      const responseNote = note(body.responseNote);
      return strapi.db.transaction(async ({ trx }) => {
        await lockDocument(strapi, REQUEST, id, trx);
        const request = await get(id);
        pending(request);
        if (!request.patron || !request.book) throw new ApplicationError("Hồ sơ độc giả hoặc đầu sách không còn tồn tại");
        // Match the requested title before handing checkout the copy barcode. Checkout owns all circulation locks and checks.
        const [copy] = await docs(strapi, UID.copy).findMany({ filters: { $or: [{ barcode: body.copyBarcode.trim() }, { accessionNo: body.copyBarcode.trim() }] }, populate: { book: true }, limit: 1 });
        if (!copy || copy.book?.documentId !== request.book.documentId) throw new ApplicationError("Bản sao không thuộc đầu sách trong yêu cầu");
        const reason = copyBlockReason(copy);
        if (reason) throw new ApplicationError(reason);
        const result = await (strapi.service(UID.loan) as any).checkout({ patronBarcode: request.patron.cardBarcode || request.patron.studentCode, copyBarcodes: [copy.barcode], expectedBookId: request.book.documentId, sendEmailReceipt: false, librarianId: user.id });
        const row = await records().update({ documentId: id, data: { status: "fulfilled", processedAt: new Date().toISOString(), processedBy: user.id, responseNote, loan: result.loan.documentId }, populate });
        return { data: dto(row, true), receipt: result };
      });
    },
    async reject(id: string, body: any, user: any) {
      const responseNote = note(body.responseNote, true);
      return strapi.db.transaction(async ({ trx }) => {
        await lockDocument(strapi, REQUEST, id, trx);
        const request = await get(id); pending(request);
        const row = await records().update({ documentId: id, data: { status: "rejected", processedAt: new Date().toISOString(), processedBy: user.id, responseNote }, populate });
        return { data: dto(row, true) };
      });
    }
  };
});
