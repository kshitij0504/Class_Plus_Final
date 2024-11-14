const jwt = require("jsonwebtoken");
const prisma = require("../config/connectDb");
const bcryptjs = require("bcryptjs");

async function checkEmail(req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        avatar: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        error: true,
      });
    }

    // Verify password
    const verifyPassword = await bcryptjs.compare(password, user.password);
    if (!verifyPassword) {
      return res.status(400).json({
        message: "Invalid password",
        error: true,
      });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      role: user.role,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d", // Token valid for 1 day
    });

    // Set cookie options
    const cookieOptions = {
      httpOnly: true, // Prevents client-side access
      secure: true, // Enable in production (HTTPS)
      sameSite: 'Strict', // Helps prevent CSRF attacks
      path: '/', // Accessible across the entire site
    };

    // Set cookie and send response
    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        message: "Login successful",
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            avatar: user.avatar,
          },
        },
      });
  } catch (error) {
    console.error("Error in checkEmail:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
    });
  }
}

module.exports = checkEmail;
