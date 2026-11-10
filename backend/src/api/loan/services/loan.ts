import { factories } from "@strapi/strapi";
import {
  ACTIVE,
  ApplicationError,
  NotFoundError,
  UID,
  addDays,
  docs,
  genCode,
  getPatronState,
  getSettings,
  lateDays,
  startOfTodayISO,
  todayStr,
} from "../../../utils/library";
import { copyBlockReason } from "../../copy/services/copy";

export default factories.createCoreService("api::loan.loan", ({ strapi }) => ({
  // ═══════════ MƯỢN SÁCH ═══════════
  async checkout({
    patronBarcode,
    copyBarcodes,
    sendEmailReceipt,
    librarianId,
  }: any) {
    if (!patronBarcode) throw new ApplicationError("Thiếu mã thẻ độc giả");
    if (!Array.isArray(copyBarcodes) || !copyBarcodes.length)
      throw new ApplicationError("Giỏ sách đang trống");
    const barcodes: string[] = [
      ...new Set(copyBarcodes.map(String)),
    ] as string[];

    // 1. Độc giả
    const [patron] = await docs(strapi, UID.patron).findMany({
      filters: {
        $or: [
          { cardBarcode: { $eq: patronBarcode } },
          { studentCode: { $eq: patronBarcode } },
        ],
      },
      populate: { patronType: true },
      limit: 1,
    });
    if (!patron) throw new NotFoundError("Không tìm thấy độc giả");
    const st = await getPatronState(strapi, patron);
    if (!st.canBorrow) throw new ApplicationError(st.blockReason!);
    if (barcodes.length > st.remaining)
      throw new ApplicationError(
        `Chỉ được mượn thêm ${st.remaining} cuốn (tối đa ${patron.patronType.maxBooks})`,
      );

    // 2. Kiểm tra từng bản sao trước khi ghi bất cứ thứ gì
    const copies: any[] = [];
    for (const code of barcodes) {
      const [c] = await docs(strapi, UID.copy).findMany({
        filters: {
          $or: [{ barcode: { $eq: code } }, { accessionNo: { $eq: code } }],
        },
        populate: { book: true },
        limit: 1,
      });
      if (!c) throw new NotFoundError(`Không tìm thấy bản sao ${code}`);
      const reason = copyBlockReason(c);
      if (reason) throw new ApplicationError(`${c.accessionNo}: ${reason}`);
      copies.push(c);
    }

    // 3. Ghi dữ liệu trong một transaction
    const dueDate = addDays(todayStr(), patron.patronType.loanDays);
    const lib = librarianId ? { librarian: librarianId } : {};
    const code = await genCode(strapi, UID.loan, "PM");

    const loan = await strapi.db.transaction(async () => {
      const created = await docs(strapi, UID.loan).create({
        data: {
          code,
          loanedAt: new Date().toISOString(),
          status: "borrowing",
          patron: patron.documentId,
          ...lib,
        },
      });
      for (const c of copies) {
        await docs(strapi, UID.loanItem).create({
          data: {
            dueDate,
            renewCount: 0,
            lateDays: 0,
            fine: 0,
            fineCollected: false,
            status: "borrowing",
            loan: created.documentId,
            copy: c.documentId,
          },
        });
        await docs(strapi, UID.copy).update({
          documentId: c.documentId,
          data: { circulationStatus: "borrowed" },
        });
      }
      return created;
    });

    const items = copies.map((c) => ({
      accessionNo: c.accessionNo,
      title: c.book?.title,
      dueDate,
    }));

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
      loan: { code: loan.code, loanedAt: loan.loanedAt },
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
      loan: { populate: { patron: true } },
      copy: { populate: { book: true } },
    };
    let item: any;
    if (loanItemId) {
      item = await docs(strapi, UID.loanItem).findOne({
        documentId: loanItemId,
        populate,
      });
    } else if (copyBarcode) {
      [item] = await docs(strapi, UID.loanItem).findMany({
        filters: {
          status: { $in: ACTIVE },
          copy: {
            $or: [
              { barcode: { $eq: copyBarcode } },
              { accessionNo: { $eq: copyBarcode } },
            ],
          },
        },
        populate,
        limit: 1,
      });
    } else throw new ApplicationError("Cần truyền loanItemId hoặc copyBarcode");

    if (!item)
      throw new NotFoundError("Không tìm thấy lượt mượn đang hoạt động");
    if (item.status === "returned")
      throw new ApplicationError("Sách này đã được trả");

    // Tính phạt
    const s = await getSettings(strapi);
    const late = lateDays(item.dueDate);
    const lateFine = late * s.finePerDay;
    const price = Number(item.copy?.book?.price || 0);
    const rate =
      returnCondition === "damaged"
        ? s.damageRate
        : returnCondition === "lost"
          ? s.lostRate
          : 0;
    const compensation = Math.round((price * rate) / 100);
    const total = lateFine + compensation;

    const now = new Date().toISOString();
    const lib = librarianId ? { librarian: librarianId } : {};
    const copyStatus =
      returnCondition === "lost"
        ? "lost"
        : returnCondition === "damaged"
          ? "processing"
          : "available";
    const copyCondition =
      returnCondition === "damaged"
        ? "damaged"
        : returnCondition === "scratched"
          ? "worn"
          : undefined;
    const receiptCode = await genCode(strapi, UID.returnReceipt, "PT");

    const receipt = await strapi.db.transaction(async () => {
      await docs(strapi, UID.loanItem).update({
        documentId: item.documentId,
        data: {
          returnedAt: now,
          returnCondition,
          lateDays: late,
          fine: total,
          fineCollected: !!fineCollected,
          status: "returned",
        },
      });
      await docs(strapi, UID.copy).update({
        documentId: item.copy.documentId,
        data: {
          circulationStatus: copyStatus,
          ...(copyCondition ? { condition: copyCondition } : {}),
        },
      });
      const r = await docs(strapi, UID.returnReceipt).create({
        data: {
          code: receiptCode,
          returnedAt: now,
          note: [
            late ? `Trả muộn ${late} ngày` : "",
            compensation ? `Bồi thường ${compensation}` : "",
          ]
            .filter(Boolean)
            .join("; "),
          loanItem: item.documentId,
          ...lib,
        },
      });

      // Cập nhật trạng thái phiếu mượn cha
      const left = await docs(strapi, UID.loanItem).findMany({
        filters: {
          loan: { documentId: { $eq: item.loan.documentId } },
          status: { $ne: "returned" },
        },
        limit: 100,
      });
      const loanStatus = !left.length
        ? "returned"
        : left.some((i: any) => lateDays(i.dueDate) > 0)
          ? "overdue"
          : "borrowing";
      await docs(strapi, UID.loan).update({
        documentId: item.loan.documentId,
        data: { status: loanStatus },
      });
      return r;
    });

    return {
      returnReceipt: { code: receipt.code, returnedAt: receipt.returnedAt },
      lateDays: late,
      fine: lateFine,
      compensation,
      totalToCollect: total,
      fineCollected: !!fineCollected,
    };
  },

  // ═══════════ LỊCH SỬ MƯỢN TRONG CA ═══════════
  async shiftHistory({ from, to, librarianId }: any) {
    const filters: any = {
      loanedAt: {
        $gte: from || startOfTodayISO(),
        $lte: to || new Date().toISOString(),
      },
    };
    if (librarianId) filters.librarian = { documentId: { $eq: librarianId } };
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
