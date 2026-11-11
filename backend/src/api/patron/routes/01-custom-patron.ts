export default {
  routes: [
    ...[
      { method: 'GET', path: '/patrons/manage/options', handler: 'patron.staffOptions' },
      { method: 'GET', path: '/patrons/manage', handler: 'patron.staffList' },
      { method: 'POST', path: '/patrons/manage', handler: 'patron.staffCreate' },
      { method: 'GET', path: '/patrons/manage/:documentId', handler: 'patron.staffFind' },
      { method: 'PUT', path: '/patrons/manage/:documentId', handler: 'patron.staffUpdate' },
      { method: 'DELETE', path: '/patrons/manage/:documentId', handler: 'patron.staffDelete' },
    ].map((route) => ({ ...route, config: { auth: {}, policies: ['global::is-library-staff'] } })),
    {
      method: "GET",
      path: "/patrons/lookup",
      handler: "patron.lookup",
      config: {
        auth: {},
        policies: ['global::is-library-staff'],
      },
    },
    {
      method: "GET",
      path: "/patrons/me",
      handler: "patron.getMe",
      config: {
        auth: {},
      },
    },
    {
      method: "PUT",
      path: "/patrons/me",
      handler: "patron.updateMe",
      config: { auth: {} },
    },
  ],
};
