import React from 'react';
import {
  ParkingProvider,
  useParking,
} from './context/ParkingContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ParkVehicle } from './components/ParkVehicle';
import { ParkingCentresList } from './components/ParkingCentresList';
import { TicketModal } from './components/TicketModal';
import { UserPortal } from './components/UserPortal';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Bike,
  Car,
  Truck,
  Compass,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, notification, setNotification, currentUser, selectedCentre, metrics } = useParking();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Navigation Header */}
      <Header />

      {/* Guest Welcome Banner - only shown when browsing centres or dashboard while not signed in */}
      {!currentUser && activeTab !== 'user' && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-xs py-2 px-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <Compass className="w-4 h-4 text-blue-200 shrink-0" />
              <span>
                <strong>Welcome to ParkEase!</strong> Browse nearby parking hubs, check real-time bay availability, or sign in to save your vehicles.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('user')}
              className="bg-white/20 hover:bg-white text-white hover:text-blue-700 font-semibold px-3 py-1 rounded-lg transition-colors border border-white/30 shrink-0 cursor-pointer"
            >
              Sign In / Quick Demo &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'centres' && <ParkingCentresList />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'park' && <ParkVehicle />}
        {activeTab === 'user' && <UserPortal />}
      </main>

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-xl shadow-xl border border-slate-200 p-4 flex items-start gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="shrink-0 mt-0.5">
            {notification.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            {notification.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            {notification.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            )}
            {notification.type === 'info' && (
              <Info className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 font-heading">
              {notification.title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Printable Modals */}
      <TicketModal />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                P
              </div>
              <div>
                <span className="font-bold text-slate-900 font-heading text-sm">
                  ParkEase
                </span>
                <span className="text-slate-400 ml-2">
                  Smart Parking Lot Management System
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Bike className="w-3.5 h-3.5 text-blue-600" /> Bike: ₹{selectedCentre.tariff.bike}/hr
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Car className="w-3.5 h-3.5 text-blue-600" /> Car: ₹{selectedCentre.tariff.car}/hr
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Truck className="w-3.5 h-3.5 text-indigo-600" /> Heavy: ₹{selectedCentre.tariff.truck}/hr (2 bays)
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-500">Max 8-hour cap</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{selectedCentre.totalSlots} Bays ({metrics.availableSlots} Available)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ParkingProvider>
      <MainContent />
    </ParkingProvider>
  );
}
