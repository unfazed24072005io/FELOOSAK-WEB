// src/lib/ai/insights.ts
import { callAI } from './providers/llm-providers';

export async function getAIInsights(
  transactions: any[],
  region: any,
  currency: string,
  customers: any[]
): Promise<any[]> {
  const insights = [];
  
  const totalIn = transactions.filter(t => t.ty === 'in').reduce((s, t) => s + t.am, 0);
  const totalOut = transactions.filter(t => t.ty === 'out').reduce((s, t) => s + t.am, 0);
  const balance = totalIn - totalOut;
  
  // Always show basic insights (no API needed)
  if (balance < 0) {
    insights.push({
      type: 'cashflow',
      title: '⚠️ Negative Cash Flow',
      description: `Your expenses (${currency} ${totalOut.toLocaleString()}) exceed income (${currency} ${totalIn.toLocaleString()}) by ${currency} ${Math.abs(balance).toLocaleString()}.`,
      severity: 'high',
      action: 'Review expenses'
    });
  } else if (transactions.length > 0) {
    insights.push({
      type: 'cashflow',
      title: '📊 Financial Summary',
      description: `Total Income: ${currency} ${totalIn.toLocaleString()} | Expenses: ${currency} ${totalOut.toLocaleString()} | Balance: ${currency} ${balance.toLocaleString()}`,
      severity: 'low',
    });
  }
  
  // VAT insight
  const vatRate = region.id === 'EG' ? 0.14 : 0.05;
  const estimatedVat = Math.round(totalIn * vatRate);
  if (totalIn > 0) {
    insights.push({
      type: 'vat',
      title: '💰 VAT Estimate',
      description: `Estimated VAT: ${currency} ${estimatedVat.toLocaleString()} (${vatRate * 100}%). ${region.id === 'EG' ? 'File monthly via ETA portal.' : 'File quarterly via FTA.'}`,
      severity: 'medium',
      action: 'Prepare VAT return'
    });
  }
  
  // Customer insight
  const overdueCustomers = customers.filter(c => c.ow > 0);
  if (overdueCustomers.length > 0) {
    const totalOwed = overdueCustomers.reduce((s, c) => s + c.ow, 0);
    insights.push({
      type: 'customer',
      title: `👥 ${overdueCustomers.length} Customer(s) Owe Money`,
      description: `Total receivables: ${currency} ${totalOwed.toLocaleString()}. Send reminders to clear payments.`,
      severity: 'high',
      action: 'Send payment reminders'
    });
  }
  
  return insights;
}

export async function askAI(query: string, context: any): Promise<string> {
  const { region, totalIncome, totalExpense, balance, customers, books } = context;
  const currency = region.cur;
  const q = query.toLowerCase();
  
  // Cash flow questions
  if (q.includes('cash flow') || q.includes('overview') || q.includes('summary')) {
    return `📊 **Cash Flow Summary**

• Total Income: ${currency} ${totalIncome.toLocaleString()}
• Total Expenses: ${currency} ${totalExpense.toLocaleString()}
• Net Balance: ${currency} ${balance.toLocaleString()}
• Cash Flow Ratio: ${((totalIncome / Math.max(totalExpense, 1)) * 100).toFixed(0)}%

${balance > 0 ? '✅ Your cash flow is positive. Keep up the good work!' : '⚠️ Your expenses exceed income. Consider reducing costs.'}`;
  }
  
  // VAT questions
  if (q.includes('vat') || q.includes('tax') || q.includes('ضريبة')) {
    const vatRate = region.id === 'EG' ? 0.14 : 0.05;
    const outputVat = Math.round(totalIncome * vatRate);
    const inputVat = Math.round(totalExpense * vatRate);
    const netVat = outputVat - inputVat;
    
    return `🧾 **VAT Breakdown (${region.vl})**

• Output VAT (on sales): ${currency} ${outputVat.toLocaleString()}
• Input VAT (on purchases): ${currency} ${inputVat.toLocaleString()}
• **Net VAT Payable: ${currency} ${netVat.toLocaleString()}**

${region.id === 'EG' 
  ? '📅 Filing: Monthly via ETA portal, within 30 days after period end.'
  : '📅 Filing: Quarterly via FTA portal, due 28 days after period.'}`;
  }
  
  // Customer questions
  if (q.includes('customer') || q.includes('overdue') || q.includes('receivable')) {
    const overdue = customers.filter((c: any) => c.ow > 0);
    if (overdue.length === 0) {
      return `✅ **All customers are clear!**

No outstanding payments. Total customers: ${customers.length}`;
    }
    const totalOwed = overdue.reduce((s: number, c: any) => s + c.ow, 0);
    return `👥 **Customer Receivables**

⚠️ ${overdue.length} customer(s) owe ${currency} ${totalOwed.toLocaleString()}

${overdue.slice(0, 5).map((c: any) => `• ${c.nm}: ${currency} ${c.ow.toLocaleString()} (Trust: ${c.tr}%)`).join('\n')}

💡 Send payment reminders to clear receivables.`;
  }
  
  // Expense questions
  if (q.includes('expense') || q.includes('spending') || q.includes('cost')) {
    return `📉 **Expense Analysis**

Total expenses: ${currency} ${totalExpense.toLocaleString()}

💡 **Tips to reduce expenses:**
• Review recurring subscriptions
• Negotiate with suppliers
• Track all business expenses for tax deductions
• Use the expense categories to identify major spending areas`;
  }
  
  // Default response
  return `💡 **Ask me about:**

• **"Cash flow"** — Overview of income vs expenses
• **"VAT breakdown"** — Tax calculations for ${region.n}
• **"Customer receivables"** — Who owes you money
• **"Expense analysis"** — Top spending categories
• **"Overdue customers"** — Payment reminders

What would you like to know?`;
}