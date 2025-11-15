import { NavLink } from 'react-router-dom';

import '../../App.css';

const Sidebar = () => {
  const items = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Purchase', to: '/purchase' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__brand-accent" />
        <div>
          <p className="sidebar__brand-title">E-Comerce</p>
          <p className="sidebar__brand-subtitle">Store Management</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
            end
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

