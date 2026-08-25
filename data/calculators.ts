export type CalculatorSlug =
  | 'credit-card-calculator'
  | 'credit-cards-payoff-calculator'
  | 'debt-payoff-calculator'
  | 'debt-consolidation-calculator'
  | 'debt-to-income-ratio-calculator';

export interface CalculatorFaq { question: string; answer: string }
export interface CalculatorSource { name: string; note: string }
export interface CalculatorDefinition {
  slug: CalculatorSlug;
  title: string;
  icon: string;
  category: string;
  description: string;
  rule: string;
  formula: string;
  variables: Array<[string, string]>;
  mathCallout: string;
  howTo: string[];
  example: { scenario: string; steps: string[]; output: string };
  useCases: string[];
  mistakes: string[];
  glossary: Array<[string, string]>;
  faqs: CalculatorFaq[];
  sources: CalculatorSource[];
  related: CalculatorSlug[];
}

const definitions: Record<CalculatorSlug, CalculatorDefinition> = {
  'credit-card-calculator': {
    slug: 'credit-card-calculator', title: 'Credit Card Calculator', icon: '💳', category: 'Credit & Debt',
    description: 'Compare a credit-card minimum-payment path with a fixed three-year payoff plan and see the interest cost of waiting.',
    rule: 'Minimum payments can stretch repayment for years; a fixed payment over 36 months creates a defined payoff horizon.',
    formula: 'M = P × r(1+r)^n / ((1+r)^n − 1)',
    variables: [['P', 'Starting balance'], ['r', 'Monthly interest rate (APR ÷ 12)'], ['n', 'Number of monthly payments'], ['M', 'Fixed monthly payment']],
    mathCallout: 'The fixed-plan calculation uses the standard amortization formula. The minimum-payment estimate models a percentage-of-balance payment with an interest floor; real issuers can use different minimum-payment rules, fees, and rounding.',
    howTo: ['Enter the current card balance.', 'Enter the card APR and minimum-payment percentage.', 'Review the estimated minimum-payment payoff and interest.', 'Compare it with a 36-month fixed payment and choose a sustainable target.'],
    example: { scenario: '$5,000 balance at 24% APR with a 2% minimum payment.', steps: ['Monthly rate = 24% ÷ 12 = 2%.', 'A 36-month amortizing payment is approximately $196.14.', 'Compare the fixed-plan interest with the much longer minimum-payment path.', 'Use the fixed payment as a target only if it fits the budget.'], output: 'Target: about $196/month for a 36-month payoff, subject to issuer terms and no new charges.' },
    useCases: ['Estimate a realistic three-year payoff target.', 'Understand why paying only the minimum can be expensive.', 'Test how APR changes affect monthly cost.', 'Plan a debt-free date before making extra payments.'],
    mistakes: ['Ignoring new purchases or fees.', 'Assuming every issuer calculates the minimum the same way.', 'Treating the calculated payment as financial advice rather than an estimate.', 'Using a payoff plan that the monthly budget cannot sustain.'],
    glossary: [['APR', 'Annual percentage rate used to express borrowing cost.'], ['Minimum payment', 'The smallest amount the issuer requires for a billing cycle.'], ['Amortization', 'A repayment schedule that allocates each payment between interest and principal.'], ['Principal', 'The outstanding amount borrowed, before interest and fees.']],
    faqs: [
      { question: 'Why can minimum payments take so long?', answer: 'A minimum payment often falls as the balance falls. When interest consumes a large part of each payment, principal declines slowly, extending the repayment period.' },
      { question: 'Is three years a required credit-card payoff period?', answer: 'No. Thirty-six months is a comparison horizon. Your actual plan should reflect the balance, APR, cash flow, issuer rules, and ability to avoid new debt.' },
      { question: 'Does this calculator include future purchases?', answer: 'No. It assumes no additional purchases unless explicitly modeled. New charges can materially extend repayment.' },
    ],
    sources: [{ name: 'CFPB', note: 'Consumer guidance on credit-card payments, interest, and debt.' }, { name: 'Federal Reserve', note: 'Consumer credit and revolving-credit context.' }],
    related: ['credit-cards-payoff-calculator', 'debt-payoff-calculator', 'debt-consolidation-calculator', 'debt-to-income-ratio-calculator'],
  },
  'credit-cards-payoff-calculator': {
    slug: 'credit-cards-payoff-calculator', title: 'Credit Cards Payoff Calculator', icon: '🧾', category: 'Credit & Debt',
    description: 'Aggregate multiple credit-card balances, APRs, and monthly payments into one payoff picture.',
    rule: 'Total debt cost is driven by both the balances and the interest rates applied to each balance.',
    formula: 'Total Balance = ΣPᵢ; Monthly Interest ≈ Σ(Pᵢ × APRᵢ ÷ 12)',
    variables: [['Pᵢ', 'Balance on card i'], ['APRᵢ', 'Annual percentage rate on card i'], ['Paymentᵢ', 'Planned monthly payment on card i'], ['Σ', 'Sum across all cards']],
    mathCallout: 'The aggregator totals balances and estimates first-month interest. Payoff timing depends on payment allocation, minimum-payment rules, compounding, fees, and whether new purchases occur.',
    howTo: ['Add each credit card and its balance.', 'Enter each APR and planned payment.', 'Review total balance and estimated monthly interest.', 'Use the combined picture to prioritize the highest-cost debt.'],
    example: { scenario: 'Three cards: $2,000 at 29%, $4,000 at 21%, and $1,000 at 17%.', steps: ['Total balance = $2,000 + $4,000 + $1,000.', 'Estimated first-month interest = Σ(balance × APR ÷ 12).', 'Identify the highest APR card as the highest-cost target.', 'Direct extra money according to your chosen payoff strategy.'], output: 'Total balance: $7,000; estimated first-month interest: about $139.17 before fees and payment effects.' },
    useCases: ['Get a single view of revolving debt.', 'Estimate the monthly interest burden.', 'Prepare inputs for avalanche or snowball planning.', 'Track progress as individual cards reach zero.'],
    mistakes: ['Leaving out a card or promotional balance.', 'Using a promotional APR after it has expired.', 'Comparing APRs without considering balances.', 'Assuming minimum payments are interchangeable across issuers.'],
    glossary: [['Balance', 'Current amount owed on a card.'], ['APR', 'Annualized borrowing rate.'], ['Utilization', 'Credit-card balance relative to available credit.'], ['Promo APR', 'A temporary promotional interest rate with issuer-specific terms.']],
    faqs: [
      { question: 'What does the aggregate interest estimate mean?', answer: 'It estimates one month of simple periodic interest from the supplied balances and APRs. Statement timing, average daily balance methods, fees, and payments can make actual interest different.' },
      { question: 'Which card should I pay first?', answer: 'The debt avalanche prioritizes the highest APR, while the snowball prioritizes the smallest balance. The calculator shows the inputs needed for either approach.' },
      { question: 'Can I include more than one credit card?', answer: 'Yes. The interactive calculator supports up to eight cards and recalculates totals instantly on your device.' },
    ],
    sources: [{ name: 'CFPB', note: 'Credit-card interest and repayment education.' }, { name: 'Federal Reserve', note: 'Credit-card and revolving-credit data context.' }],
    related: ['credit-card-calculator', 'debt-payoff-calculator', 'debt-consolidation-calculator', 'debt-to-income-ratio-calculator'],
  },
  'debt-payoff-calculator': {
    slug: 'debt-payoff-calculator', title: 'Debt Payoff Calculator', icon: '📉', category: 'Debt Planning',
    description: 'Compare the debt avalanche and debt snowball methods using your balances, APRs, and extra monthly budget.',
    rule: 'Avalanche attacks the highest interest rate first; snowball attacks the lowest balance first.',
    formula: 'Interestₜ = Balanceₜ × APR / 12; Paymentₜ = Minimumₜ + Extra',
    variables: [['Balance', 'Outstanding debt balance'], ['APR', 'Annual interest rate'], ['Minimum', 'Required monthly payment'], ['Extra', 'Additional monthly payoff budget']],
    mathCallout: 'The comparison is a planning model. Each month, interest is added, the selected target receives available extra money, and payments continue until modeled balances reach zero. Actual lender rounding and minimum-payment rules may change results.',
    howTo: ['Enter up to eight debts with balances, APRs, and minimum payments.', 'Enter the extra amount available each month.', 'Compare the avalanche and snowball priority orders.', 'Use the method that balances mathematical savings with a plan you can maintain.'],
    example: { scenario: '$5,000 at 24% and $1,500 at 12%, with $250/month extra.', steps: ['Snowball targets the $1,500 balance first.', 'Avalanche targets the 24% balance first.', 'Both methods preserve minimum payments on the other debt.', 'Once the target is cleared, its payment rolls into the next target.'], output: 'Avalanche generally minimizes interest when all assumptions are equal; snowball can create an earlier small-balance win.' },
    useCases: ['Choose a payoff priority method.', 'Estimate the effect of extra monthly payments.', 'Visualize payment rollovers after a debt is cleared.', 'Compare motivation-focused and interest-focused strategies.'],
    mistakes: ['Stopping minimum payments on non-target debts.', 'Adding new debt while following a payoff plan.', 'Ignoring variable rates or fees.', 'Choosing a monthly extra amount that is not sustainable.'],
    glossary: [['Avalanche', 'Highest-interest debt first.'], ['Snowball', 'Lowest-balance debt first.'], ['Rollover', 'Applying a cleared debt’s payment to the next target.'], ['Minimum payment', 'Required payment that keeps an account current under its terms.']],
    faqs: [
      { question: 'Which method saves more interest?', answer: 'When rates, minimums, and payment capacity are held constant, the avalanche method generally minimizes interest because it prioritizes the highest-rate debt.' },
      { question: 'Is the snowball method wrong?', answer: 'No. Snowball can provide quicker visible wins, which may improve consistency. Behavioral sustainability can matter as much as a small modeled interest difference.' },
      { question: 'Does the model include fees?', answer: 'No. Add lender fees separately when evaluating a real repayment plan.' },
    ],
    sources: [{ name: 'CFPB', note: 'Consumer debt-management and credit guidance.' }, { name: 'Federal Trade Commission', note: 'Debt and credit education resources.' }],
    related: ['credit-cards-payoff-calculator', 'credit-card-calculator', 'debt-consolidation-calculator', 'debt-to-income-ratio-calculator'],
  },
  'debt-consolidation-calculator': {
    slug: 'debt-consolidation-calculator', title: 'Debt Consolidation Calculator', icon: '🔄', category: 'Debt Planning',
    description: 'Compare the weighted average APR of existing debts with a proposed consolidation loan rate and payment.',
    rule: 'A consolidation rate below the current weighted average rate can reduce interest, but fees and a longer term can offset the benefit.',
    formula: 'Weighted APR = Σ(Pᵢ × APRᵢ) / ΣPᵢ',
    variables: [['Pᵢ', 'Debt balance i'], ['APRᵢ', 'Annual rate on debt i'], ['Weighted APR', 'Balance-weighted average APR'], ['Loan APR', 'Proposed consolidation rate']],
    mathCallout: 'The weighted APR gives a rate comparison, not a guarantee of savings. A valid decision also needs origination fees, transfer fees, collateral risk, term length, and the behavior that follows consolidation.',
    howTo: ['Enter each debt balance and APR.', 'Enter the proposed consolidation APR and term.', 'Compare the weighted current APR with the new loan rate.', 'Review estimated payment and interest, including any stated fees.'],
    example: { scenario: '$3,000 at 28% and $7,000 at 18%, consolidated at 14% for 48 months.', steps: ['Weighted APR = (3,000×28% + 7,000×18%) ÷ 10,000 = 21%.', 'The proposed rate is 7 percentage points lower.', 'A 48-month payment is calculated from the $10,000 principal and 14% APR.', 'Compare total interest plus fees against the existing repayment plan.'], output: 'Current weighted APR: 21%; proposed APR: 14%. Lower rate does not automatically mean lower total cost.' },
    useCases: ['Screen a consolidation offer.', 'Understand how a large high-rate balance affects the average rate.', 'Compare loan rates before applying.', 'Separate rate savings from term and fee effects.'],
    mistakes: ['Comparing only APR and ignoring fees.', 'Extending the term without checking total interest.', 'Using a teaser rate after its promotional period.', 'Running up the old cards again after consolidation.'],
    glossary: [['Weighted APR', 'Average APR weighted by each debt’s balance.'], ['Consolidation', 'Combining multiple debts into one account or loan.'], ['Origination fee', 'Upfront fee charged for creating a loan.'], ['Term', 'Length of the repayment period.']],
    faqs: [
      { question: 'What is a good consolidation rate?', answer: 'There is no universal threshold. A useful comparison starts with your weighted current APR, then adjusts for fees, term, collateral, and the certainty of the offered rate.' },
      { question: 'Can a lower rate still cost more?', answer: 'Yes. A longer repayment term or substantial fees can increase total dollars paid even when the interest rate is lower.' },
      { question: 'Does consolidation reduce debt?', answer: 'Consolidation changes the structure of debt; it does not erase principal. Savings depend on the terms and subsequent spending behavior.' },
    ],
    sources: [{ name: 'CFPB', note: 'Debt consolidation and consumer-loan guidance.' }, { name: 'FTC', note: 'Consumer advice on debt relief and consolidation offers.' }],
    related: ['debt-payoff-calculator', 'credit-cards-payoff-calculator', 'credit-card-calculator', 'debt-to-income-ratio-calculator'],
  },
  'debt-to-income-ratio-calculator': {
    slug: 'debt-to-income-ratio-calculator', title: 'Debt-to-Income Ratio Calculator', icon: '🏠', category: 'Mortgage & Affordability',
    description: 'Calculate front-end housing DTI and back-end total DTI, then show a simple planning risk score.',
    rule: 'DTI = monthly debt obligations divided by gross monthly income; lenders may apply different program-specific thresholds.',
    formula: 'Front-End DTI = Housing / Gross Income × 100; Back-End DTI = Total Monthly Debt / Gross Income × 100',
    variables: [['Housing', 'Monthly principal, interest, taxes, insurance and eligible housing costs'], ['Debt', 'Monthly housing cost plus recurring debt obligations'], ['Income', 'Gross monthly income before taxes'], ['DTI', 'Debt-to-income ratio']],
    mathCallout: 'The calculator uses gross monthly income and user-supplied obligations. The risk score is educational, not an underwriting decision. Lenders can count income and debts differently and may use compensating factors.',
    howTo: ['Enter gross monthly income.', 'Enter monthly housing costs and recurring non-housing debt.', 'Review front-end and back-end DTI percentages.', 'Use the planning score as a prompt to verify the applicable lender or program guidelines.'],
    example: { scenario: '$8,000 gross monthly income, $2,000 housing costs, and $800 other monthly debt.', steps: ['Front-end DTI = $2,000 ÷ $8,000 = 25%.', 'Back-end DTI = ($2,000 + $800) ÷ $8,000 = 35%.', 'The model classifies both ratios against broad educational planning bands.', 'Confirm actual underwriting criteria with the lender and loan program.'], output: 'Front-end DTI: 25%; back-end DTI: 35%; educational planning risk: moderate.' },
    useCases: ['Pre-screen housing affordability.', 'Understand how new debt changes total DTI.', 'Prepare for a mortgage conversation.', 'Compare income and recurring obligations before applying.'],
    mistakes: ['Using net income instead of gross income.', 'Forgetting recurring minimum debt payments.', 'Assuming one DTI threshold applies to every lender.', 'Treating the score as an underwriting approval.'],
    glossary: [['DTI', 'Debt obligations divided by gross monthly income.'], ['Front-end DTI', 'Housing expense ratio.'], ['Back-end DTI', 'Housing plus other recurring debt ratio.'], ['Gross income', 'Income before taxes and other deductions.']],
    faqs: [
      { question: 'What is front-end DTI?', answer: 'Front-end DTI measures monthly housing expense relative to gross monthly income. Mortgage programs can define eligible housing costs differently.' },
      { question: 'What is back-end DTI?', answer: 'Back-end DTI includes the housing expense plus other recurring debt obligations, divided by gross monthly income.' },
      { question: 'What DTI is considered safe?', answer: 'There is no single safe number for every household or loan program. Use the result as a planning signal and verify the lender’s current underwriting requirements.' },
    ],
    sources: [{ name: 'CFPB', note: 'Mortgage affordability and DTI consumer education.' }, { name: 'Fannie Mae', note: 'Mortgage underwriting and DTI guidance.' }, { name: 'Freddie Mac', note: 'Mortgage underwriting context.' }],
    related: ['debt-consolidation-calculator', 'debt-payoff-calculator', 'credit-cards-payoff-calculator', 'credit-card-calculator'],
  },
};

export function getCalculatorDefinition(slug: string): CalculatorDefinition | undefined {
  return definitions[slug as CalculatorSlug];
}

export function getCalculatorSlugs(): CalculatorSlug[] { return Object.keys(definitions) as CalculatorSlug[]; }
