import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  Award,
  Sparkles,
  Calendar
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { apiRequest } from '../../services/api';

const INITIAL_RECORDS = [
  { id: '1', date: '2026-09-10', bedtime: '23:15', wake_time: '06:45', duration_minutes: 450, quality: 4, notes: 'Felt well-rested for morning biology' },
  { id: '2', date: '2026-09-09', bedtime: '23:30', wake_time: '07:00', duration_minutes: 450, quality: 4, notes: 'Read for 15 min before sleep' },
  { id: '3', date: '2026-09-08', bedtime: '00:15', wake_time: '06:30', duration_minutes: 375, quality: 3, notes: 'Late studying for calculus quiz' },
  { id: '4', date: '2026-09-07', bedtime: '22:45', wake_time: '06:45', duration_minutes: 480, quality: 5, notes: 'Full 8 hours, deep sleep' },
  { id: '5', date: '2026-09-06', bedtime: '23:00', wake_time: '07:30', duration_minutes: 510, quality: 5, notes: 'Sunday morning lie-in' },
  { id: '6', date: '2026-09-05', bedtime: '23:45', wake_time: '08:00', duration_minutes: 495, quality: 4, notes: 'Weekend restful night' },
  { id: '7', date: '2026-09-04', bedtime: '23:10', wake_time: '06:40', duration_minutes: 450, quality: 4, notes: 'Consistent routine' },
];

export default function Sleep() {
  const [records, setRecords] = useState(() => {
    try {
      const cached = localStorage.getItem('bts_cached_sleep');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return INITIAL_RECORDS;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadSleep() {
      try {
        const data = await apiRequest('/sleep');
        if (Array.isArray(data)) {
          setRecords(data);
          try { localStorage.setItem('bts_cached_sleep', JSON.stringify(data)); } catch (e) {}
        }
      } catch (e) {
        // use fallback / cached data
      }
    }
    loadSleep();
  }, []);

  const calculateMinutes = (bed, wake) => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let bedDate = new Date(2000, 0, 1, bH, bM);
    let wakeDate = new Date(2000, 0, bH > wH ? 2 : 1, wH, wM);
    return Math.max(0, Math.round((wakeDate - bedDate) / (1000 * 60)));
  };

  const handleLogSleep = async (e) => {
    e.preventDefault();
    const durationMinutes = calculateMinutes(bedtime, wakeTime);

    const newRecord = {
      id: String(Date.now()),
      date,
      bedtime,
      wake_time: wakeTime,
      duration_minutes: durationMinutes,
      quality: Number(quality),
      notes
    };

    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    try { localStorage.setItem('bts_cached_sleep', JSON.stringify(updatedRecords)); } catch (e) {}
    try {
      await apiRequest('/sleep', {
        method: 'POST',
        body: JSON.stringify(newRecord)
      });
    } catch (e) {}

    setNotes('');
    setIsModalOpen(false);
  };

  const handleDeleteRecord = async (id) => {
    const updatedRecords = records.filter(r => r.id !== id);
    setRecords(updatedRecords);
    try { localStorage.setItem('bts_cached_sleep', JSON.stringify(updatedRecords)); } catch (e) {}
    try {
      await apiRequest(`/sleep/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  // Metrics
  const totalMins = records.reduce((acc, r) => acc + (r.duration_minutes || 0), 0);
  const avgMins = records.length > 0 ? Math.round(totalMins / records.length) : 460;
  const avgHours = Math.floor(avgMins / 60);
  const avgRemMins = avgMins % 60;

  return (
    <div className="sleep-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Sleep Tracker</h1>
          <p>Protect your cognitive energy with consistent bedtimes, calm evenings, and rest tracking.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Log Sleep
        </Button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <Card subtle>
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>AVERAGE DURATION</span>
            <Moon size={16} color="var(--accent-slate)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            {avgHours}h {avgRemMins}m
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Target: 8h 00m per night
          </span>
        </Card>

        <Card subtle>
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ROUTINE CONSISTENCY</span>
            <Clock size={16} color="var(--accent-sage)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-sage)', marginTop: '4px' }}>
            88% Consistent
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Average bedtime around 11:15 PM
          </span>
        </Card>

        <Card subtle>
          <div className="flex-between">
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>QUALITY SCORE</span>
            <Award size={16} color="var(--accent-amber)" />
          </div>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-amber)', marginTop: '4px' }}>
            4.2 / 5.0
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            High daytime focus reported
          </span>
        </Card>
      </div>

      {/* 7-Day Sleep Duration Bar Chart */}
      <Card
        title="Weekly Sleep Duration Trends"
        subtitle="Hours of rest over the last 7 recorded nights relative to the 8-hour recommendation"
        style={{ marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.75rem', height: '180px', paddingTop: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          {records.slice(0, 7).reverse().map((r) => {
            const hours = (r.duration_minutes / 60).toFixed(1);
            const heightPercent = Math.min(100, Math.round((r.duration_minutes / (9 * 60)) * 100));
            const meetsGoal = r.duration_minutes >= 450; // 7.5h+
            return (
              <div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {hours}h
                </span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${heightPercent}%`,
                    background: meetsGoal ? 'var(--accent-slate)' : 'var(--accent-amber)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease'
                  }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  {new Date(r.date).toLocaleDateString([], { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sleep Log Records */}
      <Card title="Sleep Log History" subtitle="Detailed nightly entries and morning reflections">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {records.map((r) => {
            const hrs = Math.floor(r.duration_minutes / 60);
            const mins = r.duration_minutes % 60;
            return (
              <div
                key={r.id}
                className="flex-between"
                style={{
                  padding: '0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{r.date}</span>
                    <Badge variant="slate">{hrs}h {mins}m</Badge>
                    <Badge variant="subtle">Rating: {r.quality}/5</Badge>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '0.75rem' }}>
                    <span>Bedtime: {r.bedtime}</span>
                    <span>Wake: {r.wake_time}</span>
                  </div>
                  {r.notes && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                      "{r.notes}"
                    </p>
                  )}
                </div>

                <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(r.id)}>
                  <Trash2 size={15} />
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Log Sleep Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Sleep Entry"
      >
        <form onSubmit={handleLogSleep}>
          <Input
            label="Date of Sleep"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="grid-2">
            <Input
              label="Bedtime"
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              required
            />
            <Input
              label="Wake Time"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quality (1 = Poor, 5 = Deep & Rested)</label>
            <select
              className="form-select"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value="5">5 - Completely rested & energised</option>
              <option value="4">4 - Good restful sleep</option>
              <option value="3">3 - Fair / woke up once</option>
              <option value="2">2 - Restless sleep</option>
              <option value="1">1 - Exhausted / poor sleep</option>
            </select>
          </div>
          <Input
            label="Notes / Reflection"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Read novel before sleep, turned off phone early"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
