const Cart = require('../models/Cart');
const Book = require('../models/Book');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get the user's cart
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
  
    const cart = await Cart.findOne({ createdBy: userId }).populate('orderItems.book');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
};

// Add an item to the cart
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId, title, image, price, isAvailable } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.isAvailable) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    let cart = await Cart.findOne({ createdBy: userId });
    if (!cart) {
      cart = new Cart({
        createdBy: userId,
        tax: 0,
        shippingFee: 0,
        total: 0,
        orderItems: [],
        clientSecret: '',
      });
    }

    const existingItem = cart.orderItems.find(item => item.book.toString() === bookId);
    if (existingItem) {
      return res.status(400).json({ message: 'Item already in cart' });
    }

    cart.orderItems.push({ book: bookId, title, image, price, isAvailable });
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    next(error);
  }
};

// Create a Stripe payment intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const userId = req.user.userId;;
    const cart = await Cart.findOne({ createdBy: userId });

    if (!cart || cart.orderItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Calculate total amount
    const totalAmount = Math.round(cart.total * 100); // Convert to cents

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    // Save payment intent details to cart
    cart.clientSecret = paymentIntent.client_secret;
    cart.paymentIntentId = paymentIntent.id;
    await cart.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

// Confirm payment success
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    console.log(req.body);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Update cart status to 'paid'
    const cart = await Cart.findOneAndUpdate(
      { paymentIntentId },
      { status: 'paid' },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ message: 'Payment successful', cart });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getCart,
  addToCart,
  createPaymentIntent,
  confirmPayment,
};