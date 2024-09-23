const bcryptjs = require("bcryptjs");
const prisma = require("../config/connectDb")

const updateUser = async (req, res) => {

  const userId = Number(req.user.id);
  const paramUserId = Number(req.params.userId);

  if (userId !== paramUserId) {
    return res
      .status(403)
      .json({ message: "You are not allowed to update this user" });
  }

  let hashpassword;
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const salt = await bcryptjs.genSalt(10);
    hashpassword = await bcryptjs.hash(req.body.password, salt);
  }

  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return res
        .status(400)
        .json({ message: "Username must be between 7 and 20 characters " });
    }

    if (req.body.username.includes(" ")) {
      return res
        .status(400)
        .json({ message: "Username cannot contain spaces" });
    }

    if (req.body.username !== req.body.username.toLowerCase()) {
      return res.status(400).json({ message: "Username must be lowercase" });
    }

    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return res
        .status(400)
        .json({ message: "Username only contains letters and numbers" });
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: paramUserId,
      },
      data: {
        username: req.body.username,
        email: req.body.email,
        avatar: req.body.avatar,
        password: hashpassword,
      },
    });
    const { password, ...rest } = updatedUser;
    res.status(200).json(rest);
  } catch (error) {
    return res.status(500).json({ message: "Not updated" });
  }
};

module.exports = updateUser;
