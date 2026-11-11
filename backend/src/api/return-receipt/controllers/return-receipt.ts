import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::return-receipt.return-receipt", ({ strapi }) => ({
  async shiftHistory(ctx) {
    const { from, to, mine } = ctx.query as any;
    ctx.body = await strapi.service("api::return-receipt.return-receipt").shiftHistory({
      from,
      to,
      librarianId: mine === "true" ? ctx.state.user?.id : undefined,
    });
  },
}));
