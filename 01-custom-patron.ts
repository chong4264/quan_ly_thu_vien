export default {
  routes: [
    {
      method: "GET",
      path: "/patrons/admin-list",
      handler: "patron.adminList",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/patrons/import",
      handler: "patron.import",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/patrons/bulk-lock",
      handler: "patron.bulkLock",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/patrons/bulk-unlock",
      handler: "patron.bulkUnlock",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/patrons/export-cards",
      handler: "patron.exportCards",
      config: { policies: [] },
    },
  ],
};
