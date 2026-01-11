function normalizeExpenses(expenses) {
  if (!Array.isArray(expenses)) return [];
  return expenses.map((item) => ({
    date: item.date || '',
    amount: Number(item.amount || 0),
    description: item.description || '',
    receipts: Array.isArray(item.receipts) ? item.receipts : [],
  }));
}

function calcExpenseTotal(expenses) {
  return normalizeExpenses(expenses).reduce((sum, item) => sum + item.amount, 0);
}

module.exports = {
  normalizeExpenses,
  calcExpenseTotal,
};
