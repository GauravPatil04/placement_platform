const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  const test = await prisma.test.findFirst({
    where: {
      title: { contains: 'Foundation' },
      company: 'TCS'
    },
    include: {
      questions: {
        select: {
          id: true,
          text: true,
          category: true
        },
        take: 5
      }
    }
  });

  if (test) {
    console.log('Test:', test.title);
    console.log('Total Questions:', test.questions.length);
    console.log('\nFirst 5 Questions:');
    test.questions.forEach((q, i) => {
      console.log(`${i+1}. Category: "${q.category || 'NULL'}" - Text: ${q.text.substring(0, 50)}...`);
    });
  } else {
    console.log('TCS Foundation test not found');
  }
  
  await prisma.$disconnect();
}

checkCategories().catch(e => {
  console.error(e);
  process.exit(1);
});
