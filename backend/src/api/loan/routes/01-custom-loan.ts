export default {
  routes: [
    // Các API bạn đã có sẵn
    { method: "GET", path: "/loans/shift-history", handler: "loan.shiftHistory", config: { policies: ["global::is-library-staff"] } },
    { method: "POST", path: "/loans/checkout", handler: "loan.checkout", config: { policies: ["global::is-library-staff"] } },
    { method: "POST", path: "/loans/return", handler: "loan.returnBook", config: { policies: ["global::is-library-staff"] } },

    // Các API mới bổ sung theo yêu cầu
    { method: "GET", path: "/loans/status-counts", handler: "loan.getStatusCounts", config: { policies: ["global::is-library-staff"] } },
    { method: "GET", path: "/loans/admin-list", handler: "loan.getAdminList", config: { policies: ["global::is-library-staff"] } },
    { method: "GET", path: "/loans/:documentId/print", handler: "loan.getPrintData", config: { policies: ["global::is-library-staff"] } },
  ],
};