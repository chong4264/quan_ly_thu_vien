// Đặt tên bắt đầu bằng "01-" để được nạp trước route /loans/:id của core
export default {
  routes: [
    { method: "GET", path: "/loans/shift-history", handler: "loan.shiftHistory", config: { policies: [] } },
    { method: "POST", path: "/loans/checkout", handler: "loan.checkout", config: { policies: [] } },
    { method: "POST", path: "/loans/return", handler: "loan.returnBook", config: { policies: [] } },
  ],
};
