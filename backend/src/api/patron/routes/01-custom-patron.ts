export default {
  routes: [
    {
      method: "GET",
      path: "/patrons/lookup",
      handler: "patron.lookup",
      config: {
        auth: {},
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
  ],
};