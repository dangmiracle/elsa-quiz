const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.post('/quizzes', adminController.createQuiz);
router.post('/quizzes/:quizId/questions', adminController.addQuestion);

module.exports = router;
