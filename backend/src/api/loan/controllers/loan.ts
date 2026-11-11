import { factories } from "@strapi/strapi";
import { todayStr } from "../../../utils/library";

export default factories.createCoreController("api::loan.loan", ({ strapi }) => ({
  // ==========================================
  // 1. CÁC API CÓ SẴN CỦA BẠN
  // ==========================================
  async checkout(ctx) {
    const { patronBarcode, copyBarcodes, sendEmailReceipt } = (ctx.request.body ?? {}) as any;
    ctx.body = await strapi.service("api::loan.loan").checkout({
      patronBarcode,
      copyBarcodes,
      sendEmailReceipt: !!sendEmailReceipt,
      librarianId: ctx.state.user?.id,
    });
  },

  async returnBook(ctx) {
    const { loanItemId, copyBarcode, returnCondition, fineCollected } = (ctx.request.body ?? {}) as any;
    ctx.body = await strapi.service("api::loan.loan").returnBook({
      loanItemId,
      copyBarcode,
      returnCondition: returnCondition || "normal",
      fineCollected: !!fineCollected,
      librarianId: ctx.state.user?.id,
    });
  },

  async shiftHistory(ctx) {
    const { from, to, mine } = ctx.query as any;
    ctx.body = await strapi.service("api::loan.loan").shiftHistory({
      from,
      to,
      librarianId: mine === "true" ? ctx.state.user?.id : undefined,
    });
  },

  // ==========================================
  // 2. BỔ SUNG CÁC API THEO YÊU CẦU MỚI
  // ==========================================

  /**
   * GET /api/loans/status-counts
   * Đếm số lượng theo tab (all, borrowing, overdue, renewed2plus, returned)
   */
  async getStatusCounts(ctx) {
    const today = todayStr();

    const [all, borrowing, overdue, renewed2plus, returned] = await Promise.all([
      strapi.db.query("api::loan.loan").count(),
      strapi.db.query("api::loan.loan").count({
        where: { loanItems: { status: { $in: ["borrowing", "overdue"] } } },
      }),
      strapi.db.query("api::loan.loan").count({
        where: { loanItems: { status: { $in: ["borrowing", "overdue"] }, dueDate: { $lt: today } } },
      }),
      strapi.db.query("api::loan.loan").count({
        where: { loanItems: { renewCount: { $gte: 2 } } },
      }),
      strapi.db.query("api::loan.loan").count({
        where: { status: "returned" },
      }),
    ]);

    ctx.body = {
      all,
      borrowing,
      overdue,
      renewed2plus,
      returned,
    };
  },

  /**
   * GET /api/loans/admin-list?status=&q=&page=
   * Danh sách phiếu quản trị có tìm kiếm và phân trang
   */
  async getAdminList(ctx) {
    const { status, q, page = 1, pageSize = 10, className, from, to, ids } = ctx.query as any;
    const requestedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const size = Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 10));
    const keyword = String(q || "").trim();
    const today = todayStr();
    const clauses: any[] = [];
    const activeItems = { status: { $in: ["borrowing", "overdue"] } };
    if (status === "borrowing") clauses.push({ loanItems: activeItems });
    if (status === "overdue") clauses.push({ loanItems: { ...activeItems, dueDate: { $lt: today } } });
    if (status === "returned") clauses.push({ status: "returned" });
    if (status === "renewed2plus") clauses.push({ loanItems: { renewCount: { $gte: 2 } } });
    if (status === "renewed") clauses.push({ loanItems: { renewCount: { $gt: 0 } } });
    if (ids) clauses.push({ documentId: { $in: String(ids).split(",").filter(Boolean).slice(0, 100) } });
    if (className) clauses.push({ patron: { className: { $containsi: String(className).trim() } } });
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(from || ""))) clauses.push({ loanedAt: { $gte: `${from}T00:00:00+07:00` } });
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(to || ""))) clauses.push({ loanedAt: { $lte: `${to}T23:59:59.999+07:00` } });
    if (keyword) clauses.push({ $or: [
      { code: { $containsi: keyword } },
      { patron: { fullName: { $containsi: keyword } } },
      { patron: { studentCode: { $containsi: keyword } } },
      { patron: { cardBarcode: { $containsi: keyword } } },
      { loanItems: { copy: { book: { title: { $containsi: keyword } } } } },
      { loanItems: { copy: { accessionNo: { $containsi: keyword } } } },
    ] });
    const where = clauses.length ? { $and: clauses } : {};
    const repository = strapi.db.query("api::loan.loan");
    const total = await repository.count({ where });
    const pageCount = Math.max(1, Math.ceil(total / size));
    const currentPage = Math.min(requestedPage, pageCount);
    const loans = await repository.findMany({
      where,
      populate: {
        patron: { populate: { patronType: true } },
        loanItems: { populate: { copy: { populate: { book: true } } } },
        librarian: true,
      },
      orderBy: [{ loanedAt: "desc" }, { id: "desc" }],
      offset: (currentPage - 1) * size, limit: size,
    });
    const data = loans.map((loan: any) => {
      const items = (loan.loanItems || []).map((item: any) => ({
        loanItemId: item.documentId,
        bookTitle: item.copy?.book?.title || "",
        accessionNo: item.copy?.accessionNo || "",
        dueDate: item.dueDate,
        returnedAt: item.returnedAt,
        renewCount: item.renewCount || 0,
        status: item.status,
        fine: Number(item.fine || 0),
        fineCollected: !!item.fineCollected,
      }));
      return {
        documentId: loan.documentId,
        code: loan.code,
        patron: loan.patron ? {
          fullName: loan.patron.fullName,
          studentCode: loan.patron.studentCode,
          className: loan.patron.className,
        } : null,
        items,
        loanedAt: loan.loanedAt || loan.createdAt,
        librarian: loan.librarian?.username || null,
        totalFine: items.reduce((sum: number, item: any) => sum + item.fine, 0),
        status: items.every((item: any) => item.status === "returned") ? "returned" : items.some((item: any) => item.status !== "returned" && item.dueDate < today) ? "overdue" : "borrowing",
      };
    });

    ctx.body = { data, meta: { pagination: {
      page: currentPage, pageSize: size, total, pageCount,
    } } };
  },

  /**
   * GET /api/loans/:documentId/print
   * Lấy dữ liệu chi tiết phiếu mượn để in
   */
  async getPrintData(ctx) {
    const { documentId } = ctx.params;

    const loan = await strapi.db.query("api::loan.loan").findOne({
      where: { documentId },
      populate: ["patron", "loanItems.copy.book", "librarian"],
    });

    if (!loan) {
      return ctx.notFound("Không tìm thấy phiếu mượn.");
    }

    ctx.body = {
      code: loan.code,
      loanedAt: loan.loanedAt || loan.createdAt,
      patron: loan.patron
        ? {
            fullName: loan.patron.fullName,
            studentCode: loan.patron.studentCode,
            className: loan.patron.className,
            cardBarcode: loan.patron.cardBarcode,
          }
        : null,
      items: (loan.loanItems || []).map((item: any) => ({
        bookTitle: item.copy?.book?.title || "",
        accessionNo: item.copy?.accessionNo || "",
        dueDate: item.dueDate,
        returnedAt: item.returnedAt,
        returnCondition: item.returnCondition,
        fine: Number(item.fine || 0),
      })),
      librarian: loan.librarian?.username || null,
    };
  },
}));
