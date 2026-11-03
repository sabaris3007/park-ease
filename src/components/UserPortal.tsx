import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Lock,
  Mail,
  Phone,
  Car,
  Bike,
  Truck,
  Bus,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { User, UserVehicle } from '../types/user';
import { formatCurrency } from '../utils/billing';

export const UserPortal: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    logoutUser,
    setActiveTab,
    setNotification,
    setTicketForModal,
  } = useParking();

  // Authentication State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Dashboard Active Sub-Tab
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'vehicles' | 'profile'>('overview');

  // Dashboard Data State
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [historyTickets, setHistoryTickets] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);

  // Vehicle Management Form Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<UserVehicle | null>(null);
  const [vehiclePlateInput, setVehiclePlateInput] = useState('');
  const [vehicleTypeInput, setVehicleTypeInput] = useState<'Car' | 'Bike' | 'Truck' | 'Bus'>('Car');
  const [vehicleActionLoading, setVehicleActionLoading] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Change State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  // Load Dashboard Data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone);
      fetchDashboardData(currentUser.userId);
    }
  }, [currentUser]);

  const fetchDashboardData = async (userId: number) => {
    setLoadingDashboard(true);
    try {
      const res = await fetch(`/api/users/${userId}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles || []);
        setActiveTickets(data.activeTickets || []);
        setHistoryTickets(data.historyTickets || []);
        setTotalSpent(data.totalSpent || 0);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Invalid credentials.');
        return;
      }

      setCurrentUser(data.user);
      setActiveTab('dashboard');
      setNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Welcome Back!',
        message: `Logged in as ${data.user.name}. Your vehicles and parking history are loaded.`,
      });
    } catch {
      setAuthError('Connection failed. Please ensure the server is active.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Instant 1-Click Demo Login
  const quickDemoLogin = async (email: string, pass: string = 'Password@123') => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Failed to sign in with demo account.');
        return;
      }

      setCurrentUser(data.user);
      setActiveTab('user');
      setNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Welcome Back!',
        message: `Signed in as ${data.user.name}. Your saved vehicles and tickets are loaded.`,
      });
    } catch {
      setAuthError('Connection failed. Please ensure the server is active.');
    } finally {
      setAuthLoading(false);
    }
  };



  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }
    if (regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Registration failed.');
        return;
      }

      setCurrentUser(data.user);
      setActiveTab('dashboard');
      setNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Account Created!',
        message: `Welcome, ${data.user.name}! Your account has been registered with SHA-256 hashed credentials.`,
      });
    } catch {
      setAuthError('Server error during registration. Please retry.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Save / Add Vehicle
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmedPlate = vehiclePlateInput.trim().toUpperCase();
    if (!trimmedPlate) {
      alert('Please enter a vehicle registration number.');
      return;
    }

    setVehicleActionLoading(true);
    try {
      if (editingVehicle) {
        // Update vehicle
        const res = await fetch(`/api/users/${currentUser.userId}/vehicles/${editingVehicle.vehicle_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleNumber: trimmedPlate, vehicleType: vehicleTypeInput }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || 'Failed to update vehicle');
          return;
        }
        setNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Vehicle Updated',
          message: `Vehicle ${trimmedPlate} updated successfully.`,
        });
      } else {
        // Add new vehicle
        const res = await fetch(`/api/users/${currentUser.userId}/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleNumber: trimmedPlate, vehicleType: vehicleTypeInput }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          alert(data.error || 'Failed to register vehicle');
          return;
        }
        setNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Vehicle Registered',
          message: `${vehicleTypeInput} ${trimmedPlate} added to your account!`,
        });
      }

      setShowAddVehicleModal(false);
      setEditingVehicle(null);
      setVehiclePlateInput('');
      fetchDashboardData(currentUser.userId);
    } catch {
      alert('Network error while saving vehicle.');
    } finally {
      setVehicleActionLoading(false);
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (vehicleId: number, plate: string) => {
    if (!currentUser) return;
    if (!confirm(`Are you sure you want to remove vehicle ${plate} from your account?`)) return;

    try {
      const res = await fetch(`/api/users/${currentUser.userId}/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          id: Date.now().toString(),
          type: 'info',
          title: 'Vehicle Removed',
          message: `Vehicle ${plate} has been removed.`,
        });
        fetchDashboardData(currentUser.userId);
      }
    } catch {
      alert('Failed to delete vehicle.');
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setProfileSaving(true);
    try {
      const res = await fetch(`/api/users/${currentUser.userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to update profile');
        return;
      }

      setCurrentUser(data.user);
      setNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information was saved successfully.',
      });
    } catch {
      alert('Error saving profile changes.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPass !== confirmNewPass) {
      alert('New passwords do not match.');
      return;
    }
    if (newPass.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    setPassSaving(true);
    try {
      const res = await fetch(`/api/users/${currentUser.userId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to change password');
        return;
      }

      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been updated securely.',
      });
    } catch {
      alert('Failed to update password.');
    } finally {
      setPassSaving(false);
    }
  };

  // Quick Book Action from Registered Vehicle Card
  const handleQuickBook = (v: UserVehicle) => {
    setActiveTab('park');
    setNotification({
      id: Date.now().toString(),
      type: 'info',
      title: 'Vehicle Selected',
      message: `Proceeding to book bay for your ${v.vehicle_type} [${v.vehicle_number}].`,
    });
  };

  // -----------------------------------------------------------------------------
  // VIEW A: NOT LOGGED IN (Login & Registration Forms)
  // -----------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-4 animate-in fade-in duration-300">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Customer Account &amp; Vehicle Garage</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Welcome to ParkEase
          </h1>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
            Sign in to access your registered vehicles, track active parking tickets in real-time, and view complete parking receipts.
          </p>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-xl mx-auto">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5 text-sm font-semibold">
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In to Account
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
              }}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create New Account
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* 1-Click Instant Demo Profiles - shown on login tab */}
            {authMode === 'login' && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-blue-50/80 via-slate-50 to-indigo-50/60 border border-blue-200/80">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                      1-Click Demo Sign-In
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    Instant Preview
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  Select any sample profile to instantly test the user garage, booked slots, and tickets:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('kavitha@example.com')}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-2xs group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block">
                      Kavitha R.
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Bike &amp; Car Owner
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('rajesh@example.com')}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-2xs group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block">
                      Rajesh Kumar
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Car Owner
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickDemoLogin('arvind@example.com')}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-left transition-all shadow-2xs group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 block">
                      Dr. Arvind Swamy
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Frequent Parker
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Notification Alert */}
            {authError && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium leading-relaxed">{authError}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. kavitha@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {authLoading ? (
                    <span>Authenticating Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. REGISTRATION FORM */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ananya Sundaram"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98401 23456"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password (min 6 chars) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Your account information is securely protected.</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'} Passwords
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {authLoading ? (
                    <span>Creating your account...</span>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // VIEW B: LOGGED-IN USER DASHBOARD
  // -----------------------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* User Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-2xl flex items-center justify-center shadow-inner">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight font-heading">
                Welcome back, {currentUser.name}!
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Active Session
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-200/90 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {currentUser.email}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {currentUser.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setActiveTab('park')}
            className="px-4 py-2 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Parking</span>
          </button>
          <button
            onClick={logoutUser}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20 cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Dashboard Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-sm font-semibold">
        <button
          onClick={() => setDashboardTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            dashboardTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Overview &amp; Live Parking</span>
          {activeTickets.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-400 text-slate-900 font-bold">
              {activeTickets.length} active
            </span>
          )}
        </button>

        <button
          onClick={() => setDashboardTab('vehicles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            dashboardTab === 'vehicles'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>My Vehicles ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
            dashboardTab === 'profile'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile &amp; Security</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SUB-TAB 1: OVERVIEW & ACTIVE PARKING                                 */}
      {/* --------------------------------------------------------------------- */}
      {dashboardTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Registered Vehicles</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {vehicles.length}
              </span>
              <span className="text-[11px] text-blue-600 font-medium mt-0.5 block">
                Associated to your user ID
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium block">Active Parkings</span>
              <span className={`text-2xl font-bold mt-1 block ${activeTickets.length > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                {activeTickets.length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                Currently occupying bays
              </span>
            </div>
          </div>

          {/* Active Parking Status Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="font-bold text-base text-slate-900 font-heading">
                  Live Parking Status
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Real-time bay monitoring
              </span>
            </div>

            {activeTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTickets.map((ticket) => (
                  <div
                    key={ticket.ticket_id}
                    className="p-5 rounded-xl border-2 border-emerald-500/30 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                          {ticket.vehicle_type === 'Bike' && <Bike className="w-5 h-5" />}
                          {ticket.vehicle_type === 'Car' && <Car className="w-5 h-5" />}
                          {ticket.vehicle_type === 'Truck' && <Truck className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="text-xs font-mono font-bold text-emerald-900 block">
                            {ticket.vehicle_number}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            {ticket.vehicle_type} &bull; Ticket {ticket.ticket_id}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                        PARKED
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-200/50 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Centre:</span>
                        <span className="font-bold">{ticket.centre_name || 'Parking Centre'}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Allocated Bay:</span>
                        <span className="font-bold text-blue-700">Bay #{ticket.allocated_slots_json}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Entry Time:</span>
                        <span>{new Date(ticket.entry_time).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-500">Tariff:</span>
                        <span className="font-semibold">₹{ticket.hourly_rate}/hr</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setTicketForModal({
                            ticketId: ticket.ticket_id,
                            vehicleNumber: ticket.vehicle_number,
                            vehicleType: ticket.vehicle_type,
                            ownerName: ticket.owner_name,
                            allocatedSlots: JSON.parse(ticket.allocated_slots_json || '[]'),
                            entryTime: ticket.entry_time,
                            hourlyRate: ticket.hourly_rate,
                            status: 'ACTIVE',
                          });
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer text-center"
                      >
                        View Ticket Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <Car className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">
                  No Active Parking Sessions
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  None of your registered vehicles are currently occupying a parking bay.
                </p>
                <button
                  onClick={() => setActiveTab('park')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Reserve a Parking Slot Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* SUB-TAB 2: VEHICLE MANAGEMENT                                         */}
      {/* --------------------------------------------------------------------- */}
      {dashboardTab === 'vehicles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-heading">
                Registered Vehicles
              </h3>
              <p className="text-xs text-slate-500">
                Manage multiple vehicles associated with your customer ID via MySQL foreign key.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingVehicle(null);
                setVehiclePlateInput('');
                setVehicleTypeInput('Car');
                setShowAddVehicleModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div
                  key={v.vehicle_id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        {v.vehicle_type === 'Bike' && <Bike className="w-5 h-5" />}
                        {v.vehicle_type === 'Car' && <Car className="w-5 h-5" />}
                        {v.vehicle_type === 'Truck' && <Truck className="w-5 h-5" />}
                        {v.vehicle_type === 'Bus' && <Bus className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 font-mono tracking-wide block">
                          {v.vehicle_number}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {v.vehicle_type} &bull; ID #{v.vehicle_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleQuickBook(v)}
                      className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Park This
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingVehicle(v);
                          setVehiclePlateInput(v.vehicle_number);
                          setVehicleTypeInput(v.vehicle_type);
                          setShowAddVehicleModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Vehicle Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.vehicle_id, v.vehicle_number)}
                        className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
              <Car className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No vehicles registered yet.</p>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="mt-3 text-xs font-bold text-blue-600 hover:underline"
              >
                + Register your first vehicle
              </button>
            </div>
          )}
        </div>
      )}



      {/* --------------------------------------------------------------------- */}
      {/* SUB-TAB 4: PROFILE & SECURITY                                         */}
      {/* --------------------------------------------------------------------- */}
      {dashboardTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Personal Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 font-heading mb-1">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Update your contact details in the relational MySQL database.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {profileSaving ? 'Saving Updates...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-base text-slate-900 font-heading mb-1">
              Security &amp; Password
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Change your password. Hashes using SHA-256 with salt.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={passSaving}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {passSaving ? 'Hashing & Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT VEHICLE                                            */}
      {/* --------------------------------------------------------------------- */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
              {editingVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Associate this vehicle to your user ID with unique registration enforcement.
            </p>

            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Registration Number Plate <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vehiclePlateInput}
                  onChange={(e) => setVehiclePlateInput(e.target.value.toUpperCase())}
                  placeholder="e.g. TN 38 AZ 5678"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold tracking-wider uppercase focus:border-blue-500 outline-hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Format: State Code (2) + District (2) + Series (1-2) + Number (4)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vehicle Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Car', 'Bike', 'Truck', 'Bus'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicleTypeInput(type)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        vehicleTypeInput === type
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type === 'Car' && <Car className="w-4 h-4" />}
                      {type === 'Bike' && <Bike className="w-4 h-4" />}
                      {type === 'Truck' && <Truck className="w-4 h-4" />}
                      {type === 'Bus' && <Bus className="w-4 h-4" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={vehicleActionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {vehicleActionLoading ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
