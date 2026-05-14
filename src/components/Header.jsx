import { useAuth } from '../context/AuthContext';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const Header = ({ title, stats }) => {
  const { user, profile } = useAuth();
  const firstName = (profile?.name || user?.displayName || 'Student').split(' ')[0];

  return (
    <header className="page-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <p className="header-greeting">
          {getGreeting()}, <span className="greeting-name">{firstName}</span> 👋
        </p>
      </div>
      <div className="header-right">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="header-avatar" />
        ) : (
          <div className="header-avatar-placeholder">
            {firstName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
