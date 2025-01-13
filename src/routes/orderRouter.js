const express = require('express');
const {
getOrders,
  createOrderFromCart,
  getOrder,
  updateOrder
} = require('../controllers/orderController');
const auth = require('../middleware/authentication');

const router = express.Router();

router.get('/', auth, getOrders); 
router.post('/', auth, createOrderFromCart); 
router.get('/:id', auth, getOrder); 
router.patch('/:id', auth, updateOrder); 

module.exports = router;
