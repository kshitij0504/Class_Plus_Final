const jwt = require("jsonwebtoken");

const getUserDetailstoken = (req, res, next) => {
  const token = req.cookies.token;
  console.log("Token from cookie:", token);
  if (!token) {
    console.log("No token found"); 
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      console.log("Token verification failed"); // Debug log
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    console.log("User authenticated:", user); // Debug log
    next();
  });
};


module.exports = getUserDetailstoken;