'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, TrendingUp, Clock, Award, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StageResultProps {
  stageName: string;
  isPassed: boolean;
  score: number;
  total: number;
  percentage: number;
  nextStage?: string;
  track?: string;
  applicationId: string;
  feedback?: string;
  timeSpent?: number;
}

export function StageResult({
  stageName,
  isPassed,
  score,
  total,
  percentage,
  nextStage,
  track,
  applicationId,
  feedback,
  timeSpent,
}: StageResultProps) {
  const router = useRouter();

  const getStageTitle = (stage: string) => {
    const titles: Record<string, string> = {
      foundation: 'Foundation Test',
      advanced: 'Advanced Quantitative + Logical Test',
      coding: 'Coding Test',
      aptitude: 'Aptitude Test',
      essay: 'Essay Writing',
      voice: 'Voice Assessment',
      interview: 'Interview',
    };
    return titles[stage] || stage;
  };

  const getNextStageRoute = (stage: string) => {
    return `/dashboard/placements/${applicationId}/${stage}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Result Header */}
        <Card className={`border-2 ${isPassed ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50'}`}>
          <CardHeader>
            <div className="flex items-center justify-center">
              {isPassed ? (
                <div className="text-center">
                  <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto mb-4" />
                  <CardTitle className="text-3xl text-green-900">Congratulations!</CardTitle>
                  <p className="text-green-700 mt-2">You have passed the {getStageTitle(stageName)}</p>
                </div>
              ) : (
                <div className="text-center">
                  <XCircle className="w-20 h-20 text-red-600 mx-auto mb-4" />
                  <CardTitle className="text-3xl text-red-900">Assessment Complete</CardTitle>
                  <p className="text-red-700 mt-2">Unfortunately, you did not pass the {getStageTitle(stageName)}</p>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Score Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Your Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">Score</div>
                <div className="text-3xl font-bold text-blue-900 mt-2">
                  {score} / {total}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 font-medium">Percentage</div>
                <div className="text-3xl font-bold text-purple-900 mt-2">
                  {percentage.toFixed(1)}%
                </div>
              </div>

              {timeSpent && (
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-700 font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time Spent
                  </div>
                  <div className="text-3xl font-bold text-orange-900 mt-2">
                    {formatTime(timeSpent)}
                  </div>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Overall Performance</span>
                <span className="font-semibold">{percentage.toFixed(1)}%</span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    percentage >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : percentage >= 60
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-pink-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {feedback && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Feedback</h3>
                <p className="text-gray-700 leading-relaxed">{feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Track Assignment (if applicable) */}
        {track && (
          <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <Award className="w-6 h-6" />
                Track Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-lg text-gray-700 mb-2">You have been assigned to:</p>
                <p className="text-4xl font-bold text-yellow-900">{track} Track</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPassed && nextStage && nextStage !== 'completed' ? (
              <>
                <p className="text-gray-700">
                  Great job! You can now proceed to the next stage: <strong>{getStageTitle(nextStage)}</strong>
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`/dashboard/placements/${applicationId}`)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Application
                  </Button>
                  <Button
                    onClick={() => router.push(getNextStageRoute(nextStage))}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Continue to {getStageTitle(nextStage)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : isPassed && (nextStage === 'completed' || track) ? (
              <>
                <p className="text-gray-700">
                  Congratulations! You have completed all assessment stages. Your application is now under review.
                </p>
                <Button
                  onClick={() => router.push(`/dashboard/placements/${applicationId}`)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  View Application Status
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-700">
                  Thank you for participating in the assessment. Unfortunately, you did not meet the passing criteria for this stage.
                </p>
                <Button
                  onClick={() => router.push('/dashboard/placements')}
                  className="w-full"
                  variant="outline"
                >
                  Back to Placements
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
