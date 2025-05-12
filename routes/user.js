const express = require('express');
const router = express.Router();

// Route cho trang chủ
router.get('/', (req, res) => {
  res.render('index'); // render view 'index.ejs'
});

module.exports = router;