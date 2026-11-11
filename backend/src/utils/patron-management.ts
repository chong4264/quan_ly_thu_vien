import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { docs, getPatronState, UID } from './library';

const USER = 'plugin::users-permissions.user';
const REQUEST = 'api::loan-request.loan-request';
const statuses = ['active', 'warning', 'locked', 'expired'];
const populated = { patronType: true, user: { fields: ['id', 'username', 'email', 'blocked', 'confirmed'] } };
const fail = (message: string): never => { throw new errors.ValidationError(message); };

function text(value: unknown, name: string, max: number, required = false) {
  if (value == null && !required) return null;
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) {
    fail(`${name} không hợp lệ${required ? ' hoặc đang để trống' : ''}`);
  }
  return (value as string).trim() || null;
}

export function patronAdminDto(p: any) {
  return {
    documentId: p.documentId, studentCode: p.studentCode, fullName: p.fullName,
    className: p.className, cardBarcode: p.cardBarcode, email: p.email, phone: p.phone,
    address: p.address, cardStatus: p.cardStatus, cardExpiresAt: p.cardExpiresAt,
    patronType: p.patronType && {
      documentId: p.patronType.documentId, name: p.patronType.name,
      maxBooks: p.patronType.maxBooks, loanDays: p.patronType.loanDays,
    },
    user: p.user && {
      id: p.user.id, username: p.user.username, email: p.user.email,
      blocked: p.user.blocked, confirmed: p.user.confirmed,
    },
  };
}

export function createPatronManagement(strapi: Core.Strapi) {
  async function lock(uid: string, where: Record<string, unknown>, trx: any) {
    const metadata = strapi.db.metadata.get(uid as any);
    return strapi.db.connection(metadata.tableName).where(where).transacting(trx).forUpdate();
  }

  async function find(documentId: string) {
    const patron = await docs(strapi, UID.patron).findOne({ documentId, populate: populated });
    if (!patron) throw new errors.NotFoundError('Không tìm thấy độc giả');
    return patron;
  }

  async function validated(input: any, existing?: any) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Thông tin độc giả không hợp lệ');
    const data: Record<string, any> = {
      studentCode: text(input.studentCode, 'Mã sinh viên / cán bộ', 60, true),
      fullName: text(input.fullName, 'Họ tên', 150, true),
      className: text(input.className, 'Lớp / đơn vị', 150),
      cardBarcode: text(input.cardBarcode, 'Mã thẻ', 100),
      email: text(input.email, 'Email liên hệ', 254),
      phone: text(input.phone, 'Số điện thoại', 30),
      address: text(input.address, 'Địa chỉ', 500),
      cardStatus: input.cardStatus || 'active',
      cardExpiresAt: input.cardExpiresAt || null,
    };
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) fail('Email liên hệ không hợp lệ');
    if (!statuses.includes(data.cardStatus)) fail('Trạng thái thẻ không hợp lệ');
    if (data.cardExpiresAt && (typeof data.cardExpiresAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.cardExpiresAt) ||
      !Number.isFinite(Date.parse(data.cardExpiresAt)) || new Date(data.cardExpiresAt).toISOString().slice(0, 10) !== data.cardExpiresAt)) {
      fail('Ngày hết hạn thẻ không hợp lệ');
    }
    const typeId = text(input.patronType, 'Nhóm độc giả', 80, true);
    const type = await docs(strapi, UID.patronType).findOne({ documentId: typeId });
    if (!type || type.maxBooks < 1 || type.loanDays < 1) fail('Hãy chọn nhóm độc giả có định mức mượn hợp lệ');
    data.patronType = type.documentId;

    for (const field of ['studentCode', 'cardBarcode']) {
      if (!data[field]) continue;
      const duplicates = await docs(strapi, UID.patron).findMany({
        filters: { [field]: { $eqi: data[field] }, ...(existing ? { documentId: { $ne: existing.documentId } } : {}) }, limit: 1,
      });
      if (duplicates.length) fail(field === 'studentCode' ? 'Mã sinh viên / cán bộ đã tồn tại' : 'Mã thẻ đã được cấp cho độc giả khác');
    }
    const userId = input.userId == null || input.userId === '' ? null : Number(input.userId);
    if (userId !== null && (!Number.isSafeInteger(userId) || userId < 1)) fail('Tài khoản liên kết không hợp lệ');
    if (existing?.user && userId !== existing.user.id) {
      fail('Hồ sơ đã liên kết tài khoản. Không thể đổi tài khoản để bảo vệ lịch sử mượn');
    }
    if (userId !== null) {
      const user = await strapi.db.query(USER).findOne({ where: { id: userId }, populate: ['role'] });
      if (!user || (!existing?.user && !['authenticated', 'reader'].includes(user.role?.type))) {
        fail('Hãy chọn tài khoản sinh viên / độc giả hợp lệ');
      }
      const linked = await docs(strapi, UID.patron).findMany({ filters: { user: { id: userId } }, limit: 2 });
      if (linked.some((row: any) => row.documentId !== existing?.documentId)) fail('Tài khoản đã được liên kết với độc giả khác');
    }
    data.user = userId;
    return data;
  }

  return {
    async list(query: any) {
      const page = Math.max(1, Math.min(100000, Number.parseInt(query.page, 10) || 1));
      const pageSize = 10;
      const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
      const filters: any = {};
      if (q) filters.$or = ['fullName', 'studentCode', 'cardBarcode', 'email'].map((field) => ({ [field]: { $containsi: q } }));
      if (query.status) {
        if (!statuses.includes(query.status)) fail('Bộ lọc trạng thái không hợp lệ');
        filters.cardStatus = query.status;
      }
      if (query.patronType) filters.patronType = { documentId: query.patronType };
      const total = await docs(strapi, UID.patron).count({ filters });
      const pageCount = Math.max(1, Math.ceil(total / pageSize));
      const currentPage = Math.min(page, pageCount);
      const list = await docs(strapi, UID.patron).findMany({
        filters, populate: populated, sort: ['createdAt:desc', 'id:desc'], start: (currentPage - 1) * pageSize, limit: pageSize,
      });
      return { data: list.map(patronAdminDto), meta: { pagination: { page: currentPage, pageSize, total, pageCount } } };
    },
    async detail(documentId: string) {
      const p = await find(documentId);
      return { data: { ...patronAdminDto(p), state: await getPatronState(strapi, p) } };
    },
    async options(query: any) {
      const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : '';
      const types = await docs(strapi, UID.patronType).findMany({ sort: 'name:asc', limit: 100 });
      const users = await strapi.db.query(USER).findMany({
        where: { role: { type: { $in: ['authenticated', 'reader'] } }, ...(q ? { $or: [{ username: { $containsi: q } }, { email: { $containsi: q } }] } : {}) },
        select: ['id', 'username', 'email', 'blocked', 'confirmed'], orderBy: { username: 'asc' }, limit: 30,
      });
      const linked = users.length ? await docs(strapi, UID.patron).findMany({
        filters: { user: { id: { $in: users.map((u: any) => u.id) } } }, populate: { user: { fields: ['id'] } }, limit: 30,
      }) : [];
      const linkedIds = new Set(linked.map((p: any) => p.user?.id));
      return {
        patronTypes: types.map((t: any) => ({ documentId: t.documentId, name: t.name, maxBooks: t.maxBooks, loanDays: t.loanDays })),
        users: users.filter((u: any) => !linkedIds.has(u.id)).map((u: any) => ({ id: u.id, username: u.username, email: u.email, blocked: u.blocked, confirmed: u.confirmed })),
      };
    },
    async save(input: any, documentId?: string) {
      return strapi.db.transaction(async ({ trx }) => {
        if (documentId) {
          const column = strapi.db.metadata.get(UID.patron).attributes.documentId as { columnName: string };
          await lock(UID.patron, { [column.columnName]: documentId }, trx);
        }
        const userId = Number(input?.userId);
        if (Number.isSafeInteger(userId) && userId > 0) await lock(USER, { id: userId }, trx);
        const existing = documentId ? await find(documentId) : undefined;
        const data = await validated(input, existing);
        const result = existing
          ? await docs(strapi, UID.patron).update({ documentId, data, populate: populated })
          : await docs(strapi, UID.patron).create({ data, populate: populated });
        return { data: patronAdminDto(result) };
      });
    },
    async remove(documentId: string) {
      return strapi.db.transaction(async ({ trx }) => {
        const column = strapi.db.metadata.get(UID.patron).attributes.documentId as { columnName: string };
        await lock(UID.patron, { [column.columnName]: documentId }, trx);
        await find(documentId);
        const loans = await docs(strapi, UID.loan).count({ filters: { patron: { documentId } } });
        const requests = strapi.contentTypes[REQUEST] ? await docs(strapi, REQUEST).count({ filters: { patron: { documentId } } }) : 0;
        if (loans || requests) throw new errors.ApplicationError('Độc giả đã có lịch sử mượn hoặc yêu cầu mượn. Hãy khóa thẻ thay vì xóa hồ sơ');
        await docs(strapi, UID.patron).delete({ documentId });
        return { data: { documentId } };
      });
    },
  };
}
