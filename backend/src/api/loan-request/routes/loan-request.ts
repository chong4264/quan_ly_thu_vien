export default {
  routes: [
    { method: "GET", path: "/loan-requests/me", handler: "loan-request.mine", config: { policies: [] } },
    { method: "POST", path: "/loan-requests", handler: "loan-request.createMine", config: { policies: [] } },
    { method: "POST", path: "/loan-requests/:documentId/cancel", handler: "loan-request.cancelMine", config: { policies: [] } },
    { method: "GET", path: "/loan-requests/admin", handler: "loan-request.adminList", config: { policies: ["global::is-library-staff"] } },
    { method: "POST", path: "/loan-requests/:documentId/fulfill", handler: "loan-request.fulfill", config: { policies: ["global::is-library-staff"] } },
    { method: "POST", path: "/loan-requests/:documentId/reject", handler: "loan-request.reject", config: { policies: ["global::is-library-staff"] } }
  ]
};
