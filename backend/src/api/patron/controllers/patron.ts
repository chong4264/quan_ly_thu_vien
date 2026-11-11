
import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::patron.patron",
  ({ strapi }) => ({

    // 1. Tra cứu độc giả
    async lookup(ctx) {
      const { barcode, q } = ctx.query as {
        barcode?: string;
        q?: string;
      };

      ctx.body = await strapi
        .service("api::patron.patron")
        .lookup({ barcode, q });
    },

    // 2. Lấy thông tin độc giả đang đăng nhập
    async getMe(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized("Bạn chưa đăng nhập.");
      }

      // Tìm thông tin Patron theo email
      const patron = await strapi.db
        .query("api::patron.patron")
        .findOne({
          where: { email: user.email },
          populate: ["patronType"],
        });

      if (!patron) {
        return ctx.notFound("Không tìm thấy thông tin độc giả.");
      }

      // Đếm số sách đang mượn
      const borrowingCount = await strapi.db
        .query("api::loan-item.loan-item")
        .count({
          where: {
            loan: { patron: patron.id },
            status: "borrowing",
          },
        });

      // Lấy danh sách khoản phạt chưa thanh toán
      const loanItems = await strapi.db
        .query("api::loan-item.loan-item")
        .findMany({
          where: {
            loan: { patron: patron.id },
            isFinePaid: false,
          },
        });

      // Tính tổng tiền phạt
      const unpaidFine = loanItems.reduce(
        (sum: number, item: any) =>
          sum + (item.fineAmount || 0),
        0
      );

      // Trả dữ liệu về frontend
      return {
        studentCode: patron.studentCode,
        fullName: patron.fullName,
        className: patron.className,
        cardBarcode: patron.cardBarcode,
        email: patron.email,
        phone: patron.phone,
        parentName: patron.parentName,
        parentPhone: patron.parentPhone,
        homeroomTeacher: patron.homeroomTeacher,
        address: patron.address,
        cardStatus: patron.cardStatus,
        cardExpiresAt: patron.cardExpiresAt,

        patronType: patron.patronType
          ? {
              name: patron.patronType.name,
              maxBooks: patron.patronType.maxBooks,
              loanDays: patron.patronType.loanDays,
              maxRenewals: patron.patronType.maxRenewals,
              renewDays: patron.patronType.renewDays,
            }
          : null,

        borrowingCount,
        unpaidFine,
      };
    },

  })
);
