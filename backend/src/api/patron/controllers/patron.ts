import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { docs, getPatronState, UID } from '../../../utils/library';
import { findUserPatron, userProfile } from '../../../utils/user-profile';
import { createPatronManagement } from '../../../utils/patron-management';

function staff(ctx: any) {
  if (ctx.state.user?.role?.type !== 'librarian') throw new errors.ForbiddenError('Chức năng này chỉ dành cho thủ thư');
}

async function profileResponse(strapi: Core.Strapi, user: any) {
  const patron = await findUserPatron(strapi, user);
  const profile = userProfile(user, patron);
  const state = patron ? await getPatronState(strapi, patron) : null;
  return {
    ...profile.patron,
    email: user.email,
    parentName: patron?.parentName ?? null,
    parentPhone: patron?.parentPhone ?? null,
    homeroomTeacher: patron?.homeroomTeacher ?? null,
    borrowingCount: state?.borrowingCount ?? 0,
    unpaidFine: state?.unpaidFine ?? 0,
    ...profile,
    state,
  };
}

export default factories.createCoreController('api::patron.patron', ({ strapi }) => ({
  async staffList(ctx) {
    staff(ctx);
    ctx.body = await createPatronManagement(strapi).list(ctx.query);
  },
  async staffFind(ctx) {
    staff(ctx);
    ctx.body = await createPatronManagement(strapi).detail(ctx.params.documentId);
  },
  async staffOptions(ctx) {
    staff(ctx);
    ctx.body = await createPatronManagement(strapi).options(ctx.query);
  },
  async staffCreate(ctx) {
    staff(ctx);
    ctx.body = await createPatronManagement(strapi).save(ctx.request.body?.data);
    ctx.status = 201;
  },
  async staffUpdate(ctx) {
    staff(ctx);
    ctx.body = await createPatronManagement(strapi).save(ctx.request.body?.data, ctx.params.documentId);
  },
  async staffDelete(ctx) {
    staff(ctx);
    ctx.body = await createPatronManagement(strapi).remove(ctx.params.documentId);
  },
  async lookup(ctx) {
    const { barcode, q } = ctx.query as { barcode?: string; q?: string };
    ctx.body = await strapi.service('api::patron.patron').lookup({ barcode, q });
  },

  async getMe(ctx) {
    // Keep the original flat fields for existing callers of /patrons/me.
    ctx.body = await profileResponse(strapi, ctx.state.user);
  },

  async updateMe(ctx) {
    const patron = await findUserPatron(strapi, ctx.state.user);
    if (!patron) return ctx.notFound('Tài khoản chưa được liên kết hồ sơ thư viện');
    const input = ctx.request.body?.data;
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return ctx.badRequest('Thông tin hồ sơ không hợp lệ');
    }
    const data: Record<string, string | null> = {};
    const limits = { fullName: 150, phone: 30, address: 500 };
    for (const [field, max] of Object.entries(limits)) {
      if (input[field] === undefined) continue;
      if (typeof input[field] !== 'string' || input[field].trim().length > max) {
        throw new errors.ValidationError('Họ tên, số điện thoại hoặc địa chỉ không hợp lệ');
      }
      const value = input[field].trim();
      if (field === 'fullName' && !value) {
        throw new errors.ValidationError('Vui lòng nhập họ tên');
      }
      data[field] = value || null;
    }
    await docs(strapi, UID.patron).update({ documentId: patron.documentId, data });
    ctx.body = await profileResponse(strapi, ctx.state.user);
  },
}));
