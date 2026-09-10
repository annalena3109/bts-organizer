import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  BookOpen,
  ShoppingBag,
  Snowflake,
  ChefHat,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../services/api';

const DEFAULT_WEEKDAY_ROTATION = {
  Monday: { breakfast: 'Overnight oats with chia & berries', lunch: 'Quinoa & sweet potato bowl', dinner: 'Lentil soup with sourdough', snack: 'Apple & almond butter' },
  Tuesday: { breakfast: 'Greek yogurt & homemade granola', lunch: 'Quinoa & sweet potato bowl', dinner: 'Tofu stir fry with brown rice', snack: 'Handful of roasted almonds' },
  Wednesday: { breakfast: 'Overnight oats with chia & berries', lunch: 'Tofu stir fry with brown rice', dinner: 'Chickpea spinach curry', snack: 'Carrot sticks & hummus' },
  Thursday: { breakfast: 'Toasted whole wheat with avocado', lunch: 'Chickpea spinach curry', dinner: 'Warm lentil soup & sourdough', snack: 'Dark chocolate square' },
  Friday: { breakfast: 'Greek yogurt with honey', lunch: 'Mediterranean wrap', dinner: 'Homemade sourdough pizza', snack: 'Mixed berry smoothie' },
  Saturday: { breakfast: 'Pancakes with blueberries', lunch: 'Farmers market salad', dinner: 'Slow-simmered veggie chili', snack: 'Popcorn & tea' },
  Sunday: { breakfast: 'Herb scrambled eggs & toast', lunch: 'Veggie chili leftovers', dinner: 'Roasted veggies with polenta', snack: 'Sliced peaches' },
};

const INITIAL_SHOPPING = [
  { id: '1', item: 'Rolled Oats (1kg)', category: 'Pantry', checked: true },
  { id: '2', item: 'Sweet Potatoes (4)', category: 'Produce', checked: false },
  { id: '3', item: 'Organic Spinach (2 bags)', category: 'Produce', checked: false },
  { id: '4', item: 'Greek Yogurt (32oz)', category: 'Dairy/Alt', checked: true },
  { id: '5', item: 'Brown Lentils (dry)', category: 'Pantry', checked: false },
  { id: '6', item: 'Firm Tofu (2 blocks)', category: 'Protein', checked: false },
];

const INITIAL_FREEZER = [
  { id: '1', name: 'Golden Turmeric Lentil Dahl', portions: 3, date_frozen: '2026-09-03', notes: 'Great for late study nights' },
  { id: '2', name: 'Black Bean & Corn Chili', portions: 2, date_frozen: '2026-08-28', notes: 'Top with avocado & lime' },
  { id: '3', name: 'Prepped Smoothie Fruit Packs', portions: 4, date_frozen: '2026-09-06', notes: 'Blend with oat milk' },
];

function formatDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function Food() {
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'shopping', 'freezer', 'prep'

  // Rolling calendar date window offset from today (in days, multiples of 7 for weeks)
  const [startOffsetDays, setStartOffsetDays] = useState(0);

  // Cached meal plan dictionary keyed by YYYY-MM-DD
  const [mealPlan, setMealPlan] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_meals');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {};
  });

  const [shoppingList, setShoppingList] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_shopping');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_SHOPPING;
  });

  const [freezerMeals, setFreezerMeals] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_freezer');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_FREEZER;
  });

  // Modals
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [selectedDateKey, setSelectedDateKey] = useState('');
  const [selectedDateFormatted, setSelectedDateFormatted] = useState('');
  const [editMealType, setEditMealType] = useState('breakfast');
  const [mealText, setMealText] = useState('');

  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState('Produce');

  // Saturday Workflow Checklist
  const [saturdaySteps, setSaturdaySteps] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_saturday_steps');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [
      { id: 1, text: 'Audit fridge, pantry, and produce before grocery shopping', done: true },
      { id: 2, text: 'Select 3 core weekday batch recipes (1 grain bowl, 1 soup/stew, 1 quick protein)', done: true },
      { id: 3, text: 'Add missing staple ingredients to the Sunday Shopping List', done: false },
      { id: 4, text: 'Review school exam schedule to ensure meals match busy evenings', done: false },
    ];
  });

  // Sunday Meal Prep Checklist
  const [sundaySteps, setSundaySteps] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_sunday_steps');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [
      { id: 1, text: 'Cook grain base in batch (Quinoa / Brown Rice / Farro)', done: false },
      { id: 2, text: 'Roast sheet-pan vegetables (Sweet potatoes, broccoli, peppers)', done: false },
      { id: 3, text: 'Simmer weekday soup or batch curry (Lentils or Chili)', done: false },
      { id: 4, text: 'Pre-portion overnight oats jars for Monday through Thursday', done: true },
      { id: 5, text: 'Wash, dry, and spin salad greens; store with dry cloth', done: false },
      { id: 6, text: 'Label and freeze 2 portions for emergency study nights', done: false },
    ];
  });

  // Load from API on mount
  useEffect(() => {
    async function loadFoodData() {
      try {
        const [mealsRes, shopRes, freezerRes] = await Promise.all([
          apiRequest('/meals'),
          apiRequest('/shopping-list'),
          apiRequest('/freezer-meals')
        ]);
        if (mealsRes && typeof mealsRes === 'object') {
          setMealPlan(prev => {
            const merged = { ...prev, ...mealsRes };
            try { localStorage.setItem('bts_cached_meals', JSON.stringify(merged)); } catch (e) {}
            return merged;
          });
        }
        if (Array.isArray(shopRes)) {
          setShoppingList(shopRes);
          try { localStorage.setItem('bts_cached_shopping', JSON.stringify(shopRes)); } catch (e) {}
        }
        if (Array.isArray(freezerRes)) {
          setFreezerMeals(freezerRes);
          try { localStorage.setItem('bts_cached_freezer', JSON.stringify(freezerRes)); } catch (e) {}
        }
      } catch (e) {
        // use cached data
      }
    }
    loadFoodData();
  }, []);

  // Compute the 7-day rolling window starting at today + startOffsetDays
  const rollingDays = useMemo(() => {
    const today = new Date();
    // Normalize to midnight
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    base.setDate(base.getDate() + startOffsetDays);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateKey = formatDateKey(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedTitle = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      const isToday = dateKey === formatDateKey(today);

      days.push({
        dateObj: d,
        dateKey,
        dayName,
        formattedTitle,
        isToday,
      });
    }
    return days;
  }, [startOffsetDays]);

  const windowLabel = useMemo(() => {
    if (rollingDays.length < 7) return '';
    const first = rollingDays[0];
    const last = rollingDays[6];
    const firstStr = first.isToday ? 'Today' : first.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const lastStr = last.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${firstStr} – ${lastStr}`;
  }, [rollingDays]);

  // Open modal to edit specific date and meal type
  const openEditMeal = (dayObj, type) => {
    setSelectedDateKey(dayObj.dateKey);
    setSelectedDateFormatted(dayObj.formattedTitle);
    setEditMealType(type);

    // Get current text for dateKey, or fallback to day-of-week rotation idea
    const dayMeals = mealPlan[dayObj.dateKey] || {};
    const fallbackIdea = DEFAULT_WEEKDAY_ROTATION[dayObj.dayName]?.[type] || '';
    setMealText(dayMeals[type] !== undefined ? dayMeals[type] : fallbackIdea);
    setIsMealModalOpen(true);
  };

  const saveMeal = async (e) => {
    e.preventDefault();
    if (!selectedDateKey) return;

    const currentDayMeals = mealPlan[selectedDateKey] || {};
    const updatedDayMeals = {
      ...currentDayMeals,
      [editMealType]: mealText.trim()
    };

    const updatedPlan = {
      ...mealPlan,
      [selectedDateKey]: updatedDayMeals
    };

    setMealPlan(updatedPlan);
    try { localStorage.setItem('bts_cached_meals', JSON.stringify(updatedPlan)); } catch (err) {}

    try {
      await apiRequest('/meals', {
        method: 'PUT',
        body: JSON.stringify({
          date: selectedDateKey,
          ...updatedDayMeals
        })
      });
    } catch (err) {
      console.warn('Saved locally');
    }

    setIsMealModalOpen(false);
  };

  const toggleSaturdayStep = (id) => {
    const updated = saturdaySteps.map(s => s.id === id ? { ...s, done: !s.done } : s);
    setSaturdaySteps(updated);
    try { localStorage.setItem('bts_cached_saturday_steps', JSON.stringify(updated)); } catch (e) {}
  };

  const toggleSundayStep = (id) => {
    const updated = sundaySteps.map(s => s.id === id ? { ...s, done: !s.done } : s);
    setSundaySteps(updated);
    try { localStorage.setItem('bts_cached_sunday_steps', JSON.stringify(updated)); } catch (e) {}
  };

  const toggleShoppingItem = async (id) => {
    const target = shoppingList.find(i => i.id === id);
    if (!target) return;
    const newChecked = !target.checked;
    const updated = shoppingList.map(i => i.id === id ? { ...i, checked: newChecked } : i);
    setShoppingList(updated);
    try { localStorage.setItem('bts_cached_shopping', JSON.stringify(updated)); } catch (e) {}
    try {
      await apiRequest(`/shopping-list/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ checked: newChecked })
      });
    } catch (e) {}
  };

  const addShoppingItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem = {
      id: String(Date.now()),
      item: newItemName,
      category: newItemCat,
      checked: false
    };
    const updated = [...shoppingList, newItem];
    setShoppingList(updated);
    try { localStorage.setItem('bts_cached_shopping', JSON.stringify(updated)); } catch (e) {}
    try {
      await apiRequest('/shopping-list', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
    } catch (e) {}
    setNewItemName('');
    setIsShoppingModalOpen(false);
  };

  const deleteShoppingItem = async (id) => {
    const updated = shoppingList.filter(i => i.id !== id);
    setShoppingList(updated);
    try { localStorage.setItem('bts_cached_shopping', JSON.stringify(updated)); } catch (e) {}
    try {
      await apiRequest(`/shopping-list/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const tabs = [
    { id: 'plan', label: '7-Day Meal Calendar', icon: Calendar },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingBag, badge: shoppingList.filter(i => !i.checked).length },
    { id: 'freezer', label: 'Freezer Meals', icon: Snowflake, badge: freezerMeals.length },
    { id: 'prep', label: 'Prep Rituals', icon: ChefHat },
  ];

  return (
    <div className="food-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Meal Calendar & Nutrition</h1>
          <p>Rolling date-based meal planner covering the entire school year.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {startOffsetDays !== 0 && (
            <Button
              variant="secondary"
              icon={RotateCcw}
              size="sm"
              onClick={() => setStartOffsetDays(0)}
            >
              Today's View
            </Button>
          )}
          <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsShoppingModalOpen(true)}>
            Add Grocery Item
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB 1: ROLLING 7-DAY MEAL CALENDAR */}
      {activeTab === 'plan' && (
        <div>
          {/* Calendar Navigation Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setStartOffsetDays(prev => prev - 7)}
                title="Previous 7 Days"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setStartOffsetDays(prev => prev + 7)}
                title="Next 7 Days"
              >
                <ChevronRight size={16} />
              </Button>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginLeft: '0.25rem' }}>
                {windowLabel}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {startOffsetDays !== 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStartOffsetDays(0)}
                  style={{ color: 'var(--accent-sage)', fontWeight: 600 }}
                >
                  Jump to Today
                </Button>
              )}
              {/* Optional jump to specific date */}
              <input
                type="date"
                onChange={(e) => {
                  if (!e.target.value) return;
                  const picked = new Date(e.target.value + 'T00:00:00');
                  const today = new Date();
                  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const diffDays = Math.round((picked - todayMidnight) / (1000 * 60 * 60 * 24));
                  setStartOffsetDays(diffDays);
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
                title="Jump to date in calendar"
              />
            </div>
          </div>

          {/* 7-Day Rolling Day Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rollingDays.map((dayObj) => {
              const dateKey = dayObj.dateKey;
              const dayMeals = mealPlan[dateKey] || {};
              const defaultIdea = DEFAULT_WEEKDAY_ROTATION[dayObj.dayName] || {};

              return (
                <Card
                  key={dateKey}
                  style={{
                    padding: '1.25rem',
                    border: dayObj.isToday ? '2px solid var(--accent-sage)' : '1px solid var(--border-color)',
                    background: dayObj.isToday ? 'var(--bg-card)' : 'var(--bg-card)',
                    position: 'relative'
                  }}
                >
                  <div
                    className="flex-between"
                    style={{
                      marginBottom: '0.85rem',
                      paddingBottom: '0.6rem',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {dayObj.formattedTitle}
                      </h3>
                      {dayObj.isToday && (
                        <Badge variant="sage">Today</Badge>
                      )}
                    </div>

                    <Badge variant={dayObj.dayName === 'Saturday' || dayObj.dayName === 'Sunday' ? 'amber' : 'subtle'}>
                      {dayObj.dayName === 'Saturday' || dayObj.dayName === 'Sunday' ? 'Weekend Prep' : 'Weekday'}
                    </Badge>
                  </div>

                  {/* 4 Meal Slots: Breakfast, Lunch, Dinner, Snack */}
                  <div className="grid-2" style={{ gap: '0.75rem' }}>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                      const mealValue = dayMeals[type] !== undefined && dayMeals[type] !== ''
                        ? dayMeals[type]
                        : (defaultIdea[type] || '');

                      const isCustom = dayMeals[type] !== undefined && dayMeals[type] !== '';

                      return (
                        <div
                          key={type}
                          onClick={() => openEditMeal(dayObj, type)}
                          style={{
                            padding: '0.7rem 0.85rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isCustom ? 'var(--bg-card)' : 'var(--bg-card-subtle)',
                            border: isCustom ? '1px solid var(--accent-sage)' : '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div className="flex-between">
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                color: isCustom ? 'var(--accent-sage)' : 'var(--text-secondary)'
                              }}
                            >
                              {type}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-sage)', fontWeight: 500 }}>
                              Edit
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              color: mealValue ? 'var(--text-primary)' : 'var(--text-muted)',
                              marginTop: '3px'
                            }}
                          >
                            {mealValue || 'Click to set meal...'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SHOPPING LIST */}
      {activeTab === 'shopping' && (
        <Card
          title="Weekly Groceries & Market List"
          subtitle="Checked off items automatically sink down to keep your shopping trip focused."
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsShoppingModalOpen(true)}>
              Add Item
            </Button>
          }
        >
          {shoppingList.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Shopping list is empty"
              description="Add pantry staples, vegetables, or proteins for the week."
              action={
                <Button variant="secondary" icon={Plus} size="sm" onClick={() => setIsShoppingModalOpen(true)}>
                  Add Item
                </Button>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {shoppingList.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: item.checked ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                    opacity: item.checked ? 0.6 : 1
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleShoppingItem(item.id)}
                      style={{ accentColor: 'var(--accent-sage)' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, textDecoration: item.checked ? 'line-through' : 'none' }}>
                        {item.item}
                      </span>
                      <Badge variant="subtle" style={{ marginLeft: '0.5rem' }}>
                        {item.category}
                      </Badge>
                    </div>
                  </label>
                  <Button variant="ghost" size="icon" onClick={() => deleteShoppingItem(item.id)}>
                    <Trash2 size={15} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: FREEZER MEALS */}
      {activeTab === 'freezer' && (
        <Card
          title="Freezer Meal Reserves"
          subtitle="Backup home-cooked meals for intense study weeks, midterms, and finals."
        >
          <div className="grid-cards">
            {freezerMeals.map((meal) => (
              <div
                key={meal.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)'
                }}
              >
                <div className="flex-between">
                  <Badge variant="slate">
                    <Snowflake size={11} /> {meal.portions} portions left
                  </Badge>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Frozen {meal.date_frozen}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.5rem' }}>
                  {meal.name}
                </h4>
                {meal.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {meal.notes}
                  </p>
                )}
                <div style={{ marginTop: '0.75rem' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      let updated;
                      if (meal.portions > 1) {
                        updated = freezerMeals.map(m => m.id === meal.id ? { ...m, portions: m.portions - 1 } : m);
                      } else {
                        updated = freezerMeals.filter(m => m.id !== meal.id);
                      }
                      setFreezerMeals(updated);
                      try { localStorage.setItem('bts_cached_freezer', JSON.stringify(updated)); } catch (e) {}
                    }}
                  >
                    Defrost 1 Portion
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: PREP RITUALS (Saturday Planning & Sunday Meal Prep Checklists) */}
      {activeTab === 'prep' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Saturday Planning Workflow */}
          <Card
            title="Saturday Planning Ritual"
            subtitle="Set aside 15 minutes each Saturday to audit supplies and choose nourishing weekday recipes."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {saturdaySteps.map((step, idx) => (
                <label
                  key={step.id}
                  onClick={() => toggleSaturdayStep(step.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: step.done ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={() => {}}
                    style={{ marginTop: '2px', accentColor: 'var(--accent-amber)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-amber)' }}>
                      STEP {idx + 1}
                    </div>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      textDecoration: step.done ? 'line-through' : 'none',
                      opacity: step.done ? 0.7 : 1,
                      marginTop: '2px'
                    }}>
                      {step.text}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </Card>

          {/* Sunday Batch Preparation Routine */}
          <Card
            title="Sunday Batch Preparation Routine"
            subtitle="Spend 90 minutes cooking 3 foundation bases to fuel your entire school week."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sundaySteps.map((step, idx) => (
                <label
                  key={step.id}
                  onClick={() => toggleSundayStep(step.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: step.done ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={() => {}}
                    style={{ marginTop: '2px', accentColor: 'var(--accent-sage)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-sage)' }}>
                      BATCH STAGE {idx + 1}
                    </div>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      textDecoration: step.done ? 'line-through' : 'none',
                      opacity: step.done ? 0.7 : 1,
                      marginTop: '2px'
                    }}>
                      {step.text}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Edit Meal Modal */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        title={`Edit Meal · ${selectedDateFormatted} (${editMealType.charAt(0).toUpperCase() + editMealType.slice(1)})`}
      >
        <form onSubmit={saveMeal}>
          <Input
            label={`${editMealType.charAt(0).toUpperCase() + editMealType.slice(1)} Description`}
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            placeholder="e.g. Warm lentil soup & sourdough bread"
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <Button
              variant="ghost"
              type="button"
              size="sm"
              onClick={() => setMealText('')}
              style={{ color: 'var(--text-muted)' }}
            >
              Clear
            </Button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setIsMealModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Meal
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Shopping Item Modal */}
      <Modal
        isOpen={isShoppingModalOpen}
        onClose={() => setIsShoppingModalOpen(false)}
        title="Add Shopping Item"
      >
        <form onSubmit={addShoppingItem}>
          <Input
            label="Item Name & Quantity"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="e.g. Chia seeds (500g)"
            required
            autoFocus
          />
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={newItemCat}
              onChange={(e) => setNewItemCat(e.target.value)}
            >
              <option value="Produce">Produce</option>
              <option value="Pantry">Pantry</option>
              <option value="Protein">Protein</option>
              <option value="Dairy/Alt">Dairy / Plant Milks</option>
              <option value="Bakery">Bakery</option>
              <option value="Snacks">Snacks & Tea</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsShoppingModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add To List
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
