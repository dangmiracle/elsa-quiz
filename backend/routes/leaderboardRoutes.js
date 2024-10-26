const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const router = express.Router();

router.get('/global', leaderboardController.getGlobalLeaderboard);
router.get('/:quizId', leaderboardController.getQuizLeaderboard);

module.exports = router;
