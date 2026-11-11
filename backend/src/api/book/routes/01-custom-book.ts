// Đặt tên bắt đầu bằng "01-" để được nạp trước route /books/:id của core
export default {
  routes: [
    { method: "GET", path: "/books/search", handler: "book.search", config: { policies: [] } },
    { method: "GET", path: "/books/new-arrivals", handler: "book.newArrivals", config: { policies: [] } },
    { method: "GET", path: "/books/facets", handler: "book.facets", config: { policies: [] } },
    { method: "GET", path: "/books/:documentId/detail", handler: "book.detail", config: { policies: [] } },
    { method: "GET", path: "/books/:documentId/related", handler: "book.related", config: { policies: [] } },
  ],
};
