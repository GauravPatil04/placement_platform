import TestInterface from '@/components/test/test-interface';

export default async function TestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TestInterface type="id" testId={id} />;
}
