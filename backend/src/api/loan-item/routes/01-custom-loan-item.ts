export default {
  routes: [
    {
      method: "GET",
      path: "/loan-items/by-patron",
      handler: "loan-item.byPatron",
      config: {
        auth: {},
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/loan-items/bulk-renew",
      handler: "loan-item.bulkRenew",
      config: {
        auth: {},
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/loan-items/:documentId/renew",
      handler: "loan-item.renew",
      config: {
        auth: {},
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/notifications/remind",
      handler: "loan-item.remindNotification",
      config: {
        auth: {},
        policies: [],
        middlewares: [],
      },
    },
  ],
};