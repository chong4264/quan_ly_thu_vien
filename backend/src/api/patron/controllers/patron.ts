import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::patron.patron", ({ strapi }) => ({
  async lookup(ctx) {
    const { barcode, q } = ctx.query as { barcode?: string; q?: string };
    ctx.body = await strapi.service("api::patron.patron").lookup({ barcode, q });
  },
}));
