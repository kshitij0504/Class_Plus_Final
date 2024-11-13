const jwt = require("jsonwebtoken");
const prisma = require("../config/connectDb")
const bcryptjs = require("bcryptjs");


async function checkEmail(req, res) {
  try {
    const { email, password } = req.body;

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
        role: true
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
        error: true,
      });
    }

    const verifyPassword = await bcryptjs.compare(password, user.password);

    if (!verifyPassword) {
      return res.status(400).json({
        message: "Invalid password",
        error: true,
      });
    }

    

    const payload = {
      id: user.id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1d",
    });

    const cookieOptions = {
      httpOnly: true, 
      // secure: true,   
      sameSite: 'strict',
      // path: '/'
    };

    console.log(token)

    res.cookie("token", token, cookieOptions).json({
      message: "Login successful",
      success: true,
      data: {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          avatar: user.avatar
        },
      },
    })

    // return res.status(200).json({
    // });
  } catch (error) {
    console.error("Error in checkEmail:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
    });
  }
}

module.exports = checkEmail;
