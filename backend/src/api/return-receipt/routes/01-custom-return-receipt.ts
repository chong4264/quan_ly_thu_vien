export default {
  routes: [
    { method: "GET", path: "/return-receipts/shift-history", handler: "return-receipt.shiftHistory", config: { policies: [] } },
  ],
};
