const express = require('express');
const quizController = require('../controllers/quizController');
const router = express.Router();

router.get('/', quizController.getQuizzes);
router.get('/:quizId', quizController.getQuizById);
router.get('/:quizId/questions', quizController.getQuizQuestions);
router.post('/:quizId/answers', quizController.submitAnswer);

module.exports = router;