const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Adjust based on file structure

// Route to get total score of a user
router.get('/total-score', userController.getTotalScore);

module.exports = router;
