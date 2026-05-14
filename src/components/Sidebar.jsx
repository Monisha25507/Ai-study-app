import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../firebase/auth';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  MessageCircleQuestion,
  NotebookPen,
  FileText,
  BrainCircuit,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doubts', icon: MessageCircleQuestion, label: 'Ask Doubts' },
  { to: '/notes', icon: NotebookPen, label: 'My Notes' },
  { to: '/pdfs', icon: FileText, label: 'PDF Upload' },
  { to: '/quiz', icon: BrainCircuit, label: 'Quiz' },
];

const Sidebar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const displayName = profile?.name || user?.displayName || 'Student';
  const avatar = user?.photoURL;

  const SidebarContent = () => (
    <div className="sidebar-inner">
      {/* Logo */}
      <div className="sidebar-logo">
        <Sparkles size={22} className="logo-icon" />
        <span className="logo-text">StudyAI</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + Signout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          {avatar ? (
            <img src={avatar} alt="avatar" className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        <button className="signout-btn" onClick={handleSignOut}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger */}
      <button className="hamburger-btn" onClick={() => setMobileOpen(true)}>
        <Menu size={24} />
      </button>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="sidebar mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
              <X size={22} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
