export default {
  routes: [
    { method: "GET", path: "/patrons/lookup", handler: "patron.lookup", config: { policies: [] } },
  ],
};
