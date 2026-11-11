export default {
  routes: [
    { method: "GET", path: "/copies/lookup", handler: "copy.lookup", config: { policies: ["global::is-library-staff"] } },
  ],
};
