
import { factories } from "@strapi/strapi";

interface RemindRequestBody {
  loanItemIds: (number | string)[];
}

export default factories.createCoreController(
  "api::loan-item.loan-item",
  ({ strapi }) => ({

    // 1. Lấy danh sách sách mượn theo độc giả
    async byPatron(ctx) {
      const { barcode } = ctx.query as {
        barcode?: string;
      };

      ctx.body = await strapi
        .service("api::loan-item.loan-item")
        .byPatron(barcode);
    },

    // 2. Gia hạn một sách mượn
    async renew(ctx) {
      ctx.body = await strapi
        .service("api::loan-item.loan-item")
        .renew(ctx.params.documentId);
    },

    // 3. Gia hạn nhiều sách mượn
    async bulkRenew(ctx) {
      const { ids } = (ctx.request.body ?? {}) as {
        ids?: string[];
      };

      ctx.body = await strapi
        .service("api::loan-item.loan-item")
        .bulkRenew(ids);
    },

    // 4. Gửi thông báo nhắc nhở trả sách qua email
    async remindNotification(ctx) {
      const { loanItemIds } = (ctx.request.body ?? {}) as RemindRequestBody;

      if (!Array.isArray(loanItemIds) || loanItemIds.length === 0) {
        return ctx.badRequest(
          "loanItemIds phải là một mảng và không được để trống."
        );
      }

      const sent: (number | string)[] = [];
      const failed: (number | string)[] = [];

      for (const id of loanItemIds) {
        try {
          const loanItem = await strapi
            .documents("api::loan-item.loan-item")
            .findOne({
              documentId: String(id),
              populate: { loan: { populate: { patron: true } }, copy: { populate: { book: true } } },
            });

          if (!loanItem || !loanItem.loan?.patron?.email) {
            failed.push(id);
            continue;
          }

          const patron = loanItem.loan.patron;
          const bookTitle = loanItem.copy?.book?.title || "Sách mượn";

          await (strapi.plugin("email").service("email") as any).send({
            to: patron.email,
            subject: "[Thư viện] Nhắc nhở trả sách",
            text: `Xin chào ${patron.fullName},

Bạn có khoản mượn sách "${bookTitle}" sắp đến hạn hoặc đã quá hạn. Vui lòng sắp xếp trả sách đúng quy định.

Trân trọng!`,
          });

          sent.push(id);

        } catch (error) {
          strapi.log.error(
            `Gửi email thất bại cho loanItemId: ${id}`,
            error
          );

          failed.push(id);
        }
      }

      return {
        sent,
        failed,
      };
    },

    // 5. API cá nhân: sách đang mượn của tài khoản đang đăng nhập
    async meCurrent(ctx) {
      ctx.body = await strapi
        .service("api::loan-item.loan-item")
        .currentForUser(ctx.state.user);
    },

    // 6. API cá nhân: lịch sử mượn của tài khoản đang đăng nhập
    async meHistory(ctx) {
      ctx.body = await strapi
        .service("api::loan-item.loan-item")
        .historyForUser(ctx.state.user, ctx.query);
    },

    // 7. API cá nhân: gia hạn lượt mượn thuộc tài khoản đang đăng nhập
    async renewMine(ctx) {
      ctx.body = await strapi
        .service("api::loan-item.loan-item")
        .renew(ctx.params.documentId, ctx.state.user);
    },

  })
);
