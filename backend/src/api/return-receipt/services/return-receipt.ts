import { factories } from "@strapi/strapi";
import { UID, docs, startOfTodayISO } from "../../../utils/library";

export default factories.createCoreService("api::return-receipt.return-receipt", ({ strapi }) => ({
  async shiftHistory({ from, to, librarianId }: any) {
    const filters: any = { returnedAt: { $gte: from || startOfTodayISO(), $lte: to || new Date().toISOString() } };
    if (librarianId) filters.librarian = { documentId: { $eq: librarianId } };
    const rows = await docs(strapi, UID.returnReceipt).findMany({
      filters,
      sort: ["returnedAt:desc"],
      populate: {
        loanItem: { populate: { loan: { populate: { patron: true } }, copy: { populate: { book: true } } } },
        librarian: { fields: ["username"] },
      },
      limit: 200,
    });
    return {
      data: rows.map((r: any) => ({
        code: r.code,
        returnedAt: r.returnedAt,
        patron: r.loanItem?.loan?.patron && { fullName: r.loanItem.loan.patron.fullName },
        bookTitle: r.loanItem?.copy?.book?.title,
        accessionNo: r.loanItem?.copy?.accessionNo,
        returnCondition: r.loanItem?.returnCondition,
        fine: Number(r.loanItem?.fine || 0),
        fineCollected: !!r.loanItem?.fineCollected,
        librarian: r.librarian?.username,
      })),
    };
  },
}));
