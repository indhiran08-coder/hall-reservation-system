const bcrypt = require('bcryptjs');
const supabase = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, staff_id, department, college_email, personal_email, phone, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { personal_email, phone, department, password, new_password } = req.body;

    const updates = {};
    if (personal_email) updates.personal_email = personal_email.trim().toLowerCase();
    if (phone) updates.phone = phone.trim();
    if (department) updates.department = department.trim();

    // Password change flow
    if (new_password && password) {
      const { data: user } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', req.user.id)
        .single();

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

      updates.password_hash = await bcrypt.hash(new_password, 12);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, first_name, last_name, staff_id, department, college_email, personal_email, phone')
      .single();

    if (error) throw new Error('Failed to update profile');

    res.status(200).json({ message: 'Profile updated successfully', user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProfile, updateProfile };
