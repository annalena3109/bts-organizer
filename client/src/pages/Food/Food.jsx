import React, { useState, useEffect } from 'react';
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
  ListTodo
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INITIAL_MEALS = {
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

export default function Food() {
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'saturday', 'sunday', 'shopping', 'freezer'
  const [mealPlan, setMealPlan] = useState(INITIAL_MEALS);
  const [shoppingList, setShoppingList] = useState(INITIAL_SHOPPING);
  const [freezerMeals, setFreezerMeals] = useState(INITIAL_FREEZER);

  // Modals
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [editMealType, setEditMealType] = useState('breakfast');
  const [mealText, setMealText] = useState('');

  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState('Produce');

  // Saturday Workflow Checklist
  const [saturdaySteps, setSaturdaySteps] = useState([
    { id: 1, text: 'Audit fridge, pantry, and produce before grocery shopping', done: true },
    { id: 2, text: 'Select 3 core weekday batch recipes (1 grain bowl, 1 soup/stew, 1 quick protein)', done: true },
    { id: 3, text: 'Add missing staple ingredients to the Sunday Shopping List', done: false },
    { id: 4, text: 'Review school exam schedule to ensure meals match busy evenings', done: false },
  ]);

  // Sunday Meal Prep Checklist
  const [sundaySteps, setSundaySteps] = useState([
    { id: 1, text: 'Cook grain base in batch (Quinoa / Brown Rice / Farro)', done: false },
    { id: 2, text: 'Roast sheet-pan vegetables (Sweet potatoes, broccoli, peppers)', done: false },
    { id: 3, text: 'Simmer weekday soup or batch curry (Lentils or Chili)', done: false },
    { id: 4, text: 'Pre-portion overnight oats jars for Monday through Thursday', done: true },
    { id: 5, text: 'Wash, dry, and spin salad greens; store with dry cloth', done: false },
    { id: 6, text: 'Label and freeze 2 portions for emergency study nights', done: false },
  ]);

  useEffect(() => {
    async function loadFoodData() {
      try {
        const [mealsRes, shopRes, freezerRes] = await Promise.all([
          apiRequest('/meals'),
          apiRequest('/shopping-list'),
          apiRequest('/freezer-meals')
        ]);
        if (mealsRes && typeof mealsRes === 'object') setMealPlan(mealsRes);
        if (Array.isArray(shopRes)) setShoppingList(shopRes);
        if (Array.isArray(freezerRes)) setFreezerMeals(freezerRes);
      } catch (e) {
        // use initial demo data
      }
    }
    loadFoodData();
  }, []);

  const toggleSaturdayStep = (id) => {
    setSaturdaySteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const toggleSundayStep = (id) => {
    setSundaySteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const toggleShoppingItem = async (id) => {
    const target = shoppingList.find(i => i.id === id);
    if (!target) return;
    const newChecked = !target.checked;
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, checked: newChecked } : i));
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
    setShoppingList(prev => [...prev, newItem]);
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
    setShoppingList(prev => prev.filter(i => i.id !== id));
    try {
      await apiRequest(`/shopping-list/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const openEditMeal = (day, type) => {
    setSelectedDay(day);
    setEditMealType(type);
    setMealText(mealPlan[day]?.[type] || '');
    setIsMealModalOpen(true);
  };

  const saveMeal = async (e) => {
    e.preventDefault();
    const updated = {
      ...mealPlan,
      [selectedDay]: {
        ...mealPlan[selectedDay],
        [editMealType]: mealText
      }
    };
    setMealPlan(updated);
    try {
      await apiRequest('/meals', {
        method: 'PUT',
        body: JSON.stringify(updated)
      });
    } catch (e) {}
    setIsMealModalOpen(false);
  };

  const tabs = [
    { id: 'plan', label: 'Weekly Meal Plan', icon: Calendar },
    { id: 'saturday', label: 'Saturday Planning Workflow', icon: BookOpen },
    { id: 'sunday', label: 'Sunday Meal Prep', icon: ChefHat },
    { id: 'shopping', label: 'Shopping List', icon: ShoppingBag, badge: shoppingList.filter(i => !i.checked).length },
    { id: 'freezer', label: 'Freezer Meals', icon: Snowflake, badge: freezerMeals.length },
  ];

  return (
    <div className="food-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Food & Meal Prep</h1>
          <p>Nourishing, stress-free weekday eating designed around Saturday planning & Sunday prep.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => setActiveTab('saturday')}>
            Saturday Workflow
          </Button>
          <Button variant="primary" icon={ChefHat} onClick={() => setActiveTab('sunday')}>
            Sunday Prep
          </Button>
        </div>
      </div>

      {/* Prominent Workflow Notice Cards */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Saturday Workflow Callout */}
        <div
          onClick={() => setActiveTab('saturday')}
          style={{
            padding: '1.125rem',
            background: 'var(--accent-amber-light)',
            border: '1px solid #EADBCE',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                background: '#FFFFFF',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Saturday Planning Workflow</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {saturdaySteps.filter(s => s.done).length} of {saturdaySteps.length} planning steps ready
              </p>
            </div>
          </div>
          <ArrowRight size={16} color="var(--accent-amber)" />
        </div>

        {/* Sunday Meal Prep Callout */}
        <div
          onClick={() => setActiveTab('sunday')}
          style={{
            padding: '1.125rem',
            background: 'var(--accent-sage-light)',
            border: '1px solid #D8E5DD',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-sm)',
                background: '#FFFFFF',
                color: 'var(--accent-sage)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ChefHat size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Sunday Batch Prep Routine</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {sundaySteps.filter(s => s.done).length} of {sundaySteps.length} cooking stages complete
              </p>
            </div>
          </div>
          <ArrowRight size={16} color="var(--accent-sage)" />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB 1: WEEKLY MEAL PLAN */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {DAYS.map((day) => {
            const meals = mealPlan[day] || {};
            return (
              <Card key={day} style={{ padding: '1.25rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{day}</h3>
                  <Badge variant={day === 'Saturday' ? 'amber' : day === 'Sunday' ? 'sage' : 'subtle'}>
                    {day === 'Saturday' ? 'Planning Day' : day === 'Sunday' ? 'Meal Prep Day' : 'Weekday Routine'}
                  </Badge>
                </div>

                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                    <div
                      key={type}
                      onClick={() => openEditMeal(day, type)}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-card-subtle)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div className="flex-between">
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          {type}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent-sage)' }}>Edit</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {meals[type] || 'Click to set meal...'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: SATURDAY PLANNING WORKFLOW */}
      {activeTab === 'saturday' && (
        <Card
          title="Saturday Planning Ritual"
          subtitle="Set aside 15 minutes each Saturday morning to plan nourishing weekday meals and avoid decision fatigue."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)'
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

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setActiveTab('shopping')}>
              Open Shopping List
            </Button>
            <Button variant="primary" onClick={() => setActiveTab('plan')}>
              View Meal Calendar
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 3: SUNDAY MEAL PREP WORKFLOW */}
      {activeTab === 'sunday' && (
        <Card
          title="Sunday Batch Preparation Routine"
          subtitle="Spend 90 minutes on Sunday afternoon cooking 3 foundation bases to fuel your entire school week."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setActiveTab('freezer')}>
              Log Freezer Portions
            </Button>
            <Button variant="primary" onClick={() => setActiveTab('plan')}>
              Done with Sunday Prep
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: SHOPPING LIST */}
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
        </Card>
      )}

      {/* TAB 5: FREEZER MEALS */}
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
                      if (meal.portions > 1) {
                        setFreezerMeals(prev => prev.map(m => m.id === meal.id ? { ...m, portions: m.portions - 1 } : m));
                      } else {
                        setFreezerMeals(prev => prev.filter(m => m.id !== meal.id));
                      }
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

      {/* Edit Meal Modal */}
      <Modal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        title={`Edit ${selectedDay} ${editMealType.charAt(0).toUpperCase() + editMealType.slice(1)}`}
      >
        <form onSubmit={saveMeal}>
          <Input
            label="Meal Description"
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            placeholder="e.g. Warm lentil soup & sourdough bread"
            required
            autoFocus
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsMealModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Meal
            </Button>
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
