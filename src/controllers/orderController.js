const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { calculateCartTotal } = require('../utils/cartTotal');

const getOrders = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const buyOrders = await Order.find({ buyer: userId }).populate('seller', 'firstName lastName email');
        const sellOrders = await Order.find({ seller: userId }).populate('buyer', 'firstName lastName email');
        res.status(StatusCodes.OK).json({ buyOrders, sellOrders });
    } catch (error) {
        next(error);
    }
};

const createOrderFromCart = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const cart = await Cart.findOne({ createdBy: userId }).populate('orderItems.book');

        if (!cart || cart.orderItems.length === 0) {
            throw new BadRequestError('Your cart is empty');
        }

        const itemsBySeller = cart.orderItems.reduce((acc, item) => {
            const sellerId = item.book.createdBy.toString();
            if (!acc[sellerId]) acc[sellerId] = [];
            acc[sellerId].push(item);
            return acc;
        }, {});

        const orders = [];
        for (const [sellerId, items] of Object.entries(itemsBySeller)) {
            const orderItems = items.map((item) => ({
                book: {
                    title: item.book.title,
                    author: item.book.author,
                    condition: item.book.condition,
                },
                price: item.price,
            }));

            const tempCart = { orderItems };
            const buyerLocation = req.user.location;
            const sellerLocation = items[0].book.createdBy.location;
            const orderAmount = calculateCartTotal(tempCart, buyerLocation, sellerLocation);

            const order = await Order.create({
                orderNumber: `ORD-${Date.now()}-${sellerId.slice(-5)}`,
                buyer: userId,
                seller: sellerId,
                items: orderItems,
                total: tempCart.orderItems.reduce((sum, item) => sum + item.price, 0),
                tax: tempCart.tax,
                shippingFee: tempCart.shippingFee,
                orderAmount,
            });

            orders.push(order);
        }

        cart.orderItems = [];
        cart.total = 0;
        await cart.save();

        res.status(StatusCodes.CREATED).json({ message: 'Orders created successfully', orders });
    } catch (error) {
       next(error);
    }
};

const getOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id)
            .populate('buyer', 'firstName lastName email')
            .populate('seller', 'firstName lastName location email');

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        res.status(StatusCodes.OK).json({ order });
    } catch (error) {
        next(error);
    }
};

const updateOrder = async (req, res, next) => {
    try {
      const { id: orderId } = req.params;
      const { status } = req.body;
      const userId = req.user.userId;
  
      const allowedStatuses = ['Confirmed', 'Shipped', 'Delivered', 'Cancelled']; 
  
      if (!allowedStatuses.includes(status)) {
        throw new BadRequestError('Invalid status');
      }
  
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }
  
      const isSeller = order.seller.toString() === userId.toString();
  
      if (!isSeller) {
        throw new BadRequestError('You are not authorized to update this order');
      }
  
      order.status = status;
      await order.save();
  
      res.status(StatusCodes.OK).json({
        message: `Order status updated to '${status}' successfully`,
        order,
      });
    } catch (error) {
      console.error('Error updating order status:', error.message);
      next(error);
    }
  };
  const cancelOrder = async (req, res, next) => {
    try {
      const { id: orderId } = req.params;
      const userId = req.user.userId; 
  
      const order = await Order.findById(orderId);
      if (!order) {
        throw new NotFoundError('Order not found');
      }
  
      const isAuthorizedUser = [order.buyer.toString(), order.seller.toString()].includes(userId);

      if (!isAuthorizedUser) {
        throw new BadRequestError('You are not authorized to cancel this order');
      }
  
      if (order.status !== 'Pending') {
        throw new BadRequestError('Only orders with a status of "Pending" can be canceled');
      }
  
      order.status = 'Cancelled';
      await order.save();
  
      res.status(StatusCodes.OK).json({ message: 'Order cancelled successfully', order });
    } catch (error) {
      next(error);
    }
  };
  
  
  
  
  
  

module.exports = {
    getOrders,
    createOrderFromCart,
    getOrder,
    updateOrder,
  cancelOrder
 }