import { factories } from "@strapi/strapi";
import { ForbiddenError } from "../../../utils/library";

export default factories.createCoreController("api::loan-request.loan-request" as any, ({ strapi }) => {
  const service = () => strapi.service("api::loan-request.loan-request" as any) as any;
  const reader = (ctx: any) => {
    if (!["authenticated", "reader"].includes(ctx.state.user?.role?.type))
      throw new ForbiddenError("Chức năng đăng ký mượn online dành cho tài khoản sinh viên / độc giả");
    return ctx.state.user;
  };
  return {
    async mine(ctx: any) { ctx.body = await service().mine(reader(ctx), ctx.query); },
    async createMine(ctx: any) {
      ctx.body = await service().createMine(reader(ctx), ctx.request.body ?? {});
      ctx.status = 201;
    },
    async cancelMine(ctx: any) { ctx.body = await service().cancelMine(reader(ctx), ctx.params.documentId); },
    async adminList(ctx: any) { ctx.body = await service().adminList(ctx.query); },
    async fulfill(ctx: any) {
      ctx.body = await service().fulfill(ctx.params.documentId, ctx.request.body ?? {}, ctx.state.user);
    },
    async reject(ctx: any) {
      ctx.body = await service().reject(ctx.params.documentId, ctx.request.body ?? {}, ctx.state.user);
    }
  };
});
