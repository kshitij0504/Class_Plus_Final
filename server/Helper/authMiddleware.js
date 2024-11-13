const prisma = require("../config/connectDb");

const jwt = require("jsonwebtoken");

async function adminRole(req, res, next) {
  try {
    const token = req.cookies.token
    console.log(token)
    
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log(decoded)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    console.log(user.role)

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ error: "Not authorized as admin" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = adminRole