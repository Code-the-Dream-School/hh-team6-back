const express = require('express');
const {
  getAllOrdersAsBuyer,
  getAllOrdersAsSeller,
  createOrderFromCart,
  getOrder,
  updateOrder,
} = require('../controllers/orderController');
const auth = require('../middleware/authentication');

const router = express.Router();

router.get('/buyer', auth, getAllOrdersAsBuyer); 
router.get('/seller', auth, getAllOrdersAsSeller); 
router.post('/', auth, createOrderFromCart); 
router.get('/:id', auth, getOrder); 
router.patch('/:id', auth, updateOrder); 

module.exports = router;
