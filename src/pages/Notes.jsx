import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotes, addNote, updateNote, deleteNote } from '../firebase/firestore';
import Header from '../components/Header';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, NotebookPen } from 'lucide-react';

const COLORS = [
  { name: 'indigo', bg: '#6366F122', border: '#6366F1' },
  { name: 'emerald', bg: '#10B98122', border: '#10B981' },
  { name: 'amber', bg: '#F59E0B22', border: '#F59E0B' },
  { name: 'pink', bg: '#EC489922', border: '#EC4899' },
  { name: 'sky', bg: '#0EA5E922', border: '#0EA5E9' },
];

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', color: 'indigo' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadNotes(); }, []);

  const loadNotes = async () => {
    try {
      const data = await getNotes(user.uid);
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', color: 'indigo' });
    setShowModal(true);
  };

  const openEdit = (note) => {
    setEditing(note);
    setForm({ title: note.title, content: note.content, color: note.color || 'indigo' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateNote(user.uid, editing.id, form);
        setNotes((prev) => prev.map((n) => n.id === editing.id ? { ...n, ...form } : n));
        toast.success('Note updated!');
      } else {
        const ref = await addNote(user.uid, form);
        setNotes((prev) => [{ id: ref.id, ...form, createdAt: new Date() }, ...prev]);
        toast.success('Note saved!');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(user.uid, deleteModal);
      setNotes((prev) => prev.filter((n) => n.id !== deleteModal));
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleteModal(null);
    }
  };

  const filtered = notes.filter(
    (n) =>
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase())
  );

  const wordCount = (text) => text?.trim().split(/\s+/).filter(Boolean).length || 0;

  return (
    <div className="page">
      <Header title="My Notes" />

      <div className="page-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> New Note
        </button>
      </div>

      {loading ? (
        <div className="notes-grid">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="note-card skeleton">
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
              <div className="skeleton-line" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No notes found</h3>
          <p>{search ? 'Try a different search term' : 'Create your first note to get started'}</p>
          {!search && <button className="btn btn-primary" onClick={openCreate}>Create Note</button>}
        </div>
      ) : (
        <div className="notes-grid">
          {filtered.map((note) => {
            const color = COLORS.find((c) => c.name === note.color) || COLORS[0];
            return (
              <div
                key={note.id}
                className="note-card"
                style={{ background: color.bg, borderLeft: `3px solid ${color.border}` }}
              >
                <div className="note-card-header">
                  <h4 className="note-title">{note.title}</h4>
                  <div className="note-actions">
                    <button onClick={() => openEdit(note)}><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteModal(note.id)}><Trash2 size={15} /></button>
                  </div>
                </div>
                <p className="note-preview">{note.content?.slice(0, 100)}{note.content?.length > 100 ? '...' : ''}</p>
                <div className="note-meta">
                  <span>{wordCount(note.content)} words</span>
                  <span>{note.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Note' : 'New Note'}
        confirmText={saving ? 'Saving...' : 'Save Note'}
        onConfirm={handleSave}
      >
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Note title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Content</label>
          <textarea
            rows={8}
            placeholder="Write your note here..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Color Label</label>
          <div className="color-picker">
            {COLORS.map((c) => (
              <button
                key={c.name}
                className={`color-dot ${form.color === c.name ? 'selected' : ''}`}
                style={{ background: c.border }}
                onClick={() => setForm({ ...form, color: c.name })}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Note"
        confirmText="Delete"
        onConfirm={handleDelete}
        danger
      >
        <p>Are you sure you want to delete this note? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Notes;
