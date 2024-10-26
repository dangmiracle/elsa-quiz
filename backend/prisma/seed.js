const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateOptions(isMultiple) {
    const options = [
        { optionText: 'Option A', isCorrect: false },
        { optionText: 'Option B', isCorrect: false },
        { optionText: 'Option C', isCorrect: false },
        { optionText: 'Option D', isCorrect: false }
    ];
    const correctIndices = new Set();
    if (isMultiple) {
        while (correctIndices.size < 2) {
            correctIndices.add(Math.floor(Math.random() * options.length));
        }
        correctIndices.forEach(index => {
            options[index].isCorrect = true;
        });
    } else {
        // For 'single' type, only the first option is correct
        options[getRandom(1,correctIndices.size)].isCorrect = true;
    }

    return options;
}

async function main() {
    // Create Users
    await prisma.user.createMany({
        data: [
            { username: 'dangmiracle', email: 'dangmiracle@example.com', isAdmin: false },
            { username: 'dangmiracle2', email: 'dangmiracle2@example.com', isAdmin: false },
            { username: 'dangmiracle3', email: 'dangmiracle3@example.com', isAdmin: false },
            { username: 'admin', email: 'admin@example.com', isAdmin: true },
        ],
        skipDuplicates: true
    });

    // Create Quizzes and Questions with Options
    for (let i = 1; i <= 5; i++) {
        const quiz = await prisma.quiz.create({
            data: {
                title: `Quiz ${i}`,
                description: `Description for Quiz ${i}`,
                questions: {
                    create: Array.from({ length: 5 }, (_, j) => {
                        const isMultiple = j % 2 !== 0;
                        return {
                            question: {
                                create: {
                                    questionText: `Question ${j + 1} for Quiz ${i}`,
                                    type: isMultiple ? 'multiple' : 'single',
                                    difficulty: ['easy', 'medium', 'hard'][j % 3],
                                    score: getRandom(5, 10),
                                    options: {
                                        create: generateOptions(isMultiple)
                                    }
                                }
                            }
                        };
                    })
                }
            }
        });

        console.log(`Created ${quiz.title}`);
    }

    console.log("Seeding completed successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
