import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::copy.copy", ({ strapi }) => ({
  async lookup(ctx) {
    const { barcode } = ctx.query as { barcode?: string };
    ctx.body = await strapi.service("api::copy.copy").lookup(barcode);
  },
}));
