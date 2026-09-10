import React, { useState, useEffect } from 'react';
import {
  Home,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  RefreshCw,
  FolderSync,
  Clock
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import { apiRequest } from '../../services/api';

const INITIAL_ROOM_TASKS = [
  { id: '1', title: 'Clear and wipe study desk surface', area: 'Study Desk', frequency: 'Daily', is_completed: true, last_cleaned: 'Today' },
  { id: '2', title: 'Empty paper recycling & desk bin', area: 'Study Desk', frequency: 'Weekly', is_completed: false, last_cleaned: '3 days ago' },
  { id: '3', title: 'Make bed & fluff pillows', area: 'Bedroom', frequency: 'Daily', is_completed: true, last_cleaned: 'Today' },
  { id: '4', title: 'Wash bed linens & pillowcases', area: 'Bedroom', frequency: 'Weekly', is_completed: false, last_cleaned: 'Sunday' },
  { id: '5', title: 'Clean bathroom mirror & sink', area: 'Bathroom', frequency: 'Weekly', is_completed: false, last_cleaned: '5 days ago' },
  { id: '6', title: 'Vacuum bedroom rug & under desk', area: 'Bedroom', frequency: 'Weekly', is_completed: false, last_cleaned: 'Last Saturday' },
  { id: '7', title: 'Organize study bookshelf & notebooks', area: 'Study Desk', frequency: 'Bi-weekly', is_completed: true, last_cleaned: 'Last week' },
];

const NIGHTLY_RESET_STEPS = [
  { id: 1, text: 'Put books & pens back into pencil cup and shelf', done: true },
  { id: 2, text: 'Plug in laptop & phone across the room', done: false },
  { id: 3, text: 'Refill bedside water glass / carafe', done: false },
  { id: 4, text: 'Hang up clothes or put in laundry basket', done: false },
];

export default function HomeRoom() {
  const [tasks, setTasks] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_hometasks');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_ROOM_TASKS;
  });
  const [nightlySteps, setNightlySteps] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_nightly_steps');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return NIGHTLY_RESET_STEPS;
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'desk', 'bedroom', 'bathroom', 'reset'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('Study Desk');
  const [frequency, setFrequency] = useState('Weekly');

  useEffect(() => {
    async function loadHomeTasks() {
      try {
        const data = await apiRequest('/home-tasks');
        if (Array.isArray(data)) {
          setTasks(data);
          try { localStorage.setItem('bts_cached_hometasks', JSON.stringify(data)); } catch (e) {}
        }
      } catch (e) {
        // fallback / cached data
      }
    }
    loadHomeTasks();
  }, []);

  const handleToggleTask = async (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target) return;
    const newStatus = !target.is_completed;
    const updatedTasks = tasks.map(t => t.id === id ? {
      ...t,
      is_completed: newStatus,
      last_cleaned: newStatus ? 'Today' : t.last_cleaned
    } : t);
    setTasks(updatedTasks);
    try { localStorage.setItem('bts_cached_hometasks', JSON.stringify(updatedTasks)); } catch (e) {}

    try {
      await apiRequest(`/home-tasks/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ is_completed: newStatus })
      });
    } catch (e) {}
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: String(Date.now()),
      title,
      area,
      frequency,
      is_completed: false,
      last_cleaned: 'Pending'
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    try { localStorage.setItem('bts_cached_hometasks', JSON.stringify(updatedTasks)); } catch (e) {}
    try {
      await apiRequest('/home-tasks', {
        method: 'POST',
        body: JSON.stringify(newTask)
      });
    } catch (e) {}

    setTitle('');
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    try { localStorage.setItem('bts_cached_hometasks', JSON.stringify(updatedTasks)); } catch (e) {}
    try {
      await apiRequest(`/home-tasks/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const toggleNightlyStep = (id) => {
    const updatedSteps = nightlySteps.map(s => s.id === id ? { ...s, done: !s.done } : s);
    setNightlySteps(updatedSteps);
    try { localStorage.setItem('bts_cached_nightly_steps', JSON.stringify(updatedSteps)); } catch (e) {}
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'desk') return t.area === 'Study Desk';
    if (activeTab === 'bedroom') return t.area === 'Bedroom';
    if (activeTab === 'bathroom') return t.area === 'Bathroom';
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All Chores', badge: tasks.length },
    { id: 'desk', label: 'Study Desk' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'bathroom', label: 'Bathroom' },
    { id: 'reset', label: '5-Min Nightly Reset' },
  ];

  return (
    <div className="homeroom-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Home & Room</h1>
          <p>Maintain a serene, orderly study and living environment with low-friction routines.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Chore
        </Button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TASKS COMPLETED TODAY</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-sage)', marginTop: '4px' }}>
            {tasks.filter(t => t.is_completed).length} / {tasks.length}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Environment in harmony</span>
        </Card>

        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>STUDY DESK STATUS</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            Clean & Reset
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Zero paper clutter</span>
        </Card>

        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NIGHTLY RESET</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {nightlySteps.filter(s => s.done).length} / {nightlySteps.length} Steps
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>5-minute evening wind-down</span>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB: 5-Min Nightly Reset */}
      {activeTab === 'reset' ? (
        <Card
          title="Nightly 5-Minute Room Reset"
          subtitle="A calm ritual before sleep to ensure tomorrow morning starts with a fresh mind and zero chaos."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {nightlySteps.map((step) => (
              <label
                key={step.id}
                onClick={() => toggleNightlyStep(step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
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
                  style={{ accentColor: 'var(--accent-sage)' }}
                />
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    textDecoration: step.done ? 'line-through' : 'none',
                    opacity: step.done ? 0.65 : 1
                  }}
                >
                  {step.text}
                </span>
              </label>
            ))}
          </div>
        </Card>
      ) : (
        /* Regular Chores List */
        <Card title="Room Cleaning & Organization Schedule" subtitle="Recurring domestic maintenance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="flex-between"
                style={{
                  padding: '0.75rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: t.is_completed ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                  opacity: t.is_completed ? 0.65 : 1
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={t.is_completed}
                    onChange={() => handleToggleTask(t.id)}
                    style={{ accentColor: 'var(--accent-sage)' }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        textDecoration: t.is_completed ? 'line-through' : 'none'
                      }}
                    >
                      {t.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                      <Badge variant="subtle">{t.area}</Badge>
                      <Badge variant="sage">{t.frequency}</Badge>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Last: {t.last_cleaned}
                      </span>
                    </div>
                  </div>
                </label>

                <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(t.id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Room Chore"
      >
        <form onSubmit={handleAddTask}>
          <Input
            label="Chore / Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wipe down desk lamp & monitor"
            required
            autoFocus
          />
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Zone / Area</label>
              <select
                className="form-select"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="Study Desk">Study Desk</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Closet">Closet</option>
                <option value="Living / Common">Living / Common</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Frequency</label>
              <select
                className="form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Chore
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
