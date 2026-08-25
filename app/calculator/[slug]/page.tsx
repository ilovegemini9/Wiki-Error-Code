import { notFound } from 'next/navigation';
import { CalculatorPage } from '@/components/calculators/CalculatorPage';
import { getCalculatorDefinition, getCalculatorSlugs } from '@/data/calculators';

interface CalculatorRouteProps { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getCalculatorSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: CalculatorRouteProps) {
  const { slug } = await params;
  const calculator = getCalculatorDefinition(slug);
  if (!calculator) return { title: 'Calculator Not Found' };
  return {
    title: `${calculator.title} | CalculatorFree`,
    description: calculator.description,
    keywords: [calculator.title, 'calculator', 'finance', 'debt', 'credit'],
  };
}

export default async function CalculatorRoute({ params }: CalculatorRouteProps) {
  const { slug } = await params;
  const calculator = getCalculatorDefinition(slug);
  if (!calculator) notFound();
  return <CalculatorPage calculator={calculator} />;
}
