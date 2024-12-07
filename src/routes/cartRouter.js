const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  createPaymentIntent,
  confirmPayment,
} = require('../controllers/cartController');
const auth = require('../middleware/authentication');


 
// Get the user's cart//
router.get('/', auth, getCart);

// Add an item to the cart
router.post('/', auth, addToCart);

// Create a payment intent
router.post('/create-payment-intent', auth, createPaymentIntent);

// Confirm payment success
router.post('/confirm-payment', auth, confirmPayment);

module.exports = router;
