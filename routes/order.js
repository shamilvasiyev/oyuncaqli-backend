const express = require("express");
const orderController = require("../controllers/order");
// const store = require("../utils/multer");

const router = express.Router();

router.get("/", orderController.getAllOrders);

router.get("/:orderId", orderController.getOneOrder);

router.post("/", orderController.createOrder);

module.exports = router;
