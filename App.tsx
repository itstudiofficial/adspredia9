
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthState, User, Task } from './types';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import SpinWheel from './pages/SpinWheel';
import CreateTask from './pages/CreateTask';
import Wallet from './pages/Wallet';
import Referral from './pages/Referral';
import Profile from './pages/Profile';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import { AdsprediaBackend } from './backend';

const DEFAULT_TASKS: Task[] = [];

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initApp = async () => {
      // 1. Initialize DB with defaults if necessary
      await AdsprediaBackend.initialize(DEFAULT_TASKS);

      // 2. Check session and sync with latest DB data
      const sessionUserStr = sessionStorage.getItem('adspredia_session');
      if (sessionUserStr) {
        try {
          const sessionUser = JSON.parse(sessionUserStr);
          const latestUser = await AdsprediaBackend.getUser(sessionUser.email);
          if (latestUser) {
            setAuth({
              user: latestUser,
              isAuthenticated: true,
            });
            // Update session storage with latest (in case stats changed)
            sessionStorage.setItem('adspredia_session', JSON.stringify(latestUser));
          } else {
            sessionStorage.removeItem('adspredia_session');
            setAuth({ user: null, isAuthenticated: false });
          }
        } catch (e) {
          sessionStorage.removeItem('adspredia_session');
        }
      }
    };
    initApp();
  }, []);

  const handleLogin = (userData: User) => {
    sessionStorage.setItem('adspredia_session', JSON.stringify(userData));
    setAuth({ user: userData, isAuthenticated: true });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adspredia_session');
    setAuth({ user: null, isAuthenticated: false });
  };

  const syncUser = (updatedUser: User) => {
    setAuth(prev => ({ ...prev, user: updatedUser }));
    sessionStorage.setItem('adspredia_session', JSON.stringify(updatedUser));
  };

  const completeTask = (coins: number, type: 'earning' | 'bonus' = 'earning') => {
    if (auth.user) {
      const newUser = { 
        ...auth.user, 
        coins: auth.user.coins + coins,
        balance: auth.user.balance + (coins / 1000)
      };
      setAuth(prev => ({ ...prev, user: newUser }));
      AdsprediaBackend.saveUser(newUser);
      sessionStorage.setItem('adspredia_session', JSON.stringify(newUser));
      AdsprediaBackend.createTransaction(newUser.id, type, coins / 1000);
    }
  };

  const handleDeposit = (amount: number) => {
    if (auth.user) {
      const newUser = { 
        ...auth.user, 
        balance: auth.user.balance + amount,
        coins: auth.user.coins + (amount * 1000)
      };
      setAuth(prev => ({ ...prev, user: newUser }));
      AdsprediaBackend.saveUser(newUser);
      sessionStorage.setItem('adspredia_session', JSON.stringify(newUser));
      AdsprediaBackend.createTransaction(newUser.id, 'deposit', amount);
    }
  };

  const handleCreateTask = (newTask: Task, totalCost: number) => {
    if (auth.user && auth.user.balance >= totalCost) {
      // Save directly to backend
      AdsprediaBackend.saveTask(newTask);
      
      const newUser = {
        ...auth.user,
        balance: auth.user.balance - totalCost
      };
      setAuth(prev => ({ ...prev, user: newUser }));
      AdsprediaBackend.saveUser(newUser);
      sessionStorage.setItem('adspredia_session', JSON.stringify(newUser));
      AdsprediaBackend.createTransaction(newUser.id, 'withdrawal', totalCost, 'Campaign Budget');
      return true;
    }
    return false;
  };

  const claimDailyBonus = () => {
    if (!auth.user) return 0;
    const today = new Date().toISOString().split('T')[0];
    const lastDate = auth.user.lastBonusDate;
    if (lastDate === today) return 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = auth.user.loginStreak || 0;
    if (lastDate === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }
    if (newStreak > 7) newStreak = 1;

    const reward = 10 + (newStreak * 5);
    completeTask(reward, 'bonus');

    const newUser = { 
      ...auth.user, 
      lastBonusDate: today,
      loginStreak: newStreak
    };
    setAuth(prev => ({ ...prev, user: newUser }));
    AdsprediaBackend.saveUser(newUser);
    sessionStorage.setItem('adspredia_session', JSON.stringify(newUser));
    return reward;
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={!auth.isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/auth" element={!auth.isAuthenticated ? <Auth onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        
        <Route element={<Layout user={auth.user} onLogout={handleLogout} isAuthenticated={auth.isAuthenticated} />}>
          <Route path="/dashboard" element={<Dashboard user={auth.user} onClaimBonus={claimDailyBonus} />} />
          <Route path="/tasks" element={<Tasks onComplete={(coins) => completeTask(coins)} />} />
          <Route path="/lucky-spin" element={<SpinWheel user={auth.user} onSpinComplete={syncUser} />} />
          <Route path="/create-task" element={<CreateTask user={auth.user} onCreate={handleCreateTask} />} />
          <Route path="/wallet" element={<Wallet user={auth.user} onDeposit={handleDeposit} />} />
          <Route path="/referral" element={<Referral user={auth.user} />} />
          <Route path="/profile" element={<Profile user={auth.user} onUpdateUser={syncUser} onLogout={handleLogout} />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/admin" element={auth.user?.role === 'admin' ? <Admin /> : <Navigate to="/dashboard" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
