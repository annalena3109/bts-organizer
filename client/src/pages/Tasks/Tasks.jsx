import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  BookOpen,
  Filter,
  CheckCircle2
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../services/api';

const INITIAL_TASKS = [
  { id: '1', title: 'Read Chapter 4 of History textbook', description: 'Take notes on the Industrial Revolution summary', category: 'School', priority: 'high', due_date: '2026-09-10T16:00', completed: false },
  { id: '2', title: 'Submit Calculus problem set #2', description: 'Complete exercises 12 through 24 on derivatives', category: 'School', priority: 'high', due_date: '2026-09-11T23:59', completed: false },
  { id: '3', title: 'Review chemistry flashcards (20 min)', description: 'Periodic table electron configurations', category: 'Exams', priority: 'medium', due_date: '2026-09-10T19:00', completed: true },
  { id: '4', title: 'Pick up index cards & binder clips', description: 'Stationery store across campus', category: 'Personal', priority: 'low', due_date: '2026-09-12T15:00', completed: false },
  { id: '5', title: 'Literature essay outline draft', description: 'Brainstorm three comparative thesis arguments', category: 'Projects', priority: 'medium', due_date: '2026-09-14T12:00', completed: false },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('School');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  // Load from API if available
  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await apiRequest('/tasks');
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
      } catch (e) {
        // use initial fallback
      }
    }
    loadTasks();
  }, []);

  const openAddModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setCategory('School');
    setPriority('medium');
    setDueDate(new Date().toISOString().slice(0, 16));
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setPriority(task.priority);
    setDueDate(task.due_date ? task.due_date.slice(0, 16) : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      // Edit
      const updated = {
        ...editingTask,
        title,
        description,
        category,
        priority,
        due_date: dueDate
      };
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
      try {
        await apiRequest(`/tasks/${editingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify(updated)
        });
      } catch (err) {
        console.warn('Saved locally');
      }
    } else {
      // Create
      const newTask = {
        id: String(Date.now()),
        title,
        description,
        category,
        priority,
        due_date: dueDate,
        completed: false,
        created_at: new Date().toISOString()
      };
      setTasks(prev => [newTask, ...prev]);
      try {
        await apiRequest('/tasks', {
          method: 'POST',
          body: JSON.stringify(newTask)
        });
      } catch (err) {
        console.warn('Saved locally');
      }
    }
    setIsModalOpen(false);
  };

  const toggleComplete = async (taskId) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;
    const newCompleted = !target.completed;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t));
    try {
      await apiRequest(`/tasks/${taskId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ completed: newCompleted })
      });
    } catch (err) {
      // locally toggled
    }
  };

  const deleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await apiRequest(`/tasks/${taskId}`, { method: 'DELETE' });
    } catch (err) {
      // deleted locally
    }
  };

  // Filter tasks based on activeTab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'pending') return !task.completed;
    if (activeTab === 'completed') return task.completed;
    if (activeTab === 'school') return task.category === 'School';
    if (activeTab === 'exams') return task.category === 'Exams';
    if (activeTab === 'projects') return task.category === 'Projects';
    return true; // 'all'
  });

  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const schoolCount = tasks.filter(t => t.category === 'School' && !t.completed).length;

  const tabs = [
    { id: 'all', label: 'All Tasks', badge: totalCount },
    { id: 'pending', label: 'Pending', badge: pendingCount },
    { id: 'school', label: 'School', badge: schoolCount },
    { id: 'exams', label: 'Exams & Quizzes' },
    { id: 'projects', label: 'Projects' },
    { id: 'completed', label: 'Completed', badge: completedCount },
  ];

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Tasks & School</h1>
          <p>Organize homework, assignments, exam preparation, and daily to-dos.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add Task
        </Button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <Card subtle>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIVE TO-DOS</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            {pendingCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due soon</span>
        </Card>

        <Card subtle>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SCHOOL ASSIGNMENTS</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-sage)', marginTop: '4px' }}>
            {schoolCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pending coursework</span>
        </Card>

        <Card subtle>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>COMPLETED THIS WEEK</p>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {completedCount}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Finished tasks</span>
        </Card>
      </div>

      {/* Tabs Filter */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks in this view"
          description="Everything is clear! Take a breather or add a new school task."
          action={
            <Button variant="secondary" icon={Plus} size="sm" onClick={openAddModal}>
              Create New Task
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map((task) => {
            const isCompleted = task.completed;
            const priorityVariant = task.priority === 'high' ? 'terracotta' : task.priority === 'medium' ? 'amber' : 'sage';
            
            return (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  opacity: isCompleted ? 0.6 : 1,
                  background: isCompleted ? 'var(--bg-card-subtle)' : 'var(--bg-card)'
                }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => toggleComplete(task.id)}
                  style={{
                    marginTop: '4px',
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--accent-sage)',
                    cursor: 'pointer'
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textDecoration: isCompleted ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </h4>
                    <Badge variant={priorityVariant}>{task.priority}</Badge>
                    <Badge variant="subtle">{task.category}</Badge>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: '0.8125rem', marginTop: '0.35rem', color: 'var(--text-secondary)' }}>
                      {task.description}
                    </p>
                  )}

                  {task.due_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.45rem' }}>
                      <Clock size={12} />
                      <span>Due {new Date(task.due_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(task)}
                    title="Edit task"
                  >
                    <Edit2 size={15} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSave}>
          <Input
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Calculus chapter 3 problem set"
            required
            autoFocus
          />

          <div className="form-group">
            <label className="form-label">Description / Notes</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key notes, textbook pages, or group members..."
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="School">School</option>
                <option value="Exams">Exams & Quizzes</option>
                <option value="Projects">Projects</option>
                <option value="Personal">Personal</option>
                <option value="Chores">Chores</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <Input
            label="Due Date & Time"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
