/**
 * book controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::book.book', ({ strapi }) => ({
  /** GET /api/books/search?q=&category=&language=&available=1&sort=&page=&pageSize= */
  async search(ctx) {
    ctx.body = await strapi.service('api::book.book').search(ctx.query as any);
  },

  /** GET /api/books/new-arrivals?limit=8 */
  async newArrivals(ctx) {
    ctx.body = await strapi.service('api::book.book').newArrivals(ctx.query as any);
  },

  /** GET /api/books/facets – thể loại, ngôn ngữ và số liệu cho bộ lọc */
  async facets(ctx) {
    ctx.body = await strapi.service('api::book.book').facets();
  },

  /** GET /api/books/:documentId/detail – thông tin đầy đủ + danh sách bản sao */
  async detail(ctx) {
    ctx.body = await strapi.service('api::book.book').detail(ctx.params.documentId);
  },

  /** GET /api/books/:documentId/related?limit=4 – sách cùng thể loại */
  async related(ctx) {
    ctx.body = await strapi.service('api::book.book').related(ctx.params.documentId, ctx.query as any);
  },
}));
