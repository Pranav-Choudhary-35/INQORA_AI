import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";
const isProduction = process.env.NODE_ENV === "production";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
  const { username, email, password } = req.body;

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserAlreadyExists) {
    return res.status(400).json({
      message: "User with this email or username already exists",
      success: false,
      err: "User already exists",
    });
  }

  const user = await userModel.create({ username, email, password });

  const emailVerificationToken = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  const verificationLink = `${getClientUrl()}/verify-email?token=${emailVerificationToken}`;

  await sendEmail({
    to: email,
    subject: "Welcome to INQORA AI - Verify Your Email",
    html: `
      <h2>Welcome to INQORA AI!</h2>
      <p>Hi ${username},</p>
      <p>Thank you for registering at <strong>INQORA AI</strong>. We're excited to have you on board!</p>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
      <p>Best regards,<br>The INQORA Team</p>
    `,
  });

  res.status(201).json({
    message: "User registered successfully. Please verify your email.",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
      success: false,
      err: "User not found",
    });
  }

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    return res.status(400).json({
      message: "Invalid email or password",
      success: false,
      err: "Incorrect password",
    });
  }

  if (!user.verified) {
    return res.status(400).json({
      message: "Please verify your email before logging in",
      success: false,
      err: "Email not verified",
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    message: "Login successful",
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

/**
 * @desc Logout user and clear authentication cookie
 * @route POST /api/auth/logout
 * @access Public
 */
export async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
  const userId = req.user.id;

  const user = await userModel
    .findById(userId)
    .select("_id username email verified");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
      err: "User not found",
    });
  }

  res.status(200).json({
    message: "User details fetched successfully",
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      verified: user.verified,
    },
  });
}

/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid token",
        success: false,
        err: "User not found",
      });
    }

    if (user.verified) {
      return res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 500px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #28a745;">✓ Email Already Verified</h1>
              <p>Your email has already been verified. You can now log in to your account.</p>
              <a href="${getClientUrl()}/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Login</a>
            </div>
          </body>
        </html>
      `);
    }

    user.verified = true;
    await user.save();

    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #28a745;">✓ Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now log in to your account.</p>
            <a href="${getClientUrl()}/login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Login</a>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(400).send(`
      <html>
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #dc3545;">✗ Verification Failed</h1>
            <p>Invalid or expired verification token. Please request a new verification link.</p>
            <a href="${getClientUrl()}/register" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Back to Register</a>
          </div>
        </body>
      </html>
    `);
  }
}

/**
 * @desc Check if user email is verified
 * @route GET /api/auth/check-verified
 * @access Public
 * @query { email }
 */
export async function checkVerified(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
      success: false,
    });
  }

  try {
    const user = await userModel
      .findOne({ email: email.toLowerCase() })
      .select("verified");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        verified: false,
      });
    }

    res.status(200).json({
      message: "Verification status retrieved",
      success: true,
      verified: user.verified,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error checking verification status",
      success: false,
      err: err.message,
    });
  }
}
}
