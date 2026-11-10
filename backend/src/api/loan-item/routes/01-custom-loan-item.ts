export default {
  routes: [
    { method: "GET", path: "/loan-items/by-patron", handler: "loan-item.byPatron", config: { policies: [] } },
    { method: "POST", path: "/loan-items/bulk-renew", handler: "loan-item.bulkRenew", config: { policies: [] } },
    { method: "POST", path: "/loan-items/:documentId/renew", handler: "loan-item.renew", config: { policies: [] } },
  ],
};
