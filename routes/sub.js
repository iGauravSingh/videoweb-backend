const express = require("express");
const router = express.Router();
const { stripe } = require("../uits/stripe");
const checkAuth = require("../middleware");

router.get("/products", async (req, res) => {
  const response = await stripe.products.list({
    expand: ["data.default_price"],
  });

  const products = response.data.map(({ id, name, default_price }) => {
    return {
      id,
      name,
      canDownload: true,
      canWatchSouth: name === "Premium Plan" ? true : false,
      price: {
        amount: default_price.unit_amount,
        id: default_price.id,
      },
    };
  });

  return res.json(products);
});

router.post("/session", async (req, res) => {
  const { priceId, email, currency } = req.body;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:5173/browse",
    cancel_url: "http://localhost:5173/plans",
    customer_email: email,
    billing_address_collection: currency === "INR" ? "auto" : "required",
    shipping_address_collection: {
      allowed_countries: currency === "INR" ? ["IN"] : [], // Allow India only for INR transactions
    },
  });

  return res.json(session);
});

router.get("/subscription", checkAuth, async (req, res) => {
  const response = await stripe.customers.list({
    email: req.user.email,
  });

  if (response.data[0]) {
    const customer = response.data[0];
    //console.log(customer.id);

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      expand: ["data.plan.product"]
    });

    if(subscriptions.data[0]) {
        return res.json(subscriptions.data[0].plan.product);
    } else {
        return res.send(null)
    }

    return res.json(subscriptions.data[0]);
  } else {
    return res.send(null);
  }
});

module.exports = router;
