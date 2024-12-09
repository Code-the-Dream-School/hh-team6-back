const TAX_RATE = 0.08; // 8% Tax
const SHIPPING_FEE = 5.0; // Flat shipping fee
const INTERNATIONAL_FEE = 10.0; // Additional fee for international shipping

const calculateCartTotal = (cart, buyerLocation = null, sellerLocation = null) => {
  // Subtotal: sum of all order item prices
  const itemsTotal = cart.orderItems.reduce((sum, item) => sum + item.price, 0);

  // Calculate tax (rounded to 2 decimal places)
  const tax = parseFloat((itemsTotal * TAX_RATE).toFixed(2));

  // Calculate shipping fee
  let shippingFee = SHIPPING_FEE;
  if (buyerLocation && sellerLocation) {
    if (buyerLocation.country !== sellerLocation.country) {
      shippingFee += INTERNATIONAL_FEE;
    }
  }
  shippingFee = parseFloat(shippingFee.toFixed(2));

  // Final total (rounded to 2 decimal places)
  const total = parseFloat((itemsTotal + tax + shippingFee).toFixed(2));

  // Update cart properties
  cart.tax = tax;
  cart.shippingFee = shippingFee;

  // Return final total
  return total;
};

module.exports = { calculateCartTotal };
