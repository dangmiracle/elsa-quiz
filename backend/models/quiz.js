const pool = require('../config/database');

exports.getQuizById = async (quizId) => {
    const result = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    return result.rows[0];
};