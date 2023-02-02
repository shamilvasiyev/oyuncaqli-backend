const Order = require("../models/order");
const HttpErrorHandler = require("../models/errorHandler");

const { createTransport } = require("nodemailer");

let transporter = createTransport({
  service: "gmail",
  auth: {
    user: "vasiyevsamil3@gmail.com",
    pass: process.env.MAIL_PASS,
  },
});

let mailOptions = {
  from: "vasiyevsamil@gamil.com",
  to: "oyuncaqliusaq@gmail.com",
  subject: `New Order`,
  html: "",
  attachments: [
    {
      contentType: "application/json",
    },
  ],
};

exports.getAllOrders = async (req, res, next) => {
  let allOrders;

  try {
    allOrders = await Order.find();

    if (!allOrders) {
      allOrders = null;
    }
  } catch (err) {
    const error = new HttpErrorHandler("Orders not found!", 500);
    return next(error);
  }

  res.status(200).set("Content-Range", allOrders.length).json(allOrders);
};

exports.getOneOrder = async (req, res, next) => {
  let order;
  const orderId = req.params.orderId;

  try {
    order = await Order.findById(orderId);
  } catch (err) {
    const error = new HttpErrorHandler("Order not found!", 500);
    return next(error);
  }

  res.status(200).json(order);
};

exports.createOrder = async (req, res, next) => {
  const { name, address, phone, products, totalPrice } = req.body;

  const newOrder = new Order({
    name,
    address,
    phone,
    products,
    totalPrice,
    date: new Date(),
  });

  mailOptions.html = JSON.stringify({
    name,
    address,
    phone,
    totalPrice,
    date: new Date(),
  });

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      res.json(err);
    } else {
      res.json(info);
    }
  });

  console.log(newOrder);

  try {
    if (name === "" && address === "" && phone === "") {
      res.status(422).json({ message: "Məlumatlar daxil edilməmişdir" });
    }

    newOrder.save();

    res
      .status(201)
      .json({ message: "Çox sağolun sifarişiniz alındı", totalPrice });
  } catch (err) {
    const error = new HttpErrorHandler("Product can not create!", 500);
    return next(error);
  }
};
