'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Sparkles, TrendingUp, BookOpen, Target } from "lucide-react";

interface ResultData {
  id: string;
  score: number;
  total: number;
  percentage: number;
  aiFeedback: string | null;
  createdAt: string;
  test: {
    title: string;
    type: string;
    difficulty: string;
  };
}

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'feedback']));

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const resultId = params.id as string;
        const response = await fetch(`/api/results?id=${resultId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch result');
        }

        const data = await response.json();
        console.log('Fetched result:', {
          id: data.result.id,
          aiFeedback: data.result.aiFeedback ? `[${data.result.aiFeedback.length} chars]` : 'null',
          score: data.result.score,
          total: data.result.total,
        });
        setResult(data.result);
      } catch (err) {
        console.error('Error fetching result:', err);
        setError(err instanceof Error ? err.message : 'Failed to load result');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Result Not Found</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              {error || 'This result could not be found.'}
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent! 🎉';
    if (percentage >= 80) return 'Great Job! 👏';
    if (percentage >= 70) return 'Good Work! 👍';
    if (percentage >= 60) return 'Keep Practicing! 💪';
    return 'Need More Practice 📚';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
    if (percentage >= 60) return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>{result.test.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
            <span>Type: {result.test.type === 'topic' ? 'Aptitude' : 'Company'}</span>
            <span>•</span>
            <span>Difficulty: {result.test.difficulty}</span>
            <span>•</span>
            <span>Completed: {new Date(result.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={`border-2 ${getScoreBgColor(result.percentage)}`}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.score}/{result.total}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result.percentage}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getPerformanceLabel(result.percentage)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {result.score > result.total / 2 ? '📈 Above Average' : '📉 Below Average'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
              {result.percentage}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {result.score} correct answers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive AI Feedback */}
      {result.aiFeedback && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-300 dark:border-slate-700 border-2">
            <CardHeader className="cursor-pointer pb-3" onClick={() => toggleSection('feedback')}>
              <CardTitle className="flex items-center justify-between gap-2 text-lg">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  AI Performance Analysis
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {expandedSections.has('feedback') ? '▼' : '▶'}
                </span>
              </CardTitle>
            </CardHeader>
            {expandedSections.has('feedback') && (
              <CardContent>
                <div className="text-sm leading-relaxed font-mono">
                  <div className="whitespace-pre-wrap text-foreground/90">
                    {result.aiFeedback}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✓ Review your weak areas based on the AI analysis above</p>
            <p>✓ Follow the 7-day study plan provided by your AI coach</p>
            <p>✓ Practice similar questions regularly</p>
            <p>✓ Take another test in 3-4 days to track progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5 text-orange-600" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>📖 Practice more questions on weak topics</p>
            <p>🎓 Watch tutorial videos for difficult concepts</p>
            <p>👥 Join study groups for peer learning</p>
            <p>🎯 Focus on quality over quantity of practice</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-6">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/my-tests">Take Another Test</Link>
        </Button>
      </div>
    </div>
  );
}
