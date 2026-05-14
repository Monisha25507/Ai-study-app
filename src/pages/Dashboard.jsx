import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotes, getPDFs, getQuizResults, getDoubtConversations } from '../firebase/firestore';
import Header from '../components/Header';
import { NotebookPen, FileText, BrainCircuit, MessageCircleQuestion, ArrowRight } from 'lucide-react';

const SkeletonCard = () => (
  <div className="stat-card skeleton">
    <div className="skeleton-line short" />
    <div className="skeleton-line long" />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [notes, pdfs, quizzes, doubts] = await Promise.all([
          getNotes(user.uid),
          getPDFs(user.uid),
          getQuizResults(user.uid),
          getDoubtConversations(user.uid),
        ]);
        setStats({
          notes: notes.length,
          pdfs: pdfs.length,
          quizzes: quizzes.length,
          doubts: doubts.length,
          recentNotes: notes.slice(0, 3),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.uid]);

  const statCards = [
    { label: 'Total Notes', value: stats?.notes ?? 0, icon: NotebookPen, color: '#6366F1', path: '/notes' },
    { label: 'PDFs Uploaded', value: stats?.pdfs ?? 0, icon: FileText, color: '#10B981', path: '/pdfs' },
    { label: 'Quizzes Taken', value: stats?.quizzes ?? 0, icon: BrainCircuit, color: '#F59E0B', path: '/quiz' },
    { label: 'Doubts Asked', value: stats?.doubts ?? 0, icon: MessageCircleQuestion, color: '#EC4899', path: '/doubts' },
  ];

  const quickActions = [
    { label: 'Ask a Doubt', icon: MessageCircleQuestion, path: '/doubts', color: '#6366F1' },
    { label: 'Upload PDF', icon: FileText, path: '/pdfs', color: '#10B981' },
    { label: 'Create Quiz', icon: BrainCircuit, path: '/quiz', color: '#F59E0B' },
    { label: 'New Note', icon: NotebookPen, path: '/notes', color: '#EC4899' },
  ];

  return (
    <div className="page">
      <Header title="Dashboard" />

      {/* Stats */}
      <div className="stats-grid">
        {loading
          ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(({ label, value, icon: Icon, color, path }) => (
            <div key={label} className="stat-card" onClick={() => navigate(path)} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ background: `${color}22`, color }}>
                <Icon size={22} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Quick Actions */}
      <section className="section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map(({ label, icon: Icon, path, color }) => (
            <button key={label} className="quick-action-btn" onClick={() => navigate(path)}>
              <div className="qa-icon" style={{ background: `${color}22`, color }}>
                <Icon size={24} />
              </div>
              <span>{label}</span>
              <ArrowRight size={16} className="qa-arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* Recent Notes */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Notes</h2>
          <button className="btn-link" onClick={() => navigate('/notes')}>View all →</button>
        </div>
        {loading ? (
          <div className="notes-grid">
            {Array(3).fill(0).map((_, i) => <div key={i} className="note-card skeleton"><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}
          </div>
        ) : stats?.recentNotes?.length ? (
          <div className="notes-grid">
            {stats.recentNotes.map((note) => (
              <div key={note.id} className="note-card" onClick={() => navigate('/notes')}>
                <h4 className="note-title">{note.title}</h4>
                <p className="note-preview">{note.content?.slice(0, 100)}...</p>
                <span className="note-date">{note.createdAt?.toDate?.()?.toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>No notes yet. Create your first note!</p>
            <button className="btn btn-primary" onClick={() => navigate('/notes')}>Create Note</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
