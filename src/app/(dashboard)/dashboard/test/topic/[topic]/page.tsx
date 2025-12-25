import TestInterface from '@/components/test/test-interface';

export default async function TopicTestPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  return <TestInterface topicOrCompany={topic} type="topic" />;
}
