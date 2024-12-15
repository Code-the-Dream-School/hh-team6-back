const TAX_RATE = 0.08;
const SHIPPING_FEE = 5.0;
const INTERNATIONAL_FEE = 10.0;

const calculateCartTotal = (cart, buyerLocation = null, sellerLocation = null) => {
  const itemsTotal = cart.orderItems.reduce((sum, item) => sum + item.price, 0);

  const tax = parseFloat((itemsTotal * TAX_RATE).toFixed(2));

  let shippingFee = SHIPPING_FEE;
  if (buyerLocation && sellerLocation) {
    if (buyerLocation.country !== sellerLocation.country) {
      shippingFee += INTERNATIONAL_FEE;
    }
  }
  shippingFee = parseFloat(shippingFee.toFixed(2));

  const total = parseFloat((itemsTotal + tax + shippingFee).toFixed(2));

  cart.tax = tax;
  cart.shippingFee = shippingFee;

  return total;
};

module.exports = { calculateCartTotal };
