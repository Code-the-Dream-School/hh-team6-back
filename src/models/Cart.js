const mongoose = require('mongoose');

const SingleCartItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    book: { type: mongoose.Schema.ObjectId, ref: 'Book', required: true },
    isAvailable: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const CartSchema = new mongoose.Schema(
  {
    tax: { type: Number, default: 0, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    orderItems: [SingleCartItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    clientSecret: { type: String, default: '' },
    paymentIntentId: { type: String },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
