const Product = require("../models/product");
const HttpErrorHandler = require("../models/errorHandler");
const fs = require("fs");
const path = require("path");

exports.getAllProducts = async (req, res, next) => {
  let allProducts;

  try {
    if (req.query) {
      allProducts = await Product.find().limit(req.query.limit);
    } else {
      allProducts = await Product.find();
    }

    if (!allProducts) {
      allProducts = null;
    }
  } catch (err) {
    const error = new HttpErrorHandler("Products not found!", 500);
    return next(error);
  }

  res.status(200).set("Content-Range", allProducts.length).json(allProducts);
};

exports.getProductsWithFilter = async (req, res, next) => {
  let filteredProducts;
  let query = {};

  if (req.query.price) {
    let priceIntervalA;
    let priceIntervalB;

    const priceArray = JSON.parse(req.query.price);

    priceIntervalA = priceArray[0];
    priceIntervalB = priceArray[1];

    query.price = { $gte: priceIntervalA, $lte: priceIntervalB };
  }

  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: "i" };
    query.description = { $regex: req.query.search, $options: "i" };
  }

  query = req.query;

  // MUST FIX

  try {
    filteredProducts = await Product.find(query);

    res.status(200).json(filteredProducts);
  } catch (err) {
    const error = new HttpErrorHandler("Products not found!", 404);
    return next(error);
  }
};

exports.getSimpleProductAdmin = async (req, res, next) => {
  let product;
  const pId = req.params.pId;

  try {
    product = await Product.findById(pId);
  } catch (err) {
    const error = new HttpErrorHandler("Product not found!", 500);
    return next(error);
  }

  res.status(200).json(product);
};

exports.addNewProduct = (req, res, next) => {
  const {
    title,
    description,
    price,
    onSalePrice,
    category,
    age,
    brand,
    onStock,
    newArrival,
  } = req.body;

  const images = req.files?.images?.map((img) => {
    return {
      imageUrl: img.path.replace("\\", "/"),
      alt: req.body.title,
    };
  });

  const newProduct = new Product({
    title,
    description,
    price: Number(price),
    category,
    age,
    brand,
    onSalePrice: Number(onSalePrice) || null,
    onStock: Boolean(onStock) || null,
    newArrival: Boolean(newArrival) || null,
    images,
  });

  try {
    newProduct.save();

    res.status(201).json({ data: newProduct });
  } catch (error) {
    const err = new HttpErrorHandler("Product can not create!", 500);
    return next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  let updatedProduct;
  const pId = req.params.pId;

  const {
    title,
    description,
    category,
    age,
    brand,
    price,
    onSalePrice,
    onStock,
    newArrival,
  } = req.body;

  try {
    updatedProduct = await Product.findById(pId);
  } catch (err) {
    const error = new HttpErrorHandler("Product not found!", 500);
    return next(error);
  }

  updatedProduct.title = title;
  updatedProduct.description = description;
  updatedProduct.category = category;
  updatedProduct.age = age;
  updatedProduct.brand = brand;
  updatedProduct.price = Number(price);
  updatedProduct.onSalePrice = Number(onSalePrice) || null;
  updatedProduct.onStock = Boolean(onStock) || null;
  updatedProduct.newArrival = Boolean(newArrival) || null;

  try {
    await updatedProduct.save();
  } catch (err) {
    const error = new HttpErrorHandler("Product can not be updated!", 500);
    return next(error);
  } finally {
    const response = {
      id: updatedProduct._id,
      title: updatedProduct.title,
      description: updatedProduct.description,
      category: updatedProduct.category,
      brand: updatedProduct.brand,
      price: updatedProduct.price,
      onSalePrice: updatedProduct.onSalePrice,
      onStock: updatedProduct.onStock,
      newArrival: updatedProduct.newArrival,
      images: updatedProduct.images,
    };

    res.status(200).json({ data: response });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const pId = req.params.pId;
  let deletedProduct;

  Product.findById(pId)
    .then((product) => {
      if (!product) {
        const error = new HttpErrorHandler("Product not found!", 404);
        return next(error);
      }

      deletedProduct = product;

      product.images.map((img, i) => {
        if (img && img.imageUrl) {
          clearImage(img.imageUrl);
        }
      });

      return Product.findByIdAndDelete(pId);
    })
    .then(() => res.status(200).json({ data: deletedProduct }));
};

// exports.getSingleProduct = async (req, res, next) => {
//   const prodId = req.params.prodId;

//   let product;
//   try {
//     product = await Product.findById(prodId);
//   } catch (err) {
//     const error = new HttpErrorHandler("Product didn't find!", 500);
//     return next(error);
//   }

//   res.status(200).json(product);
// };

const clearImage = (filePath) => {
  const imagePath = path.join(__dirname, "..", filePath);
  fs.unlink(imagePath, (err) => console.log(err));
};
