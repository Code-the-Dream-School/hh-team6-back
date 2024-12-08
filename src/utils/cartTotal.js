const calculateCartTotal = (cart) => {
    const itemsTotal = cart.orderItems.reduce((sum, item) => sum + item.price, 0);
    return itemsTotal + (cart.tax || 0) + (cart.shippingFee || 0);
  };
  
  module.exports = { calculateCartTotal };
  