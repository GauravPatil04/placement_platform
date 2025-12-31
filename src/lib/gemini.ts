import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface TestStats {
    score: number;
    accuracy: number;
    totalQuestions: number;
    topics: Record<string, { correct: number; total: number }>;
}

export interface ComprehensiveSummary {
    performanceOverview: string;
    strengthsAnalysis: string;
    weaknessAnalysis: string;
    topicBreakdown: Record<string, string>;
    studyRecommendations: string[];
    actionPlan: string;
    motivationalMessage: string;
}

export async function generateFeedback(stats: TestStats) {
    if (!GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing. Returning mock feedback.");
        return "Great job! Keep practicing to improve your speed and accuracy. Focus on your weak areas.";
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
      Analyze the following aptitude test performance and provide personalized coaching feedback (max 150 words).
      
      Stats:
      - Score: ${stats.score}%
      - Accuracy: ${stats.accuracy}%
      - Total Questions: ${stats.totalQuestions}
      - Topic Breakdown: ${JSON.stringify(stats.topics)}
      
      Format the response with:
      1. **Strengths**: What they did well.
      2. **Weaknesses**: Areas to improve.
      3. **Action Plan**: Specific steps to take next.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating feedback with Gemini:", error);
        return "Unable to generate AI feedback at this time. Please try again later.";
    }
}

export async function generateComprehensiveSummary(stats: TestStats, testTitle: string): Promise<ComprehensiveSummary> {
    if (!GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing. Returning mock comprehensive summary.");
        return getMockComprehensiveSummary(stats, testTitle);
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const scorePercentage = stats.score;
        
        // Format topic/category breakdown with detailed information
        const topicsStr = Object.entries(stats.topics)
            .map(([topic, data]) => {
                const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return `${topic}: ${data.correct}/${data.total} (${percentage}%)`;
            })
            .join(", ");

        // Identify strengths and weaknesses
        const strengths = Object.entries(stats.topics)
            .filter(([_, data]) => {
                const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                return percentage >= 70;
            })
            .map(([topic]) => topic);

        const weaknesses = Object.entries(stats.topics)
            .filter(([_, data]) => {
                const percentage = data.total > 0 ? (data.correct / data.total) * 100 : 0;
                return percentage < 60;
            })
            .map(([topic]) => topic);

        // Generate comprehensive summary with multiple prompts
        const summaryPrompt = `You are an expert placement test coach analyzing a ${testTitle} performance. Provide a comprehensive, personalized study guide.

Test: ${testTitle}
Overall Score: ${scorePercentage}%
Total Questions: ${stats.totalQuestions}
Topic-wise Performance: ${topicsStr}
Strong Topics: ${strengths.length > 0 ? strengths.join(', ') : 'None identified'}
Weak Topics: ${weaknesses.length > 0 ? weaknesses.join(', ') : 'None identified'}

Provide ONLY a JSON response with NO markdown formatting, NO code blocks, and NO extra text. Use this exact structure:
{
  "performanceOverview": "2-3 sentences summarizing overall performance with specific mention of the overall score and key highlights",
  "strengthsAnalysis": "2-3 sentences highlighting specific topics where the candidate excelled (scored 70%+) with congratulatory tone. If no strong topics, acknowledge consistent effort.",
  "weaknessAnalysis": "2-3 sentences identifying specific topics that need improvement (scored below 60%) with constructive tone. Be specific about which areas need focus.",
  "topicBreakdown": {
    ${Object.keys(stats.topics).map(topic => `"${topic}": "specific analysis for ${topic} based on their score - mention if it's a strength, weakness, or moderate, and provide 1-2 actionable tips"`).join(',\n    ')}
  },
  "studyRecommendations": [
    "specific resource or practice strategy for weak topic 1",
    "specific resource or practice strategy for weak topic 2", 
    "general improvement strategy 1",
    "general improvement strategy 2"
  ],
  "actionPlan": "Detailed 7-day study plan with specific goals for each day. Day 1-2: focus on [weak topics]. Day 3-4: [specific practice]. Day 5-6: [mock tests and review]. Day 7: [final preparation].",
  "motivationalMessage": "encouraging and personalized feedback based on the score - if 80%+: celebrate and motivate for perfection; if 60-79%: acknowledge good effort and motivate for improvement; if below 60%: provide strong encouragement and assure that improvement is achievable"
}`;

        const result = await model.generateContent(summaryPrompt);
        const responseText = await result.response.text();
        
        // Parse the response carefully
        let parsedSummary;
        try {
            // Try to extract JSON from the response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedSummary = JSON.parse(jsonMatch[0]);
            } else {
                parsedSummary = JSON.parse(responseText);
            }
        } catch {
            console.error("Failed to parse AI response:", responseText);
            return getMockComprehensiveSummary(stats, testTitle);
        }

        return {
            performanceOverview: parsedSummary.performanceOverview || "Test completed successfully.",
            strengthsAnalysis: parsedSummary.strengthsAnalysis || "Good effort on the test.",
            weaknessAnalysis: parsedSummary.weaknessAnalysis || "Areas for improvement exist.",
            topicBreakdown: parsedSummary.topicBreakdown || {},
            studyRecommendations: parsedSummary.studyRecommendations || ["Continue practicing", "Review fundamentals"],
            actionPlan: parsedSummary.actionPlan || "Study regularly and practice more questions.",
            motivationalMessage: parsedSummary.motivationalMessage || "Keep up the hard work!",
        };
    } catch (error) {
        console.error("Error generating comprehensive summary with Gemini:", error);
        return getMockComprehensiveSummary(stats, testTitle);
    }
}

function getMockComprehensiveSummary(stats: TestStats, testTitle: string): ComprehensiveSummary {
    const scorePercentage = stats.score;
    const topicsData = Object.entries(stats.topics);
    
    // Calculate topic percentages
    const topicPerformances = topicsData.map(([topic, data]) => ({
        topic,
        correct: data.correct,
        total: data.total,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    // Identify strengths (70%+) and weaknesses (<60%)
    const strengths = topicPerformances.filter(t => t.percentage >= 70);
    const weaknesses = topicPerformances.filter(t => t.percentage < 60);
    const moderate = topicPerformances.filter(t => t.percentage >= 60 && t.percentage < 70);
    
    return {
        performanceOverview: `You scored ${scorePercentage}% on the ${testTitle} test, answering ${Math.round((scorePercentage / 100) * stats.totalQuestions)} out of ${stats.totalQuestions} questions correctly. ${
            scorePercentage >= 80 
                ? 'This is an excellent performance demonstrating strong command of the concepts!' 
                : scorePercentage >= 60 
                ? 'This shows a good foundation, with clear opportunities for improvement in specific areas.' 
                : 'This indicates that focused practice is needed to strengthen your fundamentals.'
        }`,
        
        strengthsAnalysis: strengths.length > 0 
            ? `You performed exceptionally well in ${strengths.map(s => `${s.topic} (${s.percentage}%)`).join(', ')}. ${
                strengths.length === topicPerformances.length 
                    ? 'You have a balanced strong performance across all topics!' 
                    : 'These are your core strengths - maintain this level through regular practice.'
              }` 
            : moderate.length > 0
            ? `While you didn't have standout strengths (70%+), you showed moderate performance in ${moderate.map(m => m.topic).join(', ')}. With focused effort, these can become your strengths.`
            : 'Your performance was consistent across topics, indicating you need foundational improvement across the board. This is actually good news - systematic study will help you improve everywhere!',
        
        weaknessAnalysis: weaknesses.length > 0 
            ? `You need significant improvement in ${weaknesses.map(w => `${w.topic} (${w.percentage}%)`).join(', ')}. ${
                weaknesses.length === topicPerformances.length 
                    ? 'Don\'t be discouraged - starting with basics in each area will build a strong foundation.' 
                    : 'Focus your immediate study efforts on these specific areas for maximum impact.'
              }` 
            : scorePercentage < 70
            ? 'While no specific topic is critically weak, consistent improvement across all areas will boost your overall score significantly.'
            : 'You have a solid foundation across all topics. Fine-tuning your approach and practicing advanced problems will help you reach excellence.',
        
        topicBreakdown: Object.fromEntries(
            topicPerformances.map(({ topic, correct, total, percentage }) => [
                topic,
                percentage >= 80 
                    ? `Excellent performance: ${correct}/${total} correct (${percentage}%). You've mastered this topic! Continue with advanced practice to maintain this level.`
                    : percentage >= 70 
                    ? `Strong performance: ${correct}/${total} correct (${percentage}%). You're doing well here. Push for 90%+ by practicing trickier questions.`
                    : percentage >= 60 
                    ? `Moderate performance: ${correct}/${total} correct (${percentage}%). This needs focused attention. Review concepts and practice 15-20 questions daily.`
                    : percentage >= 40 
                    ? `Weak area: ${correct}/${total} correct (${percentage}%). Priority focus needed. Start with basics, understand fundamentals, then build up to complex problems.`
                    : `Critical weakness: ${correct}/${total} correct (${percentage}%). Requires immediate attention. Dedicate 1-2 hours daily to rebuild fundamentals in this topic.`
            ])
        ),
        
        studyRecommendations: [
            ...(weaknesses.length > 0 
                ? [`Focus on ${weaknesses[0].topic}: Start with fundamental concepts, watch video tutorials, and practice 10 basic questions daily`]
                : ['Review all topics systematically to identify knowledge gaps']),
            ...(weaknesses.length > 1 
                ? [`Work on ${weaknesses[1].topic}: Use online platforms like GeeksforGeeks, InterviewBit, or Khan Academy for structured learning`]
                : ['Practice previous year placement papers specific to this company']),
            'Take timed mock tests weekly to build speed and accuracy under pressure',
            'Join online study groups or forums to discuss difficult concepts and learn problem-solving strategies',
            ...(strengths.length > 0 
                ? [`Maintain your strength in ${strengths[0].topic} with advanced-level practice problems`]
                : ['Create a study schedule allocating 2-3 hours daily across all topics']),
        ],
        
        actionPlan: `
📅 Day 1-2: ${weaknesses.length > 0 
    ? `Deep dive into ${weaknesses[0]?.topic || 'weak areas'} - review fundamental concepts, watch 2-3 tutorial videos, and solve 15-20 basic problems.` 
    : 'Review all topic fundamentals and identify specific concept gaps.'}

📅 Day 3-4: ${weaknesses.length > 1 
    ? `Focus on ${weaknesses[1]?.topic || 'second weak area'} - practice 20-25 questions of increasing difficulty. Revise ${weaknesses[0]?.topic || 'first weak area'} with 10 questions.` 
    : moderate.length > 0
    ? `Practice ${moderate[0]?.topic || 'moderate areas'} with 25-30 questions. Focus on accuracy over speed.`
    : 'Solve mixed difficulty questions across all topics - aim for 30-40 questions total.'}

📅 Day 5: Take a full-length mock test under timed conditions. This simulates the actual placement test environment.

📅 Day 6: Analyze mock test mistakes in detail. For each wrong answer, understand why it was incorrect and practice 5 similar questions.

📅 Day 7: Quick revision of all topics. Solve 10 questions per topic. Focus on maintaining speed while ensuring accuracy. Get adequate rest before the actual test.
        `.trim(),
        
        motivationalMessage: scorePercentage >= 80 
            ? `🌟 Outstanding work! You're in the top tier. With this level of performance, you're well-prepared for the placement. Keep practicing to maintain your edge, and approach the actual test with confidence. You've got this! 💪`
            : scorePercentage >= 70
            ? `💪 Great effort! You're above the average and on the right track. With focused improvement in ${weaknesses.length > 0 ? `${weaknesses.map(w => w.topic).join(' and ')}` : 'specific areas'}, you can reach 85-90%. Stay consistent with your preparation - success is within reach! 🎯`
            : scorePercentage >= 60
            ? `🎯 Good foundation! You're at the qualifying level, but there's significant room for growth. The topics you're weak in are conquerable with dedicated practice. Many successful candidates started here and improved to 80%+. Believe in yourself and put in the work! 📚`
            : `💡 Don't be discouraged! Every expert was once a beginner. Your current score shows you understand the basics, but need structured practice. Follow the action plan diligently - improvement of 20-30% is very achievable in a week with focused effort. Remember: persistence beats resistance. You can do this! 🚀`
    };
}
export async function generateDetailedFieldAnalysis(
    testData: {
        score: number;
        totalQuestions: number;
        correct: number;
        wrong: number;
        categoryBreakdown: Record<string, { correct: number; total: number; percentage: number }>;
        wrongQuestions: Array<{
            id: string;
            text: string;
            category: string;
            userAnswer: string;
            correctAnswer: string;
        }>;
    },
    testTitle: string
): Promise<string> {
    if (!GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing. Returning mock analysis.");
        return generateMockCategoryWiseAnalysis(testData, testTitle);
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Format wrong questions with full details for Gemini to analyze
        const wrongQuestionsText = testData.wrongQuestions
            .map(
                (q, idx) =>
                    `Question ${idx + 1}: ${q.text}\nStudent's Answer: ${q.userAnswer}\nCorrect Answer: ${q.correctAnswer}`
            )
            .join('\n\n');

        const prompt = `You are a professional test analysis expert. Analyze the following wrong answers from a placement test and categorize them by subject area (like Mathematics, Logical Reasoning, Aptitude, Verbal Reasoning, Coding, etc.).

Test Name: ${testTitle}
Total Questions: ${testData.totalQuestions}
Correct Answers: ${testData.correct}
Wrong Answers: ${testData.wrong}
Overall Score: ${testData.score}%

WRONG QUESTIONS TO ANALYZE:
${wrongQuestionsText}

Your task:
1. Read each question and categorize it by subject area based on its content
2. Group the wrong questions by these categories
3. For each category, calculate how many questions the student got wrong
4. Provide a detailed analysis with the following format (NO markdown, NO emojis, plain text only):

QUESTION-BY-QUESTION ANALYSIS
======================================================================

[For each subject category:]
[CATEGORY NAME]
Total Questions in this Category: X
Correct Answers: Y
Wrong Answers: Z
Accuracy: A%

Wrong Questions in this Category:
- Question text with student's answer vs correct answer

======================================================================

SUMMARY BY CATEGORY
======================================================================

[For each category:]
[CATEGORY NAME]
Performance: Y correct out of X questions (A%)
Summary: You solved Y questions correctly in [CATEGORY NAME] out of X attempts. [Performance assessment]

======================================================================

OVERALL PERFORMANCE SUMMARY
======================================================================

Correct Answers by Category:
[Category Name]: X correct

Wrong Answers by Category:
[Category Name]: X wrong

======================================================================

AREAS REQUIRING MOST FOCUS
======================================================================

[Rank categories from lowest to highest performance:]
1. [CATEGORY - PERFORMANCE LEVEL]
   - Performance: X% (Y/Z)
   - Action: [Specific study recommendation]
   - Focus: [What to focus on]

[Include daily study recommendation at the end]

Be specific about which categories need focus based on accuracy percentage. Use plain, professional language.`;

        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();

        return responseText.trim();
    } catch (error) {
        console.error("Error generating field analysis with Gemini:", error);
        return generateMockCategoryWiseAnalysis(testData, testTitle);
    }
}

// Helper function to intelligently categorize questions based on their content
function categorizeQuestionByContent(questionText: string): string {
    if (!questionText) return "General Knowledge";
    
    const text = questionText.toLowerCase();
    
    // Count keyword matches for better categorization
    const scores: Record<string, number> = {
        "Quantitative Aptitude": 0,
        "Logical Reasoning": 0,
        "Verbal & Reading": 0,
        "Programming/Coding": 0,
        "Data Interpretation": 0,
        "General Reasoning": 0
    };
    
    // Mathematical/Quantitative patterns
    const quantKeywords = /\b(find|calculate|solve|percentage|profit|loss|ratio|proportion|average|sum|product|equation|number|digit|integer|fraction|decimal|prime|even|odd|square|cube|root|angle|triangle|circle|area|volume|length|distance|speed|time|rate|multiply|divide|add|subtract|money|cost|price|value|amount|count|total|calculate)\b/gi;
    const quantMatches = (text.match(quantKeywords) || []).length;
    if (quantMatches > 0) scores["Quantitative Aptitude"] += quantMatches * 2;
    
    // Logical Reasoning patterns
    const logicKeywords = /\b(logic|sequence|pattern|series|analogy|similar|opposite|code|decode|arrange|order|direction|position|relationship|syllogism|inference|conclusion|puzzle|cryptic|arrange|next|follows|similar|statement|true|false)\b/gi;
    const logicMatches = (text.match(logicKeywords) || []).length;
    if (logicMatches > 0) scores["Logical Reasoning"] += logicMatches * 2;
    
    // Verbal/English patterns
    const verbalKeywords = /\b(grammar|tense|subject|verb|pronoun|article|preposition|conjunction|spelling|vocabulary|synonym|antonym|passage|comprehension|sentence|paragraph|meaning|usage|english|word|phrase|language|literature|idiom|fill|blank|error|correct|best|sentence|complete)\b/gi;
    const verbalMatches = (text.match(verbalKeywords) || []).length;
    if (verbalMatches > 0) scores["Verbal & Reading"] += verbalMatches * 2;
    
    // Programming/Coding patterns
    const codingKeywords = /\b(code|program|function|variable|algorithm|array|loop|condition|output|input|compile|syntax|error|debug|java|python|cpp|c\+\+|javascript|database|query|sql|html|css|write|print|return|class|method|object)\b/gi;
    const codingMatches = (text.match(codingKeywords) || []).length;
    if (codingMatches > 0) scores["Programming/Coding"] += codingMatches * 2;
    
    // Data Interpretation patterns
    const dataKeywords = /\b(table|graph|chart|bar|pie|diagram|data|statistics|percentage|ratio|comparison|analysis|interpretation|figure|row|column|value|shown|increase|decrease|maximum|minimum)\b/gi;
    const dataMatches = (text.match(dataKeywords) || []).length;
    if (dataMatches > 0) scores["Data Interpretation"] += dataMatches * 2;
    
    // Find the category with the highest score
    let maxScore = 0;
    let selectedCategory = "General Knowledge";
    
    for (const [category, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            selectedCategory = category;
        }
    }
    
    // If no keywords matched, use a simple heuristic based on question length
    if (maxScore === 0) {
        if (text.length < 100) {
            return "General Reasoning";
        } else if (text.includes("passage") || text.includes("read")) {
            return "Verbal & Reading";
        } else {
            return "General Knowledge";
        }
    }
    
    return selectedCategory;
}

function generateMockCategoryWiseAnalysis(
    testData: {
        score: number;
        totalQuestions: number;
        correct: number;
        wrong: number;
        categoryBreakdown: Record<string, { correct: number; total: number; percentage: number }>;
        wrongQuestions: Array<{
            id: string;
            text: string;
            category: string;
            userAnswer: string;
            correctAnswer: string;
        }>;
    },
    testTitle: string
): string {
    // Intelligently categorize all questions by their content
    const categorizedWrongQuestions: Record<string, Array<{ id: string; text: string; userAnswer: string; correctAnswer: string }>> = {};
    
    testData.wrongQuestions.forEach((q) => {
        const category = categorizeQuestionByContent(q.text);
        if (!categorizedWrongQuestions[category]) {
            categorizedWrongQuestions[category] = [];
        }
        categorizedWrongQuestions[category].push({
            id: q.id,
            text: q.text,
            userAnswer: q.userAnswer,
            correctAnswer: q.correctAnswer,
        });
    });

    // Calculate category statistics from wrong questions
    const categoryStats: Record<string, { total: number; wrong: number; correct: number; percentage: number }> = {};
    
    testData.wrongQuestions.forEach((q) => {
        const category = categorizeQuestionByContent(q.text);
        if (!categoryStats[category]) {
            categoryStats[category] = { total: 0, wrong: 0, correct: 0, percentage: 0 };
        }
        categoryStats[category].wrong++;
    });

    // We need to estimate total questions per category (based on wrong + estimated correct)
    const totalQuestionsPerCategory = Math.ceil(testData.totalQuestions / Object.keys(categoryStats).length);
    
    for (const category in categoryStats) {
        categoryStats[category].total = totalQuestionsPerCategory;
        categoryStats[category].correct = Math.max(0, totalQuestionsPerCategory - categoryStats[category].wrong);
        categoryStats[category].percentage = Math.round((categoryStats[category].correct / categoryStats[category].total) * 100);
    }

    // Sort by performance
    const sortedCategories = Object.entries(categoryStats)
        .sort((a, b) => a[1].percentage - b[1].percentage);

    // Handle case when no categories found - create a basic fallback analysis
    if (sortedCategories.length === 0) {
        // If we have wrong questions but couldn't categorize them, create a simple analysis
        if (testData.wrongQuestions.length > 0) {
            let basicAnalysis = `QUESTION-BY-QUESTION ANALYSIS
${testTitle}
======================================================================

Overall Score: ${testData.score}% (${testData.correct}/${testData.totalQuestions})
Total Questions: ${testData.totalQuestions}
Correct Answers: ${testData.correct}
Wrong Answers: ${testData.wrong}

WRONG QUESTIONS DETAILS:
`;
            testData.wrongQuestions.forEach((wq, idx) => {
                const questionPreview = wq.text.length > 100 ? wq.text.substring(0, 100) + "..." : wq.text;
                basicAnalysis += `\n${idx + 1}. Question: ${questionPreview}\n`;
                basicAnalysis += `   Your Answer: ${wq.userAnswer}\n`;
                basicAnalysis += `   Correct Answer: ${wq.correctAnswer}\n`;
            });

            basicAnalysis += `\n\nSUMMARY BY CATEGORY
======================================================================

Overall Performance: ${testData.correct} correct out of ${testData.totalQuestions} questions (${testData.score}%)
Summary: You need to review all concepts and focus on improving your understanding of the fundamentals.

AREAS REQUIRING MOST FOCUS
======================================================================

1. COMPREHENSIVE REVIEW NEEDED
   - Performance: ${testData.score}% (${testData.correct}/${testData.totalQuestions})
   - Action: Start with fundamentals across all topics. Practice daily with focused attention.
   - Focus: Understand core concepts before attempting complex problems.

DAILY STUDY RECOMMENDATION
- Dedicate 60 minutes daily to revision and practice
- 30 minutes for concept building
- 30 minutes for practice problems
- Expected improvement: 10-15% in 1 week with consistent effort`;

            return basicAnalysis;
        }

        return `QUESTION-BY-QUESTION ANALYSIS
${testTitle}
======================================================================

Overall Score: ${testData.score}% (${testData.correct}/${testData.totalQuestions})

Unable to categorize questions. Please check the question content.`;
    }

    let analysis = `QUESTION-BY-QUESTION ANALYSIS
${testTitle}
======================================================================

`;

    // Detailed breakdown by category
    for (const [category, stats] of sortedCategories) {
        const wrongQuestionsInCategory = categorizedWrongQuestions[category] || [];
        
        analysis += `${category.toUpperCase()}
Total Questions: ${stats.total}
Correct Answers: ${stats.correct}
Wrong Answers: ${stats.wrong}
Accuracy: ${stats.percentage}%

`;

        if (wrongQuestionsInCategory.length > 0) {
            analysis += `Wrong Questions Details:\n`;
            wrongQuestionsInCategory.forEach((wq, idx) => {
                const questionPreview = wq.text.length > 100 ? wq.text.substring(0, 100) + "..." : wq.text;
                analysis += `${idx + 1}. Question: ${questionPreview}\n`;
                analysis += `   Your Answer: ${wq.userAnswer}\n`;
                analysis += `   Correct Answer: ${wq.correctAnswer}\n\n`;
            });
        }

        analysis += `\n`;
    }

    analysis += `SUMMARY BY CATEGORY
======================================================================

`;

    for (const [category, stats] of sortedCategories) {
        analysis += `${category.toUpperCase()}\n`;
        analysis += `Performance: ${stats.correct} correct out of ${stats.total} questions (${stats.percentage}%)\n`;
        
        if (stats.percentage >= 80) {
            analysis += `Summary: You solved ${stats.correct} questions correctly in ${category}. Excellent performance!\n`;
        } else if (stats.percentage >= 60) {
            analysis += `Summary: You solved ${stats.correct} questions correctly in ${category}. Good effort, but needs improvement.\n`;
        } else if (stats.percentage >= 40) {
            analysis += `Summary: You solved ${stats.correct} questions correctly in ${category}. Requires focused practice.\n`;
        } else {
            analysis += `Summary: You solved ${stats.correct} questions correctly in ${category}. Critical area needing immediate attention.\n`;
        }
        analysis += `\n`;
    }

    analysis += `OVERALL PERFORMANCE SUMMARY
======================================================================

Correct Answers by Category:
`;
    
    for (const [category, stats] of sortedCategories) {
        analysis += `${category}: ${stats.correct} correct\n`;
    }

    analysis += `\nWrong Answers by Category:\n`;
    
    for (const [category, stats] of sortedCategories) {
        analysis += `${category}: ${stats.wrong} wrong\n`;
    }

    const weakestCategory = sortedCategories[0];
    const strongestCategory = sortedCategories[sortedCategories.length - 1];

    analysis += `\nAREAS REQUIRING MOST FOCUS
======================================================================

1. CRITICAL FOCUS: ${weakestCategory[0]}
   - Performance: ${weakestCategory[1].percentage}% (${weakestCategory[1].correct}/${weakestCategory[1].total})
   - Action: Start with fundamentals. Practice 40-50 questions daily in this category.
   - Focus: Understand basic concepts before attempting complex problems.

2. IMPROVEMENT NEEDED: 
   - Focus on categories with less than 70% accuracy.
   - Practice similar questions to the ones you got wrong.
   - Review concepts for each wrong answer.

3. MAINTAIN STRENGTH: ${strongestCategory[0]}
   - Performance: ${strongestCategory[1].percentage}% (${strongestCategory[1].correct}/${strongestCategory[1].total})
   - Continue regular practice to maintain this level.

DAILY STUDY RECOMMENDATION
- Dedicate 60 minutes daily to ${weakestCategory[0]}
- 30 minutes for other weak categories
- 15 minutes for maintenance practice
- Expected improvement: 15-20% in 2-3 weeks with consistent effort`;

    return analysis;
}