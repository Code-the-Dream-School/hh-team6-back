const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { calculateCartTotal } = require('../utils/cartTotal');

const getAllOrdersAsBuyer = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.find({ buyer: userId });

        if (!orders.length) {
            throw new NotFoundError('No orders found for this buyer');
        }

        res.status(StatusCodes.OK).json({ orders });
    } catch (error) {
        next(error);
    }
};

const getAllOrdersAsSeller = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.find({ seller: userId }).populate('buyer', 'firstName lastName email');

        if (!orders.length) {
            throw new NotFoundError('No orders found for this seller');
        }

        res.status(StatusCodes.OK).json({ orders });
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
            .populate('seller', 'firstName lastName location');

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
        const { id } = req.params;
        const { status } = req.body;
        const allowedStatuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

        if (!allowedStatuses.includes(status)) {
            throw new BadRequestError('Invalid status');
        }

        const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        res.status(StatusCodes.OK).json({ message: 'Order status updated successfully', order });
    } catch (error) {
        next(error);
    }
};

const cancelOrder = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true, runValidators: true });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        res.status(StatusCodes.OK).json({ msg: 'Order cancelled successfully', order });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllOrdersAsBuyer,
    getAllOrdersAsSeller,
    createOrderFromCart,
    getOrder,
    updateOrder,
    cancelOrder,
};
