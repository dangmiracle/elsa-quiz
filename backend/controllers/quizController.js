const prisma = require('../config/database');
const rabbitmq = require('../config/rabbitmq');
const Joi = require('joi');

// Validation schema for submitting an answer
const answerSchema = Joi.object({
    userId: Joi.string().required(),
    questionId: Joi.string().required(),
    optionIds: Joi.array().items(Joi.string()).min(1).required()  // Updated to array of strings
});

// Validation schema for filtering quizzes
const quizListQuerySchema = Joi.object({
    title: Joi.string(),
    description: Joi.string()
});

// Validation schema for quizId parameter
const quizIdParamSchema = Joi.object({
    quizId: Joi.string().required()
});

exports.getQuizQuestions = async (req, res) => {
    // Validate quizId parameter
    const {error: paramError} = quizIdParamSchema.validate(req.params);
    if (paramError) return res.status(400).json({success: false, message: paramError.details[0].message});

    const {quizId} = req.params;
    try {
        const questions = await prisma.quizQuestion.findMany({
            where: {quizId},
            include: {question: {include: {options: true}}}
        });
        res.status(200).json({success: true, data: questions});
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({success: false, message: 'Failed to fetch questions'});
    }
};

exports.submitAnswer = async (req, res) => {
    const { error: bodyError } = answerSchema.validate(req.body);
    if (bodyError) return res.status(400).json({ success: false, message: bodyError.details[0].message });

    const { userId, questionId, optionIds } = req.body;
    const { quizId } = req.params;
    const io = req.app.get('io');

    try {
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: { options: true }
        });

        if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

        const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
        const allOptionsValid = optionIds.every(id => question.options.some(opt => opt.id === id));
        if (!allOptionsValid) return res.status(400).json({ success: false, message: 'Invalid options selected' });

        const isCorrect = optionIds.every(id => correctOptions.includes(id)) && optionIds.length === correctOptions.length;
        const scoreIncrement = isCorrect ? question.score : 0;

        const updatedScore = await prisma.userQuizScore.upsert({
            where: { userId_quizId: { userId, quizId } }, // Compound key
            update: { score: scoreIncrement},
            create: { userId, quizId, score: scoreIncrement }
        });

        try {
            rabbitmq.sendToQueue('score_updates', JSON.stringify({ userId, quizId, score: updatedScore.score }));
        } catch (err) {
            console.error('Failed to send message to RabbitMQ:', err);
        }

        try {
            io.emit('scoreUpdated', { userId, quizId, score: updatedScore.score, isCorrect });
        } catch (err) {
            console.error('Failed to emit event:', err);
        }

        res.status(200).json({ success: true, data: updatedScore, isCorrect });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ success: false, message: 'Error submitting answer' });
    }
};

exports.getQuizzes = async (req, res) => {
    const {error: queryError} = quizListQuerySchema.validate(req.query);
    if (queryError) return res.status(400).json({success: false, message: queryError.details[0].message});

    const {title, description} = req.query;

    try {
        const quizzes = await prisma.quiz.findMany({
            where: {
                ...(title && {title: {contains: title, mode: 'insensitive'}}),
                ...(description && {description: {contains: description, mode: 'insensitive'}})
            }
        });
        res.status(200).json({success: true, data: quizzes});
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({success: false, message: 'Failed to fetch quizzes'});
    }
};

exports.getQuizById = async (req, res) => {
    const {error: paramError} = quizIdParamSchema.validate(req.params);
    if (paramError) return res.status(400).json({success: false, message: paramError.details[0].message});

    const {quizId} = req.params;

    try {
        const quiz = await prisma.quiz.findUnique({
            where: {id: quizId},
            include: {
                questions: {
                    include: {
                        id: false,
                        quizId: false,
                        questionId: false,
                        question: { // Include the question relation
                            include: {
                                options: {
                                    include: {questionId: false}
                                }
                            } // Then include options within question
                        }
                    }
                }
            }
        });

        if (!quiz) {
            return res.status(404).json({success: false, message: 'Quiz not found'});
        }

        res.status(200).json({success: true, data: quiz});
    } catch (error) {
        console.error('Error fetching quiz:', error);
        res.status(500).json({success: false, message: 'Failed to fetch quiz'});
    }
};

