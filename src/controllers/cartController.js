const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { calculateCartTotal } = require('../utils/cartTotal');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ createdBy: userId }).populate({
       path: 'orderItems.book',
       populate: {
         path: 'createdBy',
         select: 'firstName lastName location email',
       },
     });

    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    const updatedItems = cart.orderItems.filter(
      (item) => item.book && item.book.isAvailable
    );
    if (updatedItems.length !== cart.orderItems.length) {
      cart.orderItems = updatedItems;
      cart.total = calculateCartTotal(cart);
      await cart.save();
      return res.status(StatusCodes.OK).json({
        msg: 'Some unavailable books were removed from your cart.',
        cart,
      });
    }
    // Add seller details to each order item
    const orderItemsWithSeller = cart.orderItems.map((item) => {
      const book = item.book;
      return {
        ...item.toObject(),
        sellerName: book?.createdBy
          ? `${book.createdBy.firstName} ${book.createdBy.lastName}`
          : 'Unknown Seller',
        sellerLocation: book?.createdBy?.location || 'Location not provided',
      };
    });
    res.status(StatusCodes.OK).json({
      cart: {
        ...cart.toObject(),
        orderItems: orderItemsWithSeller, 
      },
    });
  } catch (error) {
    next(error);
  }
};
const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book || !book.isAvailable) {
      throw new BadRequestError('Book is unavailable or does not exist');
    }
    let cart = await Cart.findOne({ createdBy: userId });
    if (!cart) {
      cart = await Cart.create({ createdBy: userId });
    }
    const exists = cart.orderItems.some(
      (item) => item.book.toString() === bookId
    );
    if (exists) throw new BadRequestError('Book is already in the cart');
    cart.orderItems.push({
      book: book._id,
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      price: book.price,
      isAvailable: book.isAvailable,
    });
    
    cart.total = calculateCartTotal(cart);
    await cart.save();
    res.status(201).json({ message: 'Book added to cart', cart });
  } catch (error) {
    next(error);
   }
 };


 const deleteFromCart = async (req, res, next) => {
   try {
     const userId = req.user.userId;
    const { id: cartItemId } = req.params;
    const updatedCart = await Cart.findOneAndUpdate(
      { createdBy: userId },
      { $pull: { orderItems: { _id: cartItemId } } },
      { new: true }
    );
    if (!updatedCart) {
      throw new NotFoundError('Cart not found');
    }
    updatedCart.total = calculateCartTotal(updatedCart);
    await updatedCart.save();
    const populatedCart = await updatedCart.populate({
      path: 'orderItems.book',
      populate: {
        path: 'createdBy',
        select: 'firstName lastName location',
      },
    });
    res.status(StatusCodes.OK).json({
      msg: 'Item removed successfully',
      cart: {
        ...populatedCart.toObject(),
        orderItems: populatedCart.orderItems.map((item) => {
          const book = item.book;
          return {
            ...item.toObject(),
            sellerName: book?.createdBy
              ? `${book.createdBy.firstName} ${book.createdBy.lastName}`
              : 'Unknown Seller',
            sellerLocation: book?.createdBy?.location || 'Location not provided',
          };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};
// 


const createPaymentIntent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ createdBy: userId }).populate(
      'orderItems.book'
    );

    if (cart.orderItems.length === 0) {
      throw new BadRequestError('Your cart is empty');
    }

    if (cart.status === 'paid') {
      return res.status(StatusCodes.OK).json({ msg: 'Payment already processed', cart });
    }

    if (cart.clientSecret) {
      const paymentIntent = await stripe.paymentIntents.retrieve(cart.paymentIntentId);
      if (paymentIntent.status === 'requires_payment_method') {
        cart.clientSecret = null;
        cart.paymentIntentId = null;
        await cart.save();
      } else {
        return res.status(StatusCodes.OK).json({ clientSecret: cart.clientSecret });
      }
    }

    const totalAmount = Math.round(cart.total * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
    });

    cart.clientSecret = paymentIntent.client_secret;
    cart.paymentIntentId = paymentIntent.id;
    await cart.save();

    res.status(StatusCodes.OK).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};
// Confirm payment
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestError('Payment was not successful');
    }
    const cart = await Cart.findOneAndUpdate(
      { paymentIntentId },
      { status: 'paid' },
      { new: true }
    );
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }
    res.status(StatusCodes.OK).json({ msg: 'Payment successful', cart });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getCart,
  addToCart,
  deleteFromCart,
  createPaymentIntent,
  confirmPayment,
};