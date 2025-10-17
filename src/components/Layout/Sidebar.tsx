import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  FolderIcon,
  ListBulletIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  BanknotesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, show: true },
    { name: 'Enquiries', href: '/enquiries', icon: DocumentTextIcon, show: true },
    { name: 'Doc Verification', href: '/documents', icon: FolderIcon, show: true },
    { name: 'Shortlist', href: '/shortlist', icon: ListBulletIcon, show: true },
    { name: 'Payment Gateway Applications', href: '/payment-gateway', icon: CreditCardIcon, show: true },
    { name: 'Staff Management', href: '/staff', icon: UserGroupIcon, show: isAdmin },
    { name: 'Transactions', href: '/transactions', icon: BanknotesIcon, show: isAdmin },
  ];

  return (
    <aside className="sidebar-modern">
      {/* Logo Section */}
      <div className="p-8 border-b border-slate-700/50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center">
            <img 
              src="/generated-image.png" 
              alt="Company Logo" 
              className="w-20 h-20 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              style={{ 
                filter: 'contrast(2.2) saturate(2.0) brightness(1.8)',
                imageRendering: 'crisp-edges',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          </div>
          <div>
            <h1 className="text-white text-xl font-poppins font-bold">Portal</h1>
            <p className="text-slate-300 text-sm font-medium">Business Loan Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-6">
        <ul className="space-y-1">
          {navItems
            .filter(item => item.show)
            .map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <item.icon className="h-5 w-5 mr-4" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">{user?.name}</div>
            <div className="text-slate-400 text-sm">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-red-500/20 hover:border-red-400 rounded-xl transition-all duration-200 border border-slate-700 hover:border-red-400"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
