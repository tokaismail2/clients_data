const User = require('./userModel');
require("dotenv").config();
const { sendEmail } = require('./utils/sendEmail');

const data = async (req, res) => {
  try {
    const { email, phone, name, note } = req.body;

    if (!name || !email || !phone) {
      return res.status(404).json({
        success: false,
        message: "name, email, phone are required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already used",
      });
    }

    const newUser = new User({
      name,
      email,
      phone,
      note,
    });

    const savedUser = await newUser.save();


    try {
      await sendEmail({
        to: savedUser.email,
        subject: "مرحباً بك في موقعنا",
        message: `أهلاً ${savedUser.name},\n\nشكرًا لتسجيلك معنا! نحن سعداء بانضمامك 💙\n\nفريق الدعم.`,
      });

    
      await sendEmail({
        to: process.env.COMPANY_ACCOUNT, 
        subject: "New User Registration",
        message: `
A new user has registered:

Name: ${savedUser.name}
Email: ${savedUser.email}
Phone: ${savedUser.phone}
Note: ${savedUser.note ?? "N/A"}

        `,
      });

    } catch (mailErr) {
      console.error("Failed to send email:", mailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Data registered successfully",
      user: savedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  data,
};
