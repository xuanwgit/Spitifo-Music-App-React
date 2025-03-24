import Admin from '../models/adminModel.js';
import jwt from 'jsonwebtoken';

// create token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// login admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.login(email, password);
    const token = createToken(admin._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// signup admin
export const signupAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.signup(email, password);
    const token = createToken(admin._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 