import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::patron.patron",
  ({ strapi }) => ({
    // GET /patrons/admin-list
    async adminList(ctx) {
      try {
        const result = await strapi
          .service("api::patron.patron")
          .getAdminList(ctx.query);
        return result;
      } catch (err: any) {
        return ctx.badRequest("Không thể tải danh sách độc giả", {
          error: err.message,
        });
      }
    },

    // POST /patrons/import
    async import(ctx) {
      try {
        const { data } = ctx.request.body;
        if (!Array.isArray(data)) {
          return ctx.badRequest("Dữ liệu import phải là một mảng (data: [])");
        }
        const result = await strapi
          .service("api::patron.patron")
          .importPatrons(data);
        return result;
      } catch (err: any) {
        return ctx.badRequest("Lỗi khi import dữ liệu độc giả", {
          error: err.message,
        });
      }
    },

    // POST /patrons/bulk-lock
    async bulkLock(ctx) {
      try {
        const { ids } = ctx.request.body;
        if (!Array.isArray(ids) || ids.length === 0) {
          return ctx.badRequest("Danh sách ids không hợp lệ");
        }
        const result = await strapi
          .service("api::patron.patron")
          .bulkUpdateStatus(ids, "locked");
        return result;
      } catch (err: any) {
        return ctx.badRequest("Lỗi khi khóa thẻ hàng loạt", {
          error: err.message,
        });
      }
    },

    // POST /patrons/bulk-unlock
    async bulkUnlock(ctx) {
      try {
        const { ids } = ctx.request.body;
        if (!Array.isArray(ids) || ids.length === 0) {
          return ctx.badRequest("Danh sách ids không hợp lệ");
        }
        const result = await strapi
          .service("api::patron.patron")
          .bulkUpdateStatus(ids, "active");
        return result;
      } catch (err: any) {
        return ctx.badRequest("Lỗi khi mở khóa thẻ hàng loạt", {
          error: err.message,
        });
      }
    },

    // GET /patrons/export-cards?ids=id1,id2
    async exportCards(ctx) {
      try {
        const idsParam = (ctx.query.ids as string) || "";
        const ids = idsParam ? idsParam.split(",").map((id) => id.trim()) : [];
        const data = await strapi
          .service("api::patron.patron")
          .exportCards(ids);
        return { data };
      } catch (err: any) {
        return ctx.badRequest("Lỗi khi xuất dữ liệu thẻ RFID", {
          error: err.message,
        });
      }
    },
  }),
);
