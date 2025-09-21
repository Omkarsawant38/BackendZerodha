const { SignupAuth, LoginAuth } = require('./AuthController');
const {verifyUser} = require('./AuthMiddleware');
const router = require('express').Router();

router.post('/', verifyUser);
router.post('/signup', SignupAuth);
router.post('/login', LoginAuth);
router.get('/', (req, res) => {
  res.send('API is running 🎉');
});


module.exports = router;