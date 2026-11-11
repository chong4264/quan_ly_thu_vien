import { factories } from "@strapi/strapi";
import {
  ACTIVE,
  compensationFor,
  ApplicationError,
  NotFoundError,
  UID,
  addDays,
  docs,
  getPatronState,
  getSettings,
  lateDays,
  startOfTodayISO,
  todayStr,
} from "../../../utils/library";
import { copyBlockReason } from "../../copy/services/copy";
import { circulationCode, lockDocument } from "../../../utils/circulation-locks";

export default factories.createCoreService("api::loan.loan", ({ strapi }) => ({
  // ═══════════ MƯỢN SÁCH ═══════════
  async checkout({
    patronBarcode,
    copyBarcodes,
    sendEmailReceipt,
    librarianId,
    expectedBookId,
  }: any) {
    if (typeof patronBarcode !== "string" || !patronBarcode.trim())
      throw new ApplicationError("Thiếu mã thẻ độc giả");
    if (!Array.isArray(copyBarcodes) || !copyBarcodes.length || copyBarcodes.length > 100 ||
        copyBarcodes.some((value: unknown) => typeof value !== "string" || !value.trim()))
      throw new ApplicationError("Cần chọn từ 1 đến 100 mã bản sao hợp lệ");
    const barcodes = [...new Set(copyBarcodes.map((value: string) => value.trim()))] as string[];

    const { loan, patron, items } = await strapi.db.transaction(async ({ trx }) => {
      const [candidate] = await docs(strapi, UID.patron).findMany({
        filters: { $or: [
          { cardBarcode: { $eq: patronBarcode.trim() } },
          { studentCode: { $eq: patronBarcode.trim() } },
        ] }, limit: 1,
      });
      if (!candidate) throw new NotFoundError("Không tìm thấy độc giả");
      await lockDocument(strapi, UID.patron, candidate.documentId, trx);
      const patron = await docs(strapi, UID.patron).findOne({
        documentId: candidate.documentId, populate: { patronType: true },
      });
      if (!patron) throw new NotFoundError("Không tìm thấy độc giả");
      const state = await getPatronState(strapi, patron);
      if (!state.canBorrow) throw new ApplicationError(state.blockReason!);
      if (!Number.isInteger(patron.patronType?.loanDays) || patron.patronType.loanDays <= 0)
        throw new ApplicationError("Nhóm độc giả chưa có thời hạn mượn hợp lệ");

      const candidates: any[] = [];
      for (const code of barcodes) {
        const [copy] = await docs(strapi, UID.copy).findMany({
          filters: { $or: [{ barcode: { $eq: code } }, { accessionNo: { $eq: code } }] }, limit: 1,
        });
        if (!copy) throw new NotFoundError(`Không tìm thấy bản sao ${code}`);
        candidates.push(copy);
      }
      // Barcode and accession number may name the same physical copy.
      const unique = [...new Map(candidates.map((copy) => [copy.documentId, copy])).values()];
      if (unique.length !== candidates.length)
        throw new ApplicationError("Một bản sao đang được chọn nhiều lần bằng các mã khác nhau");
      if (unique.length > state.remaining)
        throw new ApplicationError(`Chỉ được mượn thêm ${state.remaining} cuốn`);
      const copies: any[] = [];
      for (const candidate of unique.sort((a, b) => a.id - b.id)) {
        await lockDocument(strapi, UID.copy, candidate.documentId, trx);
        const copy = await docs(strapi, UID.copy).findOne({
          documentId: candidate.documentId, populate: { book: true },
        });
        if (!copy) throw new NotFoundError("Bản sao vừa bị xóa, vui lòng tải lại");
        const reason = copyBlockReason(copy);
        if (reason) throw new ApplicationError(`${copy.accessionNo}: ${reason}`);
        if (expectedBookId && copy.book.documentId !== expectedBookId)
          throw new ApplicationError("Bản sao không thuộc đầu sách được yêu cầu");
        const active = await docs(strapi, UID.loanItem).count({ filters: {
          copy: { documentId: { $eq: copy.documentId } }, status: { $in: ACTIVE },
        } });
        if (active) throw new ApplicationError(`${copy.accessionNo}: Bản sao đang được mượn`);
        copies.push(copy);
      }
      const dueDate = addDays(todayStr(), patron.patronType.loanDays);
      const code = await circulationCode(strapi, UID.loan, "PM", trx);
      const loan = await docs(strapi, UID.loan).create({ data: {
        code, loanedAt: new Date().toISOString(), status: "borrowing",
        patron: patron.documentId, ...(librarianId ? { librarian: librarianId } : {}),
      } });
      for (const copy of copies) {
        await docs(strapi, UID.loanItem).create({ data: {
          dueDate, renewCount: 0, lateDays: 0, fine: 0, fineCollected: false,
          status: "borrowing", loan: loan.documentId, copy: copy.documentId,
        } });
        await docs(strapi, UID.copy).update({
          documentId: copy.documentId, data: { circulationStatus: "borrowed" },
        });
      }
      return { loan, patron, items: copies.map((copy) => ({
        accessionNo: copy.accessionNo, title: copy.book?.title, dueDate,
      })) };
    });

    // 4. Gửi biên nhận (lỗi email không làm hỏng phiếu mượn)
    if (sendEmailReceipt && patron.email) {
      try {
        await (strapi.plugin("email").service("email") as any).send({
          to: patron.email,
          subject: `Biên nhận mượn sách ${loan.code}`,
          text: `Chào ${patron.fullName},\nBạn đã mượn:\n${items.map((i) => `- ${i.title} (${i.accessionNo}), hạn trả ${i.dueDate}`).join("\n")}`,
        });
      } catch (e: any) {
        strapi.log.warn(`Không gửi được biên nhận: ${e.message}`);
      }
    }

    return {
      loan: { documentId: loan.documentId, code: loan.code, loanedAt: loan.loanedAt },
      patron: { fullName: patron.fullName },
      items,
    };
  },

  // ═══════════ TRẢ SÁCH ═══════════
  async returnBook({
    loanItemId,
    copyBarcode,
    returnCondition,
    fineCollected,
    librarianId,
  }: any) {
    if (!["normal", "scratched", "damaged", "lost"].includes(returnCondition))
      throw new ApplicationError("Tình trạng khi trả không hợp lệ");

    const populate = {
      loan: { populate: { patron: true } }, copy: { populate: { book: true } },
    };
    return strapi.db.transaction(async ({ trx }) => {
      let candidate: any;
      if (loanItemId) {
        candidate = await docs(strapi, UID.loanItem).findOne({ documentId: String(loanItemId), populate });
      } else if (typeof copyBarcode === "string" && copyBarcode.trim()) {
        [candidate] = await docs(strapi, UID.loanItem).findMany({
          filters: { status: { $in: ACTIVE }, copy: { $or: [
            { barcode: { $eq: copyBarcode.trim() } }, { accessionNo: { $eq: copyBarcode.trim() } },
          ] } }, populate, limit: 1,
        });
      } else throw new ApplicationError("Cần truyền loanItemId hoặc copyBarcode");
      if (!candidate) throw new NotFoundError("Không tìm thấy lượt mượn đang hoạt động");
      if (!candidate.loan?.patron || !candidate.copy)
        throw new ApplicationError("Lượt mượn thiếu thông tin độc giả hoặc bản sao");
      await lockDocument(strapi, UID.patron, candidate.loan.patron.documentId, trx);
      await lockDocument(strapi, UID.loan, candidate.loan.documentId, trx);
      await lockDocument(strapi, UID.loanItem, candidate.documentId, trx);
      await lockDocument(strapi, UID.copy, candidate.copy.documentId, trx);
      const item = await docs(strapi, UID.loanItem).findOne({ documentId: candidate.documentId, populate });
      if (!item || !ACTIVE.includes(item.status) || item.returnedAt)
        throw new ApplicationError("Sách này đã được trả");

      const settings = await getSettings(strapi);
      const late = lateDays(item.dueDate);
      const lateFine = late * settings.finePerDay;
      const compensation = compensationFor(returnCondition, Number(item.copy?.book?.price || 0), settings);
      const total = lateFine + compensation;
      const now = new Date().toISOString();
      const copyStatus = returnCondition === "lost" ? "lost" : returnCondition === "damaged" ? "processing" : "available";
      const copyCondition = returnCondition === "damaged" ? "damaged" : returnCondition === "scratched" ? "worn" : undefined;
      const receiptCode = await circulationCode(strapi, UID.returnReceipt, "PT", trx);
      await docs(strapi, UID.loanItem).update({ documentId: item.documentId, data: {
        returnedAt: now, returnCondition, lateDays: late, fine: total,
        fineCollected: !!fineCollected, status: "returned",
      } });
      await docs(strapi, UID.copy).update({ documentId: item.copy.documentId, data: {
        circulationStatus: copyStatus, ...(copyCondition ? { condition: copyCondition } : {}),
      } });
      const receipt = await docs(strapi, UID.returnReceipt).create({ data: {
        code: receiptCode, returnedAt: now,
        note: [late ? `Trả muộn ${late} ngày` : "", compensation ? `Bồi thường ${compensation}` : ""].filter(Boolean).join("; "),
        loanItem: item.documentId, ...(librarianId ? { librarian: librarianId } : {}),
      } });
      const left = await docs(strapi, UID.loanItem).findMany({ filters: {
        loan: { documentId: { $eq: item.loan.documentId } }, status: { $in: ACTIVE },
      }, limit: 1000 });
      await docs(strapi, UID.loan).update({ documentId: item.loan.documentId, data: {
        status: !left.length ? "returned" : left.some((entry: any) => lateDays(entry.dueDate) > 0) ? "overdue" : "borrowing",
      } });
      return {
        returnReceipt: { code: receipt.code, returnedAt: receipt.returnedAt },
        lateDays: late, fine: lateFine, compensation, totalToCollect: total, fineCollected: !!fineCollected,
      };
    });
  },

  // ═══════════ LỊCH SỬ MƯỢN TRONG CA ═══════════
  async shiftHistory({ from, to, librarianId }: any) {
    const filters: any = {
      loanedAt: {
        $gte: from || startOfTodayISO(),
        $lte: to || new Date().toISOString(),
      },
    };
    if (librarianId) filters.librarian = { id: { $eq: librarianId } };
    const loans = await docs(strapi, UID.loan).findMany({
      filters,
      sort: ["loanedAt:desc"],
      populate: {
        patron: true,
        loanItems: { populate: { copy: { populate: { book: true } } } },
      },
      limit: 200,
    });
    return {
      data: loans.map((l: any) => ({
        code: l.code,
        loanedAt: l.loanedAt,
        patron: l.patron && {
          fullName: l.patron.fullName,
          className: l.patron.className,
        },
        itemCount: l.loanItems?.length ?? 0,
        titles: (l.loanItems ?? []).map((i: any) => i.copy?.book?.title),
        dueDate: l.loanItems?.[0]?.dueDate ?? null,
      })),
    };
  },
}));
