import React, { useState } from 'react';
import {
  Compass,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Navigation,
  User as UserIcon,
} from 'lucide-react';
import { ActiveTab, useParking } from '../context/ParkingContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    metrics,
    selectedCentre,
    userCoords,
    isLocating,
    requestUserLocation,
    clearUserLocation,
    currentUser,
    logoutUser,
  } = useParking();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'centres', label: 'Find Centres', icon: <Compass className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Live Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'user', label: currentUser ? currentUser.name : 'My Account', icon: <UserIcon className="w-4 h-4" /> },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => setActiveTab('centres')}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                P
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">
                    ParkEase
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Smart Parking. Easy Booking.
                </p>
              </div>
            </div>

            {/* Location & Centre Selector in Header with distinct border separation */}
            <div className="hidden lg:flex items-center gap-2 pl-4 ml-2 border-l border-slate-200">
              <div
                onClick={() => setActiveTab('centres')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all text-xs group"
                title="Click to search & switch parking centres"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                    {selectedCentre.locality}, {selectedCentre.city}
                  </span>
                  <span className="font-bold text-slate-800 max-w-[160px] truncate block leading-tight mt-0.5">
                    {selectedCentre.name}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-blue-600 ml-0.5" />
              </div>

              {/* Instant GPS ON/OFF Toggle in Header */}
              {userCoords ? (
                <button
                  type="button"
                  onClick={() => clearUserLocation()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors shadow-2xs group/gps cursor-pointer"
                  title="GPS is ON. Click to Turn OFF"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse group-hover/gps:bg-rose-500" />
                  <span className="group-hover/gps:hidden">GPS: ON</span>
                  <span className="hidden group-hover/gps:inline">Turn OFF GPS</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => requestUserLocation()}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer"
                  title="GPS is OFF. Click to Turn ON"
                >
                  <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
                  <span>{isLocating ? 'Locating...' : 'GPS: OFF'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs & Controls */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Sign In CTA if logged out */}
            {!currentUser && (
              <button
                onClick={() => setActiveTab('user')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all border cursor-pointer ${
                  activeTab === 'user'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700'
                }`}
                title="Sign in or try quick demo accounts"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Profile / Dashboard Button */}
            {currentUser && (
              <button
                onClick={() => setActiveTab('user')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'user'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
                title="View My Profile & Dashboard"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">{currentUser.name}</span>
              </button>
            )}

            {/* Logout CTA */}
            {currentUser && (
              <button
                onClick={logoutUser}
                title="Sign out of account"
                className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}

            {/* Primary Blue + Park Vehicle CTA */}
            <button
              onClick={() => setActiveTab('park')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                activeTab === 'park'
                  ? 'bg-blue-700 text-white ring-2 ring-blue-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:shadow-blue-500/20 active:scale-98'
              }`}
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Park Vehicle</span>
            </button>

          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setActiveTab('park')}
              className="bg-blue-600 text-white p-2 rounded-lg shadow-sm"
              aria-label="Park vehicle"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Active Centre Info Mobile */}
          <div
            onClick={() => {
              setActiveTab('centres');
              setMobileMenuOpen(false);
            }}
            className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">
                  {selectedCentre.city}
                </span>
                <span className="font-bold text-xs text-slate-900 line-clamp-1">
                  {selectedCentre.name}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
              Change &rarr;
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 block">Occupancy</span>
              <span className="font-bold text-slate-800 text-sm">
                {metrics.occupiedSlots} / {metrics.totalSlots} ({metrics.occupancyPercentage}%)
              </span>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-xs">
              <span className="text-blue-600 block">Free Bays</span>
              <span className="font-bold text-blue-900 text-sm">
                {metrics.availableSlots} Available
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
            {/* Park Vehicle in mobile drawer */}
            <button
              onClick={() => handleNavClick('park')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'park'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={activeTab === 'park' ? 'text-blue-600' : 'text-slate-400'}>
                  <PlusCircle className="w-4 h-4" />
                </span>
                <span>Park Vehicle</span>
              </div>
            </button>
          </div>

          {currentUser && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 block">{currentUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
