import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::loan.loan", ({ strapi }) => ({
  async checkout(ctx) {
    const { patronBarcode, copyBarcodes, sendEmailReceipt } = (ctx.request.body ?? {}) as any;
    ctx.body = await strapi.service("api::loan.loan").checkout({
      patronBarcode,
      copyBarcodes,
      sendEmailReceipt: !!sendEmailReceipt,
      librarianId: ctx.state.user?.documentId,
    });
  },

  async returnBook(ctx) {
    const { loanItemId, copyBarcode, returnCondition, fineCollected } = (ctx.request.body ?? {}) as any;
    ctx.body = await strapi.service("api::loan.loan").returnBook({
      loanItemId,
      copyBarcode,
      returnCondition: returnCondition || "normal",
      fineCollected: !!fineCollected,
      librarianId: ctx.state.user?.documentId,
    });
  },

  async shiftHistory(ctx) {
    const { from, to, mine } = ctx.query as any;
    ctx.body = await strapi.service("api::loan.loan").shiftHistory({
      from,
      to,
      librarianId: mine === "true" ? ctx.state.user?.documentId : undefined,
    });
  },
}));
