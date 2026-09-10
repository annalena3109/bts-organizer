import React, { useState, useEffect } from 'react';
import {
  Shirt,
  Plus,
  Trash2,
  Sparkles,
  Calendar,
  CheckCircle,
  Tag,
  Camera,
  Layers
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { apiRequest } from '../../services/api';

const INITIAL_CLOTHES = [
  { id: '1', name: 'Oatmeal Wool Knit Cardigan', category: 'Tops', color: 'Cream / Oat', laundry_status: 'clean', worn_count: 5 },
  { id: '2', name: 'Heavyweight Cotton Tee', category: 'Tops', color: 'White', laundry_status: 'in_laundry', worn_count: 8 },
  { id: '3', name: 'Relaxed Vintage Fit Denim', category: 'Bottoms', color: 'Washed Blue', laundry_status: 'clean', worn_count: 12 },
  { id: '4', name: 'Tailored Pleated Trousers', category: 'Bottoms', color: 'Charcoal', laundry_status: 'clean', worn_count: 3 },
  { id: '5', name: 'Canvas Everyday Low Sneakers', category: 'Shoes', color: 'Off-White', laundry_status: 'clean', worn_count: 24 },
  { id: '6', name: 'Waxed Canvas Utility Jacket', category: 'Outerwear', color: 'Muted Olive', laundry_status: 'clean', worn_count: 7 },
  { id: '7', name: 'Organic Linen Button-Up', category: 'Tops', color: 'Soft Sage', laundry_status: 'needs_ironing', worn_count: 4 },
];

const INITIAL_OUTFITS = [
  {
    id: '1',
    name: 'Cozy Library Study Fit',
    occasion: 'Study & Campus',
    items: ['Oatmeal Wool Knit Cardigan', 'Relaxed Vintage Fit Denim', 'Canvas Everyday Low Sneakers'],
    last_worn: '2026-09-08',
    is_today: true
  },
  {
    id: '2',
    name: 'Presentation & Seminar Neat',
    occasion: 'Academic Presentations',
    items: ['Organic Linen Button-Up', 'Tailored Pleated Trousers', 'Waxed Canvas Utility Jacket'],
    last_worn: '2026-09-02',
    is_today: false
  }
];

export default function Outfits() {
  const [activeTab, setActiveTab] = useState('closet'); // 'closet', 'outfits', 'laundry'
  const [clothes, setClothes] = useState(INITIAL_CLOTHES);
  const [outfits, setOutfits] = useState(INITIAL_OUTFITS);

  // Add Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Tops');
  const [itemColor, setItemColor] = useState('');
  const [itemLaundry, setItemLaundry] = useState('clean');

  // Add Outfit Modal
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitOccasion, setOutfitOccasion] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  useEffect(() => {
    async function loadCloset() {
      try {
        const [clothRes, outfitRes] = await Promise.all([
          apiRequest('/clothing'),
          apiRequest('/outfits')
        ]);
        if (Array.isArray(clothRes) && clothRes.length > 0) setClothes(clothRes);
        if (Array.isArray(outfitRes) && outfitRes.length > 0) setOutfits(outfitRes);
      } catch (e) {
        // fallback
      }
    }
    loadCloset();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newItem = {
      id: String(Date.now()),
      name: itemName,
      category: itemCategory,
      color: itemColor || 'Neutral',
      laundry_status: itemLaundry,
      worn_count: 0
    };

    setClothes(prev => [newItem, ...prev]);
    try {
      await apiRequest('/clothing', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
    } catch (e) {}

    setItemName('');
    setItemColor('');
    setIsItemModalOpen(false);
  };

  const handleToggleLaundry = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'clean' ? 'in_laundry' : currentStatus === 'in_laundry' ? 'needs_ironing' : 'clean';
    setClothes(prev => prev.map(c => c.id === id ? { ...c, laundry_status: nextStatus } : c));
    try {
      await apiRequest(`/clothing/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ laundry_status: nextStatus })
      });
    } catch (e) {}
  };

  const deleteItem = async (id) => {
    setClothes(prev => prev.filter(c => c.id !== id));
    try {
      await apiRequest(`/clothing/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const markOutfitToday = async (id) => {
    setOutfits(prev => prev.map(o => ({
      ...o,
      is_today: o.id === id,
      last_worn: o.id === id ? new Date().toISOString().slice(0, 10) : o.last_worn
    })));
  };

  const handleCreateOutfit = async (e) => {
    e.preventDefault();
    if (!outfitName.trim()) return;

    const selectedNames = clothes.filter(c => selectedItemIds.includes(c.id)).map(c => c.name);
    const newOutfit = {
      id: String(Date.now()),
      name: outfitName,
      occasion: outfitOccasion || 'Everyday School',
      items: selectedNames.length > 0 ? selectedNames : ['Cozy Layer'],
      last_worn: new Date().toISOString().slice(0, 10),
      is_today: false
    };

    setOutfits(prev => [newOutfit, ...prev]);
    try {
      await apiRequest('/outfits', {
        method: 'POST',
        body: JSON.stringify(newOutfit)
      });
    } catch (e) {}

    setOutfitName('');
    setOutfitOccasion('');
    setSelectedItemIds([]);
    setIsOutfitModalOpen(false);
  };

  const inLaundryCount = clothes.filter(c => c.laundry_status !== 'clean').length;
  const cleanCount = clothes.filter(c => c.laundry_status === 'clean').length;

  const tabs = [
    { id: 'closet', label: 'Capsule Closet', badge: clothes.length },
    { id: 'outfits', label: 'Planned Outfits', badge: outfits.length },
    { id: 'laundry', label: 'Laundry Basket', badge: inLaundryCount },
  ];

  return (
    <div className="outfits-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>Outfits & Closet</h1>
          <p>Curate a thoughtful, low-stress capsule wardrobe for school and daily life.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" icon={Layers} onClick={() => setIsOutfitModalOpen(true)}>
            Plan Outfit
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setIsItemModalOpen(true)}>
            Add Garment
          </Button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL PIECES</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
            {clothes.length} items
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Curated capsule</span>
        </Card>

        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CLEAN & READY</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-sage)', marginTop: '4px' }}>
            {cleanCount} pieces
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ready in closet</span>
        </Card>

        <Card subtle>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>NEEDS LAUNDRY / IRON</span>
          <p style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-terracotta)', marginTop: '4px' }}>
            {inLaundryCount} pieces
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In hamper or drying</span>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* TAB 1: CLOSET INVENTORY */}
      {activeTab === 'closet' && (
        <div className="grid-cards">
          {clothes.map((item) => {
            const statusVariant = item.laundry_status === 'clean' ? 'sage' : item.laundry_status === 'in_laundry' ? 'terracotta' : 'amber';
            const statusLabel = item.laundry_status === 'clean' ? 'Clean' : item.laundry_status === 'in_laundry' ? 'In Laundry' : 'Needs Ironing';

            return (
              <Card key={item.id} style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="flex-between">
                    <Badge variant="subtle">{item.category}</Badge>
                    <button
                      onClick={() => handleToggleLaundry(item.id, item.laundry_status)}
                      title="Click to cycle laundry status"
                      style={{ cursor: 'pointer' }}
                    >
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </button>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.6rem' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Color: {item.color}
                  </p>
                </div>

                <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Worn {item.worn_count} times
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: PLANNED OUTFITS */}
      {activeTab === 'outfits' && (
        <div className="grid-2">
          {outfits.map((outfit) => (
            <Card
              key={outfit.id}
              style={{
                border: outfit.is_today ? '2px solid var(--accent-sage)' : '1px solid var(--border-color)',
                position: 'relative'
              }}
            >
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem' }}>{outfit.name}</h3>
                {outfit.is_today ? (
                  <Badge variant="sage">Wearing Today</Badge>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => markOutfitToday(outfit.id)}>
                    Wear Today
                  </Button>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Occasion: {outfit.occasion} · Last worn {outfit.last_worn}
              </span>

              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pieces:</span>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                  {outfit.items.map((it, idx) => (
                    <li key={idx}>{it}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: LAUNDRY BASKET */}
      {activeTab === 'laundry' && (
        <Card
          title="Laundry Basket"
          subtitle="Keep track of clothes currently in the wash or needing care before the school week."
        >
          {clothes.filter(c => c.laundry_status !== 'clean').length === 0 ? (
            <EmptyState
              icon={Shirt}
              title="All laundry is clean!"
              description="Your entire wardrobe is washed, dried, and ready in your closet."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {clothes.filter(c => c.laundry_status !== 'clean').map((item) => (
                <div
                  key={item.id}
                  className="flex-between"
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.9rem' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.color} · {item.category}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleToggleLaundry(item.id, item.laundry_status)}
                  >
                    Mark Clean
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Add Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Add Garment to Closet"
      >
        <form onSubmit={handleAddItem}>
          <Input
            label="Garment Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g. Oatmeal knit sweater"
            required
            autoFocus
          />
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              >
                <option value="Tops">Tops</option>
                <option value="Bottoms">Bottoms</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Shoes">Shoes</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
            <Input
              label="Color / Fabric"
              value={itemColor}
              onChange={(e) => setItemColor(e.target.value)}
              placeholder="e.g. Sage green cotton"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Laundry Status</label>
            <select
              className="form-select"
              value={itemLaundry}
              onChange={(e) => setItemLaundry(e.target.value)}
            >
              <option value="clean">Clean & in closet</option>
              <option value="in_laundry">In laundry basket</option>
              <option value="needs_ironing">Needs ironing / steaming</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Garment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Plan Outfit Modal */}
      <Modal
        isOpen={isOutfitModalOpen}
        onClose={() => setIsOutfitModalOpen(false)}
        title="Plan Outfit"
      >
        <form onSubmit={handleCreateOutfit}>
          <Input
            label="Outfit Name"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
            placeholder="e.g. Monday Morning Lecture Fit"
            required
            autoFocus
          />
          <Input
            label="Occasion / Setting"
            value={outfitOccasion}
            onChange={(e) => setOutfitOccasion(e.target.value)}
            placeholder="e.g. Campus classes, coffee shop"
          />
          <div className="form-group">
            <label className="form-label">Select Garments from Closet</label>
            <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem' }}>
              {clothes.map((c) => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '4px 0', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedItemIds.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItemIds(prev => [...prev, c.id]);
                      } else {
                        setSelectedItemIds(prev => prev.filter(id => id !== c.id));
                      }
                    }}
                    style={{ accentColor: 'var(--accent-sage)' }}
                  />
                  <span>{c.name} ({c.category})</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsOutfitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Outfit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
