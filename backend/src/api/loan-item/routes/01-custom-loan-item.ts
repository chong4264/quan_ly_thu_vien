export default {
  routes: [
    // API cá nhân: độc giả đang đăng nhập chỉ thao tác trên hồ sơ Patron gắn với tài khoản.
    {
      method: "GET",
      path: "/loan-items/me/current",
      handler: "loan-item.meCurrent",
      config: {
        auth: {},
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/loan-items/me/history",
      handler: "loan-item.meHistory",
      config: {
        auth: {},
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/loan-items/me/:documentId/renew",
      handler: "loan-item.renewMine",
      config: {
        auth: {},
        policies: [],
      },
    },
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