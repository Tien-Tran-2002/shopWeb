const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST /payment/callback — MoMo server-to-server callback
router.post('/callback', async (req, res) => {
  const { resultCode, extraData } = req.body;
  if (resultCode === 0 && extraData) {
    // extraData chứa order._id
    await Order.findByIdAndUpdate(extraData, { status: 'PAID' });
  }
  res.status(200).json({ message: 'Callback nhận thành công' });
});

module.exports = router;
