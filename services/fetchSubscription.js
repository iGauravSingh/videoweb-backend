const {stripe} = require("../uits/stripe")

module.exports = async (email) => {
    const response = await stripe.customers.list({
        email: email,
      });

      if (response.data[0]) {
        const customer = response.data[0];
        //console.log(customer.id);
    
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          expand: ["data.plan.product"]
        });
    
        if(subscriptions.data[0]) {
            return subscriptions.data[0].plan.product;
        } else {
            return null
        }
    
        return res.json(subscriptions.data[0]);
      } else {
        return null;
      }
}