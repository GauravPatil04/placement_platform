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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const scorePercentage = stats.score;
        const topicsStr = Object.entries(stats.topics)
            .map(([topic, data]) => `${topic}: ${data.correct}/${data.total}`)
            .join(", ");

        // Generate comprehensive summary with multiple prompts
        const summaryPrompt = `You are an expert placement test coach. Analyze this test performance and provide a comprehensive study guide.

Test: ${testTitle}
Score: ${scorePercentage}% (${stats.score}/${stats.totalQuestions})
Topics: ${topicsStr}

Provide ONLY a JSON response with NO markdown formatting, NO code blocks, and NO extra text. Use this exact structure:
{
  "performanceOverview": "2-3 sentences summarizing overall performance",
  "strengthsAnalysis": "2-3 specific areas where the candidate performed well",
  "weaknessAnalysis": "2-3 specific areas needing improvement",
  "topicBreakdown": {
    "topic1": "specific analysis for this topic",
    "topic2": "specific analysis for this topic"
  },
  "studyRecommendations": ["specific resource 1", "specific resource 2", "specific resource 3", "specific resource 4"],
  "actionPlan": "step-by-step 7-day study plan with specific goals",
  "motivationalMessage": "encouraging and specific feedback based on the score"
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
    
    return {
        performanceOverview: `You scored ${scorePercentage}% on the ${testTitle} test, answering ${stats.score} out of ${stats.totalQuestions} questions correctly. This demonstrates a solid understanding of the concepts covered.`,
        strengthsAnalysis: topicsData
            .filter(([_, data]) => data.correct / data.total >= 0.8)
            .map(([topic, _]) => topic)
            .join(", ") || "General comprehension of test concepts",
        weaknessAnalysis: topicsData
            .filter(([_, data]) => data.correct / data.total < 0.6)
            .map(([topic, _]) => topic)
            .join(", ") || "All topics require practice",
        topicBreakdown: Object.fromEntries(
            topicsData.map(([topic, data]) => [
                topic,
                `${data.correct}/${data.total} correct (${Math.round((data.correct / data.total) * 100)}%)`
            ])
        ),
        studyRecommendations: [
            "Review failed topics with online tutorials",
            "Practice similar questions on LeetCode/HackerRank",
            "Join study groups for peer learning",
            "Take mock tests weekly to track progress"
        ],
        actionPlan: `Day 1-2: Review fundamentals of weak topics. Day 3-4: Practice questions on weak areas. Day 5-6: Full-length mock test. Day 7: Review mistakes and refine strategy.`,
        motivationalMessage: scorePercentage >= 80 
            ? `Excellent work! You're well-prepared. Keep this momentum and focus on the remaining ${100 - scorePercentage}% to achieve perfection.`
            : `Good effort! With focused study on weak areas, you can significantly improve your score. Consistency is key!`
    };
}
