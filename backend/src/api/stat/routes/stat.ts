export default {
  routes: [
    {
      method: "GET",
      path: "/stats/overview",
      handler: "stat.overview",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/stats/trend",
      handler: "stat.trend",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/stats/top-categories",
      handler: "stat.topCategories",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/loans/recent",
      handler: "stat.recentLoans",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/loan-items/due-soon",
      handler: "stat.dueSoon",
      config: { policies: [] },
    },
  ],
};
