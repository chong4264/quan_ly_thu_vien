import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::loan-item.loan-item", ({ strapi }) => ({
  async byPatron(ctx) {
    const { barcode } = ctx.query as { barcode?: string };
    ctx.body = await strapi.service("api::loan-item.loan-item").byPatron(barcode);
  },
  async renew(ctx) {
    ctx.body = await strapi.service("api::loan-item.loan-item").renew(ctx.params.documentId);
  },
  async bulkRenew(ctx) {
    const { ids } = (ctx.request.body ?? {}) as { ids?: string[] };
    ctx.body = await strapi.service("api::loan-item.loan-item").bulkRenew(ids);
  },
}));
