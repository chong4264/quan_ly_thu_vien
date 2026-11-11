import { factories } from "@strapi/strapi";

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
      librarianId: ctx.state.user?.documentId,
    });
  },

  async returnBook(ctx) {
    const { loanItemId, copyBarcode, returnCondition, fineCollected } = (ctx.request.body ?? {}) as any;
    ctx.body = await strapi.service("api::loan.loan").returnBook({
      loanItemId,
      copyBarcode,
      returnCondition: returnCondition || "normal",
      fineCollected: !!fineCollected,
      librarianId: ctx.state.user?.documentId,
    });
  },

  async shiftHistory(ctx) {
    const { from, to, mine } = ctx.query as any;
    ctx.body = await strapi.service("api::loan.loan").shiftHistory({
      from,
      to,
      librarianId: mine === "true" ? ctx.state.user?.documentId : undefined,
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
    const today = new Date().toISOString().slice(0, 10);

    const [all, borrowing, overdue, renewed2plus, returned] = await Promise.all([
      strapi.db.query("api::loan.loan").count(),
      strapi.db.query("api::loan-item.loan-item").count({
        where: { returnedAt: { $null: true } },
      }),
      strapi.db.query("api::loan-item.loan-item").count({
        where: {
          returnedAt: { $null: true },
          dueDate: { $lt: today },
        },
      }),
      strapi.db.query("api::loan-item.loan-item").count({
        where: { renewCount: { $gte: 2 } },
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
    const currentPage = Math.max(1, Number(page) || 1);
    const size = Math.min(100, Math.max(1, Number(pageSize) || 10));
    const keyword = String(q || "").trim().toLowerCase();

    // Quan hệ đúng theo schema.json là loanItems (không phải items).
    // Lấy dữ liệu liên quan trước, sau đó lọc để hỗ trợ trạng thái quá hạn/gia hạn
    // vốn được xác định ở cấp loan-item.
    const loans = await strapi.db.query("api::loan.loan").findMany({
      populate: {
        patron: { populate: { patronType: true } },
        loanItems: { populate: { copy: { populate: { book: true } } } },
        librarian: true,
      },
      orderBy: { loanedAt: "desc" },
      limit: 10000,
    });

    const today = new Date().toISOString().slice(0, 10);
    const selectedIds = ids ? String(ids).split(",").filter(Boolean) : null;
    const filtered = loans.filter((loan: any) => {
      if (selectedIds && !selectedIds.includes(String(loan.documentId))) return false;
      const items = loan.loanItems || [];
      const hasOverdue = items.some((item: any) =>
        !item.returnedAt && item.status !== "returned" && item.dueDate < today
      );
      const hasRenewed = items.some((item: any) => Number(item.renewCount || 0) > 0);
      const loanDate = String(loan.loanedAt || loan.createdAt || "").slice(0, 10);
      if (from && loanDate < String(from)) return false;
      if (to && loanDate > String(to)) return false;
      if (className) {
        const cls = String(loan.patron?.className || "").toLowerCase();
        const typeName = String(loan.patron?.patronType?.name || "").toLowerCase();
        if (className === "teachers") {
          if (!/(gi[aá]o vi[eê]n|c[aá]n b[oộ]|teacher|staff)/i.test(typeName)) return false;
        } else {
          const grade = String(className).replace("k", "");
          if (!cls.includes(grade)) return false;
        }
      }
      if (status === "borrowing" && loan.status !== "borrowing") return false;
      if (status === "returned" && loan.status !== "returned") return false;
      if (status === "overdue" && !hasOverdue) return false;
      if (status === "renewed2plus" && !items.some((i: any) => Number(i.renewCount || 0) >= 2)) return false;
      if (status === "renewed" && !hasRenewed) return false;
      if (keyword) {
        const haystack = [loan.code, loan.patron?.fullName, loan.patron?.studentCode,
          loan.patron?.cardBarcode, ...items.map((i: any) => i.copy?.book?.title),
          ...items.map((i: any) => i.copy?.accessionNo)].join(" ").toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });

    const total = filtered.length;
    const data = filtered.slice((currentPage - 1) * size, currentPage * size).map((loan: any) => {
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
        status: loan.status,
      };
    });

    ctx.body = { data, meta: { pagination: {
      page: currentPage, pageSize: size, total, pageCount: Math.ceil(total / size),
    } } };
  },

  /**
   * GET /api/loans/:documentId/print
   * Lấy dữ liệu chi tiết phiếu mượn để in
   */
  async getPrintData(ctx) {
    const { documentId } = ctx.params;

    const loan = await strapi.db.query("api::loan.loan").findOne({
      where: { $or: [{ documentId }, { id: documentId }] },
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