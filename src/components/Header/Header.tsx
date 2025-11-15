import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-header">
      <div>
        <p className="app-header__eyebrow">Store Overview</p>
        <h1 className="app-header__title">Dashboard</h1>
      </div>
      <div className="app-header__actions">
        <button type="button" className="app-header__button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
};

export default Header;

