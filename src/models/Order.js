const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        book: {
          bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book', 
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          author: {
            type: String,
            required: true,
          },
          condition: {
            type: String,
            enum: ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'],
            required: true,
          },
          isAvailable: {
            type: Boolean,
            default: false,
          },
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    total: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingFee: {
      type: Number,
      required: true,
      default: 0,
    },
    orderAmount: {
      type: Number,
      required: true,
      default: function () {
        return this.total + this.tax + this.shippingFee;
      },
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    datePlaced: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
