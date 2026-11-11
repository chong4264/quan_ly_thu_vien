import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";

const BOOK = "api::book.book";
const COPY = "api::copy.copy";

export function registerBookManagement(strapi: Core.Strapi) {
  strapi.documents.use(async (context, next) => {
    if (context.uid !== BOOK) return next();

    if (context.action === "create" || context.action === "update") {
      const data = (context.params.data ?? {}) as Record<string, unknown>;
      for (const field of ["title", "author"]) {
        if (data[field] === undefined) continue;
        if (typeof data[field] !== "string" || !data[field].trim()) {
          throw new errors.ValidationError(
            field === "title" ? "Vui lòng nhập tên đầu sách" : "Vui lòng nhập tác giả",
          );
        }
        data[field] = data[field].trim();
      }
      if (typeof data.isbn === "string") data.isbn = data.isbn.trim() || null;
      for (const field of ["publishYear", "pages", "edition", "price"]) {
        const value = data[field];
        if (value === undefined || value === null) continue;
        if (value === "") {
          data[field] = null;
          continue;
        }
        const number = Number(value);
        if (!Number.isFinite(number) || number < (field === "price" ? 0 : 1) ||
          (field !== "price" && !Number.isInteger(number))) {
          throw new errors.ValidationError("Năm xuất bản, số trang, lần tái bản phải là số nguyên dương và giá sách phải không âm");
        }
      }
    }

    if (context.action !== "delete") return next();
    const documentId = context.params.documentId;
    return strapi.db.transaction(async ({ trx }) => {
      // The book row lock also serializes concurrent copy links through their foreign key.
      const metadata = strapi.db.metadata.get(BOOK);
      const documentColumn = metadata.attributes.documentId as { columnName: string };
      await strapi.db.connection(metadata.tableName)
        .where(documentColumn.columnName, documentId)
        .transacting(trx)
        .forUpdate();
      const copies = await strapi.db.query(COPY).count({
        where: { book: { documentId } },
      });
      if (copies > 0) {
        throw new errors.ApplicationError(
          "Đầu sách đang có bản sao. Hãy xử lý bản sao trước hoặc chuyển trạng thái đầu sách sang Ngừng lưu hành.",
        );
      }
      return next();
    });
  });
}

export async function ensureLibrarianRole(strapi: Core.Strapi) {
  await strapi.db.transaction(async ({ trx }) => {
    const roles = strapi.db.query("plugin::users-permissions.role");
    // Serialize bootstrap on an existing role so concurrent starts do not duplicate setup.
    const roleTable = strapi.db.metadata.get("plugin::users-permissions.role").tableName;
    await strapi.db.connection(roleTable).where({ type: "authenticated" }).transacting(trx).forUpdate();
    let role = await roles.findOne({ where: { type: "librarian" } });
    if (!role) {
      role = await roles.create({
        data: { name: "Thủ thư", type: "librarian", description: "Quản lý đầu sách và nghiệp vụ mượn trả" },
      });
    }
    const actions = [
      "plugin::users-permissions.user.me",
      ...["find", "findOne", "create", "update", "delete"].map((action) => `api::book.book.${action}`),
      "api::category.category.find", "api::category.category.findOne",
      "api::shelf.shelf.find", "api::shelf.shelf.findOne",
      "api::patron.patron.lookup", "api::copy.copy.lookup",
      "api::loan.loan.checkout", "api::loan.loan.returnBook", "api::loan.loan.shiftHistory",
      "api::loan-item.loan-item.byPatron", "api::loan-item.loan-item.renew", "api::loan-item.loan-item.bulkRenew",
      "api::return-receipt.return-receipt.shiftHistory",
    ];
    const permissions = strapi.db.query("plugin::users-permissions.permission");
    for (const action of actions) {
      if (!(await permissions.findOne({ where: { action, role: { id: role.id } } }))) {
        await permissions.create({ data: { action, role: role.id } });
      }
    }
    const users = strapi.db.query("plugin::users-permissions.user");
    const demo = await users.findOne({
      where: { email: "thuthu@truonghoc.edu.vn", username: "thuthu", provider: "local" },
      populate: ["role"],
    });
    if (demo?.role?.type === "authenticated") {
      await users.update({ where: { id: demo.id }, data: { role: role.id } });
    }
  });
}

// Các action nghiệp vụ quầy chỉ dành cho thủ thư, không cấp cho tài khoản độc giả.
const STAFF_ONLY_ACTIONS = [
  "api::patron.patron.lookup",
  "api::loan.loan.checkout",
  "api::loan.loan.returnBook",
  "api::loan.loan.shiftHistory",
  "api::loan-item.loan-item.byPatron",
  "api::loan-item.loan-item.renew",
  "api::loan-item.loan-item.bulkRenew",
  "api::return-receipt.return-receipt.shiftHistory",
];

const READER_ACTIONS = [
  "plugin::users-permissions.user.me",
  "api::loan-item.loan-item.meCurrent",
  "api::loan-item.loan-item.meHistory",
  "api::loan-item.loan-item.renewMine",
];

/** Cấp quyền API cá nhân cho độc giả và thu hồi quyền nghiệp vụ quầy khỏi vai trò không phải thủ thư. */
export async function ensureReaderPermissions(strapi: Core.Strapi) {
  await strapi.db.transaction(async () => {
    const roles = strapi.db.query("plugin::users-permissions.role");
    const permissions = strapi.db.query("plugin::users-permissions.permission");
    const allRoles = await roles.findMany({ limit: 100 });

    const readerRoles = allRoles.filter((role: any) => ["authenticated", "reader"].includes(role.type));
    for (const role of readerRoles) {
      for (const action of READER_ACTIONS) {
        if (!(await permissions.findOne({ where: { action, role: { id: role.id } } }))) {
          await permissions.create({ data: { action, role: role.id } });
        }
      }
    }

    for (const role of allRoles) {
      if (role.type === "librarian") continue;
      const unwanted = await permissions.findMany({
        where: { action: { $in: STAFF_ONLY_ACTIONS }, role: { id: role.id } },
      });
      for (const permission of unwanted) {
        await permissions.delete({ where: { id: permission.id } });
      }
    }
  });
}
