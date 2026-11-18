"use strict";

module.exports = ({ strapi }: { strapi: any }) => ({
  async getOverview() {
    const now = new Date().toISOString();

    const [
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      processingCopies,
      lostCopies,
      borrowingCount,
      overdueCount,
      activePatrons,
    ] = await Promise.all([
      strapi.db.query("api::book.book").count(),
      strapi.db.query("api::copy.copy").count(),
      strapi.db
        .query("api::copy.copy")
        .count({ where: { circulationStatus: "available" } }),
      strapi.db
        .query("api::copy.copy")
        .count({ where: { circulationStatus: "borrowed" } }),
      strapi.db
        .query("api::copy.copy")
        .count({ where: { circulationStatus: "processing" } }),
      strapi.db
        .query("api::copy.copy")
        .count({ where: { circulationStatus: "lost" } }),
      strapi.db
        .query("api::loan-item.loan-item")
        .count({ where: { status: "borrowing" } }),
      strapi.db.query("api::loan-item.loan-item").count({
        where: { status: "borrowing", dueDate: { $lt: now } },
      }),
      strapi.db
        .query("api::patron.patron")
        .count({ where: { cardStatus: "active" } }),
    ]);

    return {
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      processingCopies,
      lostCopies,
      borrowingCount,
      overdueCount,
      activePatrons,
    };
  },

  async getTrend(range = "6m") {
    const monthsCount = parseInt(range.replace("m", ""), 10) || 6;
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - monthsCount + 1,
      1,
    );

    const [loans, receipts] = await Promise.all([
      strapi.db.query("api::loan.loan").findMany({
        where: { loanedAt: { $gte: startDate.toISOString() } },
        select: ["loanedAt"],
      }),
      strapi.db.query("api::return-receipt.return-receipt").findMany({
        where: { returnedAt: { $gte: startDate.toISOString() } },
        select: ["returnedAt"],
      }),
    ]);

    const trendMap = new Map<
      string,
      { label: string; borrowed: number; returned: number }
    >();
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      trendMap.set(label, { label, borrowed: 0, returned: 0 });
    }

    loans.forEach((l: any) => {
      if (!l.loanedAt) return;
      const d = new Date(l.loanedAt);
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      if (trendMap.has(label)) trendMap.get(label)!.borrowed++;
    });

    receipts.forEach((r: any) => {
      if (!r.returnedAt) return;
      const d = new Date(r.returnedAt);
      const label = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      if (trendMap.has(label)) trendMap.get(label)!.returned++;
    });

    return Array.from(trendMap.values());
  },

  async getTopCategories(limit = 5) {
    const loanItems = await strapi.db
      .query("api::loan-item.loan-item")
      .findMany({
        populate: {
          copy: {
            populate: {
              book: {
                populate: { category: true },
              },
            },
          },
        },
      });

    const countMap = new Map<string, number>();
    loanItems.forEach((item: any) => {
      const categoryName = item.copy?.book?.category?.name;
      if (categoryName) {
        countMap.set(categoryName, (countMap.get(categoryName) || 0) + 1);
      }
    });

    return Array.from(countMap.entries())
      .map(([categoryName, borrowCount]) => ({ categoryName, borrowCount }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, limit);
  },

  async getRecentLoans(pageSize = 10) {
    const [recentLoans, recentReturns] = await Promise.all([
      strapi.db.query("api::loan.loan").findMany({
        limit: pageSize,
        orderBy: { loanedAt: "DESC" },
        populate: {
          patron: true,
          librarian: true,
          loanItems: {
            populate: { copy: { populate: { book: true } } },
          },
        },
      }),
      strapi.db.query("api::return-receipt.return-receipt").findMany({
        limit: pageSize,
        orderBy: { returnedAt: "DESC" },
        populate: {
          librarian: true,
          loanItem: {
            populate: {
              loan: { populate: { patron: true } },
              copy: { populate: { book: true } },
            },
          },
        },
      }),
    ]);

    const activities: any[] = [];

    recentLoans.forEach((loan: any) => {
      const firstItem = loan.loanItems?.[0];
      activities.push({
        code: loan.code,
        type: "mượn",
        time: loan.loanedAt,
        patron: loan.patron
          ? { fullName: loan.patron.fullName, className: loan.patron.className }
          : null,
        bookTitle: firstItem?.copy?.book?.title || "",
        accessionNo: firstItem?.copy?.accessionNo || "",
        librarian: loan.librarian?.username || "",
        status: loan.status,
      });
    });

    recentReturns.forEach((receipt: any) => {
      const item = receipt.loanItem;
      const patron = item?.loan?.patron;
      activities.push({
        code: receipt.code,
        type: "trả",
        time: receipt.returnedAt,
        patron: patron
          ? { fullName: patron.fullName, className: patron.className }
          : null,
        bookTitle: item?.copy?.book?.title || "",
        accessionNo: item?.copy?.accessionNo || "",
        librarian: receipt.librarian?.username || "",
        status: "completed",
      });
    });

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, pageSize);
  },

  async getDueSoon(hours = 48) {
    const now = new Date();
    const targetTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const items = await strapi.db.query("api::loan-item.loan-item").findMany({
      where: {
        status: "borrowing",
        dueDate: {
          $lte: targetTime.toISOString(),
        },
      },
      orderBy: { dueDate: "ASC" },
      populate: {
        loan: { populate: { patron: true } },
        copy: { populate: { book: true } },
      },
    });

    return items.map((item: any) => {
      const dueDateObj = new Date(item.dueDate);
      const diffMs = dueDateObj.getTime() - now.getTime();
      const hoursLeft = diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60)) : 0;
      const lateDays =
        diffMs < 0 ? Math.ceil(Math.abs(diffMs) / (1000 * 60 * 60 * 24)) : 0;

      return {
        loanItemId: item.documentId,
        patron: item.loan?.patron
          ? {
              fullName: item.loan.patron.fullName,
              className: item.loan.patron.className,
              phone: item.loan.patron.phone,
            }
          : null,
        bookTitle: item.copy?.book?.title || "",
        dueDate: item.dueDate,
        hoursLeft,
        lateDays,
      };
    });
  },
});
