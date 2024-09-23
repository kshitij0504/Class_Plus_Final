const prisma = require('../config/connectDb')
const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

async function signup(req, res) {
  try {
    const { username, email, password } = req.body;

    if (
      !username ||
      !email ||
      !password ||
      username === "" ||
      email === "" ||
      password === ""
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const checkEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (checkEmail) {
      return res.status(400).json({
        message: "User already exists with this email",
        error: true,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashpassword = await bcryptjs.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashpassword,
      },
    });

    await sendOTPverification(email);

    return res.status(201).json({
      message: "User created successfully",
      data: newUser,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

async function sendOTPverification(email) {
  const otp = otpGenerator.generate(4, {
    digits: true,
    alphabets: false, // Ensure alphabets are not included
    upperCase: false, // Ensure no uppercase letters are included
    specialChars: false,
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await prisma.userVerification.create({
      data: {
        userID: user.id,
        otp,
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "mozakshitij@gmail.com",
        pass: "nlni qcfk mjur qloa",
      },
    });
    const OTPTemplate = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class Plus - OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007BFF;
            color: white;
            padding: 10px 0;
            text-align: center;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            margin: 20px 0;
            color: #333333;
        }
        .otp-box {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 10px;
            font-size: 16px;
            color: #007BFF;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            text-align: center;
            color: #888;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://drive.google.com/file/d/16ruovgdNFN9hmGQeKNwOtrp3xDCyb0R3/view?usp=sharing" alt="Class Plus Logo">
            <h1>OTP Verification</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Please use the following OTP to verify your email address for the Class Plus platform:</p>
            <div class="otp-box">
                <strong>${otp}</strong>
            </div>
            <p>This OTP is valid for a limited time. Please complete the verification process as soon as possible.</p>
            <p>If you did not request this OTP, please ignore this email or contact our support team.</p>
            <p>Thank you for choosing Class Plus!</p>
            <p>Best regards,</p>
            <p>The Class Plus Team</p>
        </div>
        <div class="footer">
            <p>If you have any questions or need assistance, please contact our support team.</p>
        </div>
    </div>
</body>
</html>
`;

    await transporter.sendMail({
      from: "kshitijoza20@gmail.com",
      to: email,
      subject: "OTP Verification",
      html: OTPTemplate,
    });

    return "OTP sent successfully";
  } catch (error) {
    throw error;
  }
}

async function sendGeneratedPassword(email, password) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "mozakshitij@gmail.com",
      pass: "nlni qcfk mjur qloa",
    },
  });

  const emailTemplate = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Class Plus - Your New Password</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              background-color: #007BFF;
              color: white;
              padding: 10px 0;
              text-align: center;
          }
          .header img {
              max-width: 150px;
          }
          .content {
              margin: 20px 0;
              color: #333333;
          }
          .password-box {
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              padding: 10px;
              font-size: 16px;
              color: #007BFF;
              margin: 20px 0;
              text-align: center;
          }
          .footer {
              text-align: center;
              color: #888;
              font-size: 12px;
              margin-top: 20px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <img src="https://drive.google.com/file/d/16ruovgdNFN9hmGQeKNwOtrp3xDCyb0R3/view?usp=sharing" alt="Class Plus Logo">
              <h1>Welcome to Class Plus</h1>
          </div>
          <div class="content">
              <p>Hello,</p>
              <p>Your account has been successfully created. Below is your password to access the Class Plus platform:</p>
              <div class="password-box">
                  <strong>${password}</strong>
              </div>
              <p>Please use this password to log in and change it as soon as possible for security reasons.</p>
              <p>Thank you for joining Class Plus. We are excited to have you on board!</p>
              <p>Best regards,</p>
              <p>The Class Plus Team</p>
          </div>
          <div class="footer">
              <p>If you did not create an account, please ignore this email or contact our support team.</p>
          </div>
      </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: "kshitijoza20@gmail.com",
    to: email,
    subject: "Your Account Password",
    html: emailTemplate,
  });
}

async function VerifyOTP(req, res) {
  const { email, otp } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otpRecord = await prisma.userVerification.findUnique({
      where: { userID: user.id },
    });

    if (otpRecord && otpRecord.otp === otp) {
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
}

async function GoogleAuth(req, res) {
  const { username, email, googlePhotoURL } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const payload = {
        id: user.id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      const cookieOptions = {
        httpOnly: true,
        secure: true,
      };

      res.cookie("token", token, cookieOptions);
      return res.status(200).json({
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
            avatar: user.avatar,
          },
        },
      });
    } else {
      const generatePassword = Math.random().toString(36).slice(-8);
      const salt = await bcryptjs.genSalt(10);
      const hashpassword = await bcryptjs.hash(generatePassword, salt);

      const newUser = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: hashpassword,
          avatar: googlePhotoURL,
        },
      });

      await sendGeneratedPassword(email, generatePassword);

      const payload = {
        id: newUser.id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: "1d",
      });

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      res.cookie("token", token, cookieOptions);
      return res.status(200).json({
        message: "Registration and login successful",
        success: true,
        data: {
          token: token,
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            avatar: newUser.avatar,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
}

async function signOut(req, res) {
  try {
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({
      message: "Sign out successful",
      success: true,
    });
  } catch (error) {
    console.error("Sign out error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
}
module.exports = {
  signup,
  sendOTPverification,
  VerifyOTP,
  GoogleAuth,
  signOut,
};