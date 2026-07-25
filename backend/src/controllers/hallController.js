const { getAllHalls, checkAvailability } = require('../services/hallService');

const getHalls = async (req, res) => {
  try {
    const halls = await getAllHalls();
    res.status(200).json({ halls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { hall_id, date, start_time, end_time } = req.query;

    if (!hall_id || !date) {
      return res.status(400).json({ error: 'hall_id and date are required query parameters' });
    }

    const result = await checkAvailability(hall_id, date, start_time, end_time);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getHalls, getAvailability };
