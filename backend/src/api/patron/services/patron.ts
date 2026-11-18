import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::patron.patron",
  ({ strapi }) => ({
    // Lấy danh sách độc giả cho trang quản trị kèm bộ lọc, phân trang và đếm sách đang mượn
    async getAdminList(query: {
      q?: string;
      className?: string;
      status?: string;
      page?: string;
      pageSize?: string;
    }) {
      const { q, className, status, page = "1", pageSize = "10" } = query;
      const filters: any = { $and: [] };

      if (q) {
        filters.$and.push({
          $or: [
            { fullName: { $containsi: q } },
            { studentCode: { $containsi: q } },
            { cardBarcode: { $containsi: q } },
            { phone: { $containsi: q } },
          ],
        });
      }

      if (className) {
        filters.$and.push({ className: { $eq: className } });
      }

      if (status) {
        filters.$and.push({ cardStatus: { $eq: status } });
      }

      if (filters.$and.length === 0) {
        delete filters.$and;
      }

      const parsedPage = Math.max(1, parseInt(page, 10) || 1);
      const parsedPageSize = Math.max(1, parseInt(pageSize, 10) || 10);

      const [results, total] = await Promise.all([
        strapi.db.query("api::patron.patron").findMany({
          where: filters,
          populate: {
            patronType: true,
            loans: {
              populate: {
                loanItems: {
                  where: { status: "borrowing" },
                },
              },
            },
          },
          offset: (parsedPage - 1) * parsedPageSize,
          limit: parsedPageSize,
          orderBy: { createdAt: "DESC" },
        }),
        strapi.db.query("api::patron.patron").count({ where: filters }),
      ]);

      const data = results.map((patron: any) => {
        const borrowingCount = (patron.loans || []).reduce(
          (sum: number, loan: any) => {
            return sum + (loan.loanItems ? loan.loanItems.length : 0);
          },
          0,
        );

        return {
          documentId: patron.documentId,
          fullName: patron.fullName,
          studentCode: patron.studentCode,
          className: patron.className,
          cardBarcode: patron.cardBarcode,
          email: patron.email,
          phone: patron.phone,
          parentName: patron.parentName,
          parentPhone: patron.parentPhone,
          cardStatus: patron.cardStatus,
          cardExpiresAt: patron.cardExpiresAt,
          patronType: patron.patronType
            ? { name: patron.patronType.name }
            : null,
          borrowingCount,
        };
      });

      return {
        data,
        meta: {
          pagination: {
            page: parsedPage,
            pageSize: parsedPageSize,
            pageCount: Math.ceil(total / parsedPageSize),
            total,
          },
        },
      };
    },

    // Import độc giả từ danh sách dữ liệu (CSV/Excel)
    async importPatrons(items: any[]) {
      let created = 0;
      const failed: Array<{
        row: number;
        studentCode?: string;
        reason: string;
      }> = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        try {
          let patronTypeId = undefined;
          if (item.patronTypeName) {
            const pType = await strapi.db
              .query("api::patron-type.patron-type")
              .findOne({
                where: { name: { $eqi: item.patronTypeName } },
              });
            if (pType) patronTypeId = pType.documentId;
          }

          await strapi.documents("api::patron.patron").create({
            data: {
              fullName: item.fullName,
              studentCode: item.studentCode,
              className: item.className,
              cardBarcode: item.cardBarcode || item.studentCode,
              email: item.email,
              phone: item.phone,
              parentName: item.parentName,
              parentPhone: item.parentPhone,
              cardStatus: "active",
              cardExpiresAt: item.cardExpiresAt,
              patronType: patronTypeId,
            },
            status: "published",
          });
          created++;
        } catch (err: any) {
          failed.push({
            row: i + 1,
            studentCode: item.studentCode,
            reason: err.message || "Lỗi dữ liệu không hợp lệ",
          });
        }
      }

      return { created, failed };
    },

    // Khóa hoặc mở khóa thẻ hàng loạt
    async bulkUpdateStatus(ids: string[], cardStatus: "locked" | "active") {
      const res = await strapi.db.query("api::patron.patron").updateMany({
        where: { documentId: { $in: ids } },
        data: { cardStatus },
      });
      return { updated: res.count };
    },

    // Xuất thông tin in thẻ RFID
    async exportCards(ids: string[]) {
      const where = ids.length > 0 ? { documentId: { $in: ids } } : {};
      const patrons = await strapi.db.query("api::patron.patron").findMany({
        where,
        populate: { patronType: true },
      });

      return patrons.map((p: any) => ({
        fullName: p.fullName,
        studentCode: p.studentCode,
        className: p.className,
        cardBarcode: p.cardBarcode,
        cardExpiresAt: p.cardExpiresAt,
        patronType: p.patronType ? p.patronType.name : null,
      }));
    },
  }),
);
