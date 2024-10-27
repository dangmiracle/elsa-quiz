const prisma = require('../config/database');
const rabbitmq = require('../config/rabbitmq');
const Joi = require('joi');
const redis = require('../config/redis');

const answerListSchema = Joi.array().items(
    Joi.object({
        questionId: Joi.string().required(),
        optionIds: Joi.array().items(Joi.string()).min(1).required() // Array of selected option IDs
    })
);

const quizListQuerySchema = Joi.object({
    title: Joi.string(),
    description: Joi.string()
});

const quizIdParamSchema = Joi.object({
    quizId: Joi.string().required()
});

exports.getQuizQuestions = async (req, res) => {
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


exports.submitAnswers = async (req, res) => {
    const { error: bodyError } = answerListSchema.validate(req.body);
    if (bodyError) return res.status(400).json({ success: false, message: bodyError.details[0].message });

    const answers = req.body;
    const { quizId } = req.params;
    const userId = req.authenticatedUser.userId;
    const username = req.authenticatedUser.username;
    const io = req.app.get('io');

    let totalScoreIncrement = 0;
    const results = [];

    try {
        // Check if the user has already submitted answers for this quiz
        const existingUserQuizScore = await prisma.userQuizScore.findUnique({
            where: { userId_quizId: { userId, quizId } }
        });

        if (existingUserQuizScore) {
            return res.status(403).json({ success: false, message: 'You have already submitted answers for this quiz.' });
        }

        // Create a new UserQuizScore entry since no previous submission exists
        const userQuizScore = await prisma.userQuizScore.create({
            data: { userId, quizId, score: 0 }
        });

        // Process each answer
        for (const answer of answers) {
            const { questionId, optionIds } = answer;

            const question = await prisma.question.findUnique({
                where: { id: questionId },
                include: { options: true }
            });

            if (!question) {
                results.push({ questionId, success: false, message: 'Question not found' });
                continue;
            }

            const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
            const allOptionsValid = optionIds.every(id => question.options.some(opt => opt.id === id));

            if (!allOptionsValid) {
                results.push({ questionId, success: false, message: 'Invalid options selected' });
                continue;
            }

            const isCorrect = optionIds.every(id => correctOptions.includes(id)) && optionIds.length === correctOptions.length;
            const scoreIncrement = isCorrect ? question.score : 0;
            totalScoreIncrement += scoreIncrement;

            results.push({
                questionId,
                success: true,
                isCorrect,
                score: scoreIncrement,
                correctOptionIds: correctOptions,
                userAnswers: optionIds
            });

            await prisma.userQuizAnswerHistory.create({
                data: {
                    userQuizScoreId: userQuizScore.id,
                    questionId,
                    userAnswers: optionIds,
                    correctOptionIds: correctOptions,
                    isCorrect
                }
            });
        }

        // Update the user's total score for the quiz in the database
        const updatedScore = await prisma.userQuizScore.update({
            where: { id: userQuizScore.id },
            data: { score: totalScoreIncrement }
        });

        const globalLeaderboardKey = 'global:leaderboard';
        const globalUserScoreKey = `user:${username}:score`;

        let leaderboard = await redis.get(globalLeaderboardKey);
        leaderboard = leaderboard ? JSON.parse(leaderboard) : [];
        const userEntryIndex = leaderboard.findIndex(entry => entry.userId === userId);
        if (userEntryIndex !== -1) {
            leaderboard[userEntryIndex].score += totalScoreIncrement;
        } else {
            leaderboard.push({
                userId,
                username,
                score: totalScoreIncrement
            });
        }
        leaderboard.sort((a, b) => b.score - a.score);
        await redis.set(globalLeaderboardKey, JSON.stringify(leaderboard));
        io.emit('leaderBoardUpdated', JSON.stringify(leaderboard));

        let userScoreData = await redis.get(globalUserScoreKey);

        if (userScoreData) {
            userTotalScore = parseInt(userScoreData) + totalScoreIncrement;
        } else {
            const cumulativeScore = await prisma.userQuizScore.aggregate({
                _sum: { score: true },
                where: { userId }
            });
            userTotalScore = cumulativeScore._sum.score || 0;
        }
        await redis.set(globalUserScoreKey, userTotalScore);
        io.emit('userScoreUpdated', JSON.stringify({username, userId, score: updatedScore.score}));

        res.status(200).json({ success: true, data: { updatedScore: updatedScore.score, results } });
    } catch (error) {
        console.error('Error submitting answers:', error);
        res.status(500).json({ success: false, message: 'Error submitting answers' });
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
                        question: {
                            include: {
                                options: {
                                    include: {questionId: false}
                                }
                            }
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

exports.getQuizAnswerHistory = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.authenticatedUser.userId;

    try {
        // Fetch UserQuizScore along with answerHistories in one query
        const userQuizScore = await prisma.userQuizScore.findUnique({
            where: {
                userId_quizId: { userId, quizId }
            },
            select: {
                score: true,
                userId: true,
                quizId: true,
                answerHistories: {
                    select: {
                        questionId: true,
                        userAnswers: true,
                        correctOptionIds: true,
                        isCorrect: true,
                        createdAt: true
                    }
                }
            }
        });

        // If UserQuizScore doesn't exist, return an empty response
        if (!userQuizScore) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Return the answerHistories as part of the response
        res.status(200).json({ success: true, data: userQuizScore });
    } catch (error) {
        console.error('Error fetching answer history:', error);
        res.status(500).json({ success: false, message: 'Error fetching answer history.' });
    }
};


