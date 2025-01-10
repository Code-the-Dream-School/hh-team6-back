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
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: {
        type: String,
        required: true,
        validate: {
          validator: function (v) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: props => `${props.value} is not a valid email!`
        }
      },
      country: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String }, 
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentIntentId: {
      type: String,
      required: true, 
    },

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
