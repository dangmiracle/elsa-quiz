// Import Prisma client
const prisma = require('../config/database');

// Create a new quiz
exports.createQuiz = async (req, res) => {
    const { title, description } = req.body;
    try {
        const quiz = await prisma.quiz.create({
            data: { title, description }
        });
        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ success: false, message: 'Failed to create quiz' });
    }
};

// Add a question to an existing quiz
exports.addQuestion = async (req, res) => {
    const { quizId } = req.params;
    const { questionText, difficulty, score, options, type } = req.body;

    try {
        const question = await prisma.question.create({
            data: {
                questionText,
                difficulty,
                score,
                type,
                options: {
                    create: options  // options should be an array of { optionText, isCorrect }
                },
                quizzes: {
                    connect: { id: quizId }
                }
            }
        });
        res.status(201).json({ success: true, data: question });
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ success: false, message: 'Failed to add question' });
    }
};
