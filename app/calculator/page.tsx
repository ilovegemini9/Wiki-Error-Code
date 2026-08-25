import Link from 'next/link';
import { getCalculatorDefinition, getCalculatorSlugs } from '@/data/calculators';

export const metadata = { title: 'Financial Calculators | CalculatorFree', description: 'Free client-side credit, debt, consolidation, payoff, and debt-to-income calculators.' };

export default function CalculatorIndexPage() {
  const calculators = getCalculatorSlugs().map(getCalculatorDefinition).filter(Boolean);
  return <main className="mx-auto max-w-6xl px-4 py-10"><header><h1 className="text-4xl font-extrabold">Financial Calculators</h1><p className="mt-2 max-w-2xl text-gray-700">Five private, client-side tools for credit cards, debt payoff, consolidation, and DTI planning.</p></header><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{calculators.map(calculator => calculator && <Link key={calculator.slug} href={`/calculator/${calculator.slug}`} className="rounded-2xl border border-gray-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-50"><div className="text-3xl">{calculator.icon}</div><h2 className="mt-3 text-lg font-bold">{calculator.title}</h2><p className="mt-2 text-sm text-gray-600">{calculator.description}</p><span className="mt-4 inline-block text-sm font-bold text-blue-700">Open calculator →</span></Link>)}</div></main>;
}
