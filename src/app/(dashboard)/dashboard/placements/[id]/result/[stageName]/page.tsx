'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StageResult } from '@/components/placements/stage-result';
import { Loader2 } from 'lucide-react';

export default function StageResultPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const stageName = params.stageName as string;
  const [isLoading, setIsLoading] = useState(true);
  const [resultData, setResultData] = useState<any>(null);

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/placements/${applicationId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Find the stage result
        const stage = data.assessmentStages?.find(
          (s: any) => s.stageName === stageName
        );

        if (stage) {
          // Generate AI summary for this stage
          let aiSummary = null;
          try {
            const feedbackData = stage.feedback ? JSON.parse(stage.feedback) : {};
            const categoryBreakdown = feedbackData.categoryBreakdown || {};
            const wrongQuestions = feedbackData.wrongQuestions || [];
            
            console.log('Fetched stage data:', {
              score: stage.score,
              total: stage.total,
              percentage: stage.percentage,
              categoryBreakdown,
              wrongQuestionsCount: wrongQuestions.length,
            });

            // Call AI summary generation endpoint with all wrong questions
            const summaryRes = await fetch('/api/results/ai-summary', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                score: stage.percentage || 0,
                totalQuestions: stage.total || 0,
                correct: stage.score || 0,
                wrong: (stage.total || 0) - (stage.score || 0),
                testTitle: `${data.company} - ${stageName}`,
                categoryBreakdown,
                wrongQuestions,
              }),
            });

            if (summaryRes.ok) {
              const summaryData = await summaryRes.json();
              console.log('AI Summary generated successfully');
              aiSummary = summaryData.summary;
            } else {
              const errorData = await summaryRes.json();
              console.error('AI Summary endpoint error:', errorData);
            }
          } catch (error) {
            console.error('Error generating AI summary:', error);
          }

          setResultData({
            stageName,
            isPassed: stage.isPassed,
            score: stage.score || 0,
            total: stage.total || 100,
            percentage: stage.percentage || 0,
            nextStage: data.status,
            track: data.finalTrack,
            timeSpent: stage.timeSpent,
            feedback: aiSummary,
          });
        } else if (stageName === 'voice') {
          // Handle voice assessment
          const voiceAssessment = data.voiceAssessment;
          if (voiceAssessment) {
            setResultData({
              stageName: 'voice',
              isPassed: voiceAssessment.isPassed,
              score: Math.round(voiceAssessment.overallScore),
              total: 100,
              percentage: voiceAssessment.overallScore,
              nextStage: data.status,
              track: data.finalTrack,
              feedback: voiceAssessment.feedback,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching result:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Result not found</h2>
          <p className="text-gray-600 mt-2">Please complete the assessment first.</p>
        </div>
      </div>
    );
  }

  return (
    <StageResult
      {...resultData}
      applicationId={applicationId}
    />
  );
}
