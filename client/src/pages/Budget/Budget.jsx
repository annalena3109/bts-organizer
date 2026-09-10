import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Trash2,
  Coffee,
  ShoppingBag,
  BookOpen,
  UtensilsCrossed,
  Bus,
  Tag,
  DollarSign,
  TrendingDown
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../services/api';

const INITIAL_EXPENSES = [
  { id: '1', amount: 4.85, category: 'Snacks & Coffee', note: 'Iced oat latte at Campus Cafe', date: '2026-09-10' },
  { id: '2', amount: 6.50, category: 'Snacks & Coffee', note: 'Matcha pastry & sparkling water', date: '2026-09-09' },
  { id: '3', amount: 34.20, category: 'Groceries', note: 'Weekly produce & sourdough bread', date: '2026-09-08' },
  { id: '4', amount: 18.00, category: 'School Supplies', note: 'Grid notebooks & highlighter pens', date: '2026-09-07' },
  { id: '5', amount: 12.50, category: 'Dining Out', note: 'Lunch burrito bowl with study group', date: '2026-09-06' },
];

export default function Budget() {
  const [budgetLimits, setBudgetLimits] = useState({
    monthly: 500.00,
    weekly: 125.00,
    daily: 20.00,
    snackWeekly: 30.00,
  });

  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  // Expense form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Snacks & Coffee');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    async function loadBudgetData() {
      try {
        const [limitsRes, expensesRes] = await Promise.all([
          apiRequest('/budget'),
          apiRequest('/expenses')
        ]);
        if (limitsRes && limitsRes.monthly) setBudgetLimits(limitsRes);
        if (Array.isArray(expensesRes)) setExpenses(expensesRes);
      } catch (e) {
        // use fallback
      }
    }
    loadBudgetData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const newExpense = {
      id: String(Date.now()),
      amount: numAmount,
      category,
      note,
      date,
      created_at: new Date().toISOString()
    };

    setExpenses(prev => [newExpense, ...prev]);
    try {
      await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify(newExpense)
      });
    } catch (err) {
      console.warn('Saved locally');
    }

    setAmount('');
    setNote('');
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = async (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    try {
      await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // Calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const snackSpent = expenses
    .filter(e => e.category === 'Snacks & Coffee')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const monthlyRemaining = Math.max(0, budgetLimits.monthly - totalSpent);
  const monthlyPercent = Math.min(100, Math.round((totalSpent / budgetLimits.monthly) * 100));

  const snackRemaining = Math.max(0, budgetLimits.snackWeekly - snackSpent);
  const snackPercent = Math.min(100, Math.round((snackSpent / budgetLimits.snackWeekly) * 100));

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Snacks & Coffee': return Coffee;
      case 'Groceries': return ShoppingBag;
      case 'School Supplies': return BookOpen;
      case 'Dining Out': return UtensilsCrossed;
      case 'Transport': return Bus;
      default: return Tag;
    }
  };

  return (
    <div className="budget-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Budget & Expenses</h1>
          <p>Track your student allowances, daily coffee/snack limits, and spending habits.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => setIsLimitModalOpen(true)}>
            Edit Limits
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsExpenseModalOpen(true)}>
            Add Expense
          </Button>
        </div>
      </div>

      {/* 4 Core Budget Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        {/* Monthly Budget */}
        <Card subtle>
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>MONTHLY BUDGET</span>
            <Wallet size={15} color="var(--accent-sage)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px' }}>
            ${monthlyRemaining.toFixed(2)}
          </p>
          <div className="progress-bar-container" style={{ margin: '8px 0 6px 0' }}>
            <div className="progress-bar-fill" style={{ width: `${monthlyPercent}%`, background: 'var(--accent-sage)' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            ${totalSpent.toFixed(2)} spent of ${budgetLimits.monthly.toFixed(2)} limit
          </span>
        </Card>

        {/* Weekly Budget */}
        <Card subtle>
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>WEEKLY BUDGET</span>
            <DollarSign size={15} color="var(--accent-amber)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px' }}>
            ${(budgetLimits.weekly - totalSpent).toFixed(2)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Weekly target: ${budgetLimits.weekly.toFixed(2)}
          </span>
        </Card>

        {/* Daily Allowance */}
        <Card subtle>
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DAILY ALLOWANCE</span>
            <TrendingDown size={15} color="var(--accent-slate)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px' }}>
            ${budgetLimits.daily.toFixed(2)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Calculated target per day
          </span>
        </Card>

        {/* Snack & Coffee Budget */}
        <Card subtle>
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SNACK & COFFEE</span>
            <Coffee size={15} color="var(--accent-terracotta)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px' }}>
            ${snackRemaining.toFixed(2)}
          </p>
          <div className="progress-bar-container" style={{ margin: '8px 0 6px 0' }}>
            <div className="progress-bar-fill" style={{ width: `${snackPercent}%`, background: 'var(--accent-terracotta)' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            ${snackSpent.toFixed(2)} spent of ${budgetLimits.snackWeekly.toFixed(2)}
          </span>
        </Card>
      </div>

      {/* Expenses List */}
      <Card
        title="Recent Expenses"
        subtitle="Chronological list of campus, snack, grocery, and living purchases"
      >
        {expenses.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No expenses recorded yet"
            description="Log coffee, textbook purchases, or dining to keep your budget balanced."
            action={
              <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsExpenseModalOpen(true)}>
                Add First Expense
              </Button>
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {expenses.map((expense) => {
              const Icon = getCategoryIcon(expense.category);
              return (
                <div
                  key={expense.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card-subtle)',
                        color: 'var(--accent-sage)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {expense.note || expense.category}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                        <Badge variant="subtle">{expense.category}</Badge>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{expense.date}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      -${Number(expense.amount).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExpense(expense.id)}
                      title="Delete expense"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Log An Expense"
      >
        <form onSubmit={handleAddExpense}>
          <Input
            label="Amount ($)"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5.50"
            required
            autoFocus
          />

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Snacks & Coffee">Snacks & Coffee</option>
              <option value="Groceries">Groceries</option>
              <option value="School Supplies">School Supplies</option>
              <option value="Dining Out">Dining Out</option>
              <option value="Transport">Transport</option>
              <option value="Personal">Personal</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <Input
            label="Note / Description"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Iced latte, biology lab notebook"
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Budget Limits Modal */}
      <Modal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        title="Configure Budget Limits"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          setIsLimitModalOpen(false);
          apiRequest('/budget', {
            method: 'PUT',
            body: JSON.stringify(budgetLimits)
          }).catch(() => {});
        }}>
          <Input
            label="Monthly Limit ($)"
            type="number"
            value={budgetLimits.monthly}
            onChange={(e) => setBudgetLimits({ ...budgetLimits, monthly: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Weekly Limit ($)"
            type="number"
            value={budgetLimits.weekly}
            onChange={(e) => setBudgetLimits({ ...budgetLimits, weekly: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Daily Allowance ($)"
            type="number"
            value={budgetLimits.daily}
            onChange={(e) => setBudgetLimits({ ...budgetLimits, daily: parseFloat(e.target.value) || 0 })}
            required
          />
          <Input
            label="Weekly Snack & Coffee Limit ($)"
            type="number"
            value={budgetLimits.snackWeekly}
            onChange={(e) => setBudgetLimits({ ...budgetLimits, snackWeekly: parseFloat(e.target.value) || 0 })}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsLimitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Limits
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
