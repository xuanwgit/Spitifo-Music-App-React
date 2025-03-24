import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

const requireAdmin = async (req, res, next) => {
  // verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authorization.split(' ')[1];

  try {
    // verify token
    const { _id } = jwt.verify(token, process.env.SECRET);

    // check if user is an admin
    const admin = await Admin.findOne({ _id }).select('_id');
    if (!admin) {
      return res.status(401).json({ error: 'Request is not authorized - Admin access required' });
    }

    req.user = admin;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

export default requireAdmin;
