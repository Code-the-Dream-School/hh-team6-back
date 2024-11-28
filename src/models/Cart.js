const mongoose = require('mongoose');

const SingleCartItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    book: {
      type: mongoose.Schema.ObjectId,
      ref: 'Book',
      required: true,
    },
    isAvailable: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const CartSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
      min: [0, 'Tax cannot be negative'],
    },
    shippingFee: {
      type: Number,
      required: true,
      min: [0, 'Shipping fee cannot be negative'],
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    orderItems: [SingleCartItemSchema],
    status: {
      type: String,
      enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);
CartSchema.pre('save', async function (next) {
    try {
      const bookIds = this.orderItems.map(item => item.book);
      const books = await mongoose.model('Book').find({ _id: { $in: bookIds } });
      const unavailableBooks = books.filter(book => !book.isAvailable);
      if (unavailableBooks.length > 0) {
        return next(new Error('One or more books are not available.'));
      }
      const itemsTotal = this.orderItems.reduce((sum, item) => sum + item.price, 0);
      this.total = itemsTotal + this.tax + this.shippingFee;  
      next();
    } catch (error) {
      next(error);
    }
  });

module.exports = mongoose.model('Cart', CartSchema);
