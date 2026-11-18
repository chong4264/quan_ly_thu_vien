"use strict";

module.exports = {
  async overview(ctx: any) {
    try {
      const data = await strapi.service("api::stat.stat").getOverview();
      return data;
    } catch (err: any) {
      return ctx.badRequest("Lỗi thống kê tổng quan", { error: err.message });
    }
  },

  async trend(ctx: any) {
    try {
      const range = (ctx.query.range as string) || "6m";
      const data = await strapi.service("api::stat.stat").getTrend(range);
      return { data };
    } catch (err: any) {
      return ctx.badRequest("Lỗi thống kê xu hướng", { error: err.message });
    }
  },

  async topCategories(ctx: any) {
    try {
      const limit = parseInt(ctx.query.limit as string, 10) || 5;
      const data = await strapi
        .service("api::stat.stat")
        .getTopCategories(limit);
      return { data };
    } catch (err: any) {
      return ctx.badRequest("Lỗi top thể loại", { error: err.message });
    }
  },

  async recentLoans(ctx: any) {
    try {
      const pageSize = parseInt(ctx.query.pageSize as string, 10) || 10;
      const data = await strapi
        .service("api::stat.stat")
        .getRecentLoans(pageSize);
      return { data };
    } catch (err: any) {
      return ctx.badRequest("Lỗi lấy giao dịch gần nhất", {
        error: err.message,
      });
    }
  },

  async dueSoon(ctx: any) {
    try {
      const hours = parseInt(ctx.query.hours as string, 10) || 48;
      const data = await strapi.service("api::stat.stat").getDueSoon(hours);
      return { data };
    } catch (err: any) {
      return ctx.badRequest("Lỗi lấy danh sách quá hạn", {
        error: err.message,
      });
    }
  },
};
