
import React, { useState } from 'react';
import { User, Ticket } from './types';
import { Header } from './components/Header';
import { Login } from './views/Login';
import { Dashboard } from './views/Dashboard';
import { TicketForm } from './views/TicketForm';
import { UserManagement } from './views/UserManagement';
import { getTickets } from './services/db';

type ViewState = 'login' | 'dashboard' | 'create' | 'detail' | 'users' | 'public_create';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('login');
  const [selectedTicketId, setSelectedTicketId] = useState<string | undefined>(undefined);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setSelectedTicketId(undefined);
  };

  const handleNavigate = (view: ViewState, ticketId?: string) => {
    setSelectedTicketId(ticketId);
    setCurrentView(view);
  };

  const renderContent = () => {
    // Public Flow: Allow Ticket Creation without User Login
    if (currentView === 'public_create') {
        return <TicketForm user={null} onBack={() => handleNavigate('login')} />;
    }

    // Auth Guard
    if (!user) {
        return <Login onLogin={handleLogin} onNavigate={(view) => handleNavigate(view as ViewState)} />;
    }

    // Authenticated Flows
    switch (currentView) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={(view, id) => handleNavigate(view as ViewState, id)} />;
      case 'create':
        return <TicketForm user={user} onBack={() => handleNavigate('dashboard')} />;
      case 'detail':
        const tickets = getTickets();
        const ticket = tickets.find(t => t.id === selectedTicketId);
        return <TicketForm user={user} ticket={ticket} onBack={() => handleNavigate('dashboard')} />;
      case 'users':
        return <UserManagement onBack={() => handleNavigate('dashboard')} />;
      default:
        return <Dashboard user={user} onNavigate={(view, id) => handleNavigate(view as ViewState, id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Show header only if user is logged in, or customized for public view could be added here */}
      {user && <Header user={user} onLogout={handleLogout} />}
      <main>
        {renderContent()}
      </main>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          header { display: none; }
          input, select, textarea { border: none !important; appearance: none; padding: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
