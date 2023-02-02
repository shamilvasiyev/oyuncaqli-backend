const express = require("express");
const productController = require("../controllers/product");
// const store = require("../utils/multer");

const router = express.Router();

router.get("/", productController.getAllProducts);

router.get("/filter", productController.getProductsWithFilter);

router.get("/:pId", productController.getSimpleProductAdmin);

router.post("/", productController.addNewProduct);

router.put("/:pId", productController.updateProduct);

router.delete("/:pId", productController.deleteProduct);

module.exports = router;
