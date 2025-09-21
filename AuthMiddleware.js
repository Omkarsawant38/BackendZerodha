const jwt = require("jsonwebtoken");
const User = require("./models/UserModel");

const verifyUser = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ status: false });

  try {
    const decoded = jwt.verify(token, "your-secret-key"); // use your token secret
    const user = await User.findById(decoded.id).select("-password"); // ✅ fetch full user
    if (!user) return res.json({ status: false });

    return res.json({ status: true, user }); // ✅ send full user object
  } catch (err) {
    return res.json({ status: false });
  }
};

module.exports = { verifyUser };
