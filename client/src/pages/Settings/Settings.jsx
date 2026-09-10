import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Sliders,
  Moon,
  Shield,
  Save,
  LogOut,
  Download,
  Palette
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../services/api';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || 'Annalena');
  const [email, setEmail] = useState(user?.email || 'annalena@school.edu');
  const [gradeLevel, setGradeLevel] = useState('Sophomore / 2nd Year');

  // App preferences
  const [currency, setCurrency] = useState('$');
  const [weekStart, setWeekStart] = useState('Monday');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [themeAccent, setThemeAccent] = useState('sage');

  // Sleep & notification preferences
  const [targetSleep, setTargetSleep] = useState(8);
  const [bedtimeGoal, setBedtimeGoal] = useState('23:00');
  const [morningReminder, setMorningReminder] = useState('07:30');
  const [sundayReminder, setSundayReminder] = useState(true);

  const [savedStatus, setSavedStatus] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiRequest('/settings');
        if (data) {
          if (data.currency) setCurrency(data.currency);
          if (data.weekStart) setWeekStart(data.weekStart);
          if (data.timeFormat) setTimeFormat(data.timeFormat);
          if (data.themeAccent) setThemeAccent(data.themeAccent);
          if (data.targetSleep) setTargetSleep(data.targetSleep);
          if (data.bedtimeGoal) setBedtimeGoal(data.bedtimeGoal);
        }
      } catch (e) {}
    }
    loadSettings();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    updateUser({ name, email });
    try {
      await apiRequest('/settings/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email, gradeLevel })
      });
    } catch (e) {}
    setSavedStatus('Profile saved.');
    setTimeout(() => setSavedStatus(''), 2500);
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/settings/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          currency,
          weekStart,
          timeFormat,
          themeAccent,
          targetSleep,
          bedtimeGoal,
          morningReminder,
          sundayReminder
        })
      });
    } catch (e) {}
    setSavedStatus('Preferences updated.');
    setTimeout(() => setSavedStatus(''), 2500);
  };

  const exportData = () => {
    const dataObj = {
      user: { name, email, gradeLevel },
      preferences: { currency, weekStart, timeFormat, themeAccent, targetSleep, bedtimeGoal },
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtoschool_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Settings & Preferences</h1>
          <p>Personalize your student identity, quiet hours, reminders, and application appearance.</p>
        </div>
        {savedStatus && (
          <Badge variant="sage" style={{ padding: '0.4rem 0.75rem' }}>
            {savedStatus}
          </Badge>
        )}
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Profile Card */}
        <Card title="Student Profile" subtitle="Your personal academic profile">
          <form onSubmit={handleSaveProfile}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Academic Level / Program"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. 2nd Year Computer Science"
            />
            <Button variant="primary" type="submit" icon={Save} size="sm">
              Update Profile
            </Button>
          </form>
        </Card>

        {/* App Appearance & Units */}
        <Card title="App Preferences" subtitle="Display formatting and calendar week settings">
          <form onSubmit={handleSavePreferences}>
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="$">$ (USD / CAD / AUD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="CHF">CHF</option>
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Week Starts On</label>
                <select
                  className="form-select"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                >
                  <option value="Monday">Monday (Academic standard)</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Time Format</label>
                <select
                  className="form-select"
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value)}
                >
                  <option value="12h">12-Hour (e.g. 7:00 PM)</option>
                  <option value="24h">24-Hour (e.g. 19:00)</option>
                </select>
              </div>
            </div>

            <Button variant="secondary" type="submit" icon={Save} size="sm">
              Save Display Preferences
            </Button>
          </form>
        </Card>
      </div>

      <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Sleep & Focus Targets */}
        <Card title="Rest & Evening Goals" subtitle="Target sleep parameters and routine goals">
          <div className="grid-2">
            <Input
              label="Target Sleep (Hours)"
              type="number"
              min="5"
              max="12"
              value={targetSleep}
              onChange={(e) => setTargetSleep(e.target.value)}
            />
            <Input
              label="Bedtime Goal"
              type="time"
              value={bedtimeGoal}
              onChange={(e) => setBedtimeGoal(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={sundayReminder}
                onChange={(e) => setSundayReminder(e.target.checked)}
                style={{ accentColor: 'var(--accent-sage)' }}
              />
              <span>Remind me about Sunday Meal Prep & Weekly Wrapped</span>
            </label>
          </div>
        </Card>

        {/* Data & Account Actions */}
        <Card title="Account & Data Management" subtitle="Export or sign out of this device">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem' }}>Export All Data (JSON)</h4>
                <p style={{ fontSize: '0.75rem' }}>Download a backup copy of your tasks, budget, meals, and closet items.</p>
              </div>
              <Button variant="secondary" size="sm" icon={Download} onClick={exportData}>
                Export
              </Button>
            </div>

            <div className="flex-between" style={{ padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--accent-terracotta)' }}>Session Management</h4>
                <p style={{ fontSize: '0.75rem' }}>Sign out of your account on this device.</p>
              </div>
              <Button variant="secondary" size="sm" icon={LogOut} onClick={logout} style={{ color: 'var(--accent-terracotta)' }}>
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
