import React, { useState } from 'react';
import {
  ParkingSquare,
  Car,
  CheckCircle2,
  IndianRupee,
  Bike,
  Truck,
  ArrowRight,
  PlusCircle,
  LogOut,
  MapPin,
  Clock,
  Search,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Tag,
  Compass,
  X,
  Receipt,
  Timer,
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { formatCurrency, formatDisplayDateTime, calculateParkingBill } from '../utils/billing';
import { ParkingTicket } from '../types/parking';

export const Dashboard: React.FC = () => {
  const {
    metrics,
    activeTickets,
    selectedCentre,
    setActiveTab,
    setTicketForModal,
    setSelectedSlotForModal,
    slots,
    exitVehicle,
  } = useParking();

  const [dashboardSearch, setDashboardSearch] = useState('');
  const [bayFilter, setBayFilter] = useState<'all' | 'free' | 'occupied'>('all');
  const [exitReceiptTicket, setExitReceiptTicket] = useState<ParkingTicket | null>(null);
  const [exitConfirmId, setExitConfirmId] = useState<string | null>(null);

  const handleExitClick = (ticketId: string) => {
    setExitConfirmId(ticketId);
  };

  const handleExitConfirm = () => {
    if (!exitConfirmId) return;
    const result = exitVehicle(exitConfirmId);
    setExitConfirmId(null);
    if (result.success && result.ticket) {
      setExitReceiptTicket(result.ticket);
    }
  };

  const filteredActive = activeTickets.filter(
    (t) =>
      t.vehicleNumber.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(dashboardSearch.toLowerCase()) ||
      t.ownerName.toLowerCase().includes(dashboardSearch.toLowerCase())
  );

  const displayedSlots = slots.filter((s) => {
    if (bayFilter === 'free') return !s.isOccupied;
    if (bayFilter === 'occupied') return s.isOccupied;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Background decorative subtle circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{selectedCentre.name} &bull; {selectedCentre.city}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading leading-tight">
            Smart Parking Management System
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 font-normal leading-relaxed">
            Managing <span className="font-semibold text-white">{selectedCentre.name}</span> ({selectedCentre.locality}, {selectedCentre.city}). Live {selectedCentre.totalSlots}-bay smart allocation &amp; quick ticket booking.
          </p>

          {/* Quick CTA buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('park')}
              className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-98 text-sm"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Park New Vehicle</span>
            </button>
            <button
              onClick={() => setActiveTab('centres')}
              className="inline-flex items-center gap-2 bg-blue-800/80 hover:bg-blue-800 text-white border border-white/20 font-medium px-4 py-2.5 rounded-xl transition-all active:scale-98 text-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Change Centre</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Slots */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Slots
            </span>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <ParkingSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-heading">
              {metrics.totalSlots}
            </span>
            <span className="text-xs text-slate-500 font-medium">Bays capacity</span>
          </div>
        </div>

        {/* Occupied Slots */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Occupied Slots
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700 font-heading">
              {metrics.occupiedSlots}
            </span>
            <span className="text-xs text-blue-600 font-semibold">
              ({metrics.occupancyPercentage}%)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
            <span>{metrics.activeVehiclesCount} active vehicle{metrics.activeVehiclesCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Slots
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-heading">
              {metrics.availableSlots}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Free now</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ready for entry</span>
          </div>
        </div>

        {/* Vehicle Parking Rates (Customer Tariff) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Parking Rates
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Tag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                <Bike className="w-3 h-3 text-blue-600" /> Bike
              </span>
              <span className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                ₹{selectedCentre.tariff.bike}<span className="text-[10px] text-slate-400 font-normal">/hr</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 flex flex-col items-center justify-center">
              <span className="text-[10px] text-blue-700 font-medium flex items-center gap-1">
                <Car className="w-3 h-3 text-blue-600" /> Car
              </span>
              <span className="text-sm font-bold text-blue-700 font-mono mt-0.5">
                ₹{selectedCentre.tariff.car}<span className="text-[10px] text-blue-400 font-normal">/hr</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 flex flex-col items-center justify-center">
              <span className="text-[10px] text-indigo-700 font-medium flex items-center gap-1">
                <Truck className="w-3 h-3 text-indigo-600" /> Truck
              </span>
              <span className="text-sm font-bold text-indigo-700 font-mono mt-0.5">
                ₹{selectedCentre.tariff.truck}<span className="text-[10px] text-indigo-400 font-normal">/hr</span>
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Hourly schedule</span>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Max 8-Hr Cap
            </span>
          </div>
        </div>
      </div>

      {/* Occupancy Progress Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 font-heading">
              Parking Lot Occupancy
            </h3>
            <p className="text-xs text-slate-500">
              Live capacity monitoring &bull; {metrics.occupiedSlots} of {metrics.totalSlots} slots occupied
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Occupied: {metrics.occupiedSlots}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Available: {metrics.availableSlots}
            </span>
            <span className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {metrics.occupancyPercentage}%
            </span>
          </div>
        </div>

        {/* The Bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              metrics.occupancyPercentage >= 90
                ? 'bg-rose-500'
                : metrics.occupancyPercentage >= 70
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.max(4, metrics.occupancyPercentage)}%` }}
          />
        </div>

        {/* Warning if nearing full */}
        {metrics.availableSlots <= 2 && metrics.availableSlots > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Low parking availability! Only {metrics.availableSlots} slot{metrics.availableSlots > 1 ? 's' : ''} left.</span>
          </div>
        )}
        {metrics.availableSlots === 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Parking lot is currently FULL ({metrics.totalSlots}/{metrics.totalSlots}). Incoming vehicles will be rejected until a bay is released.</span>
          </div>
        )}
      </div>

      {/* ── INTERACTIVE PARKING BAYS VISUALIZER ─────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Live Parking Bay Map
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {metrics.availableSlots} Available / {metrics.totalSlots} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any free bay to park, or click an occupied bay to view ticket slip.
            </p>
          </div>

          {/* Bay status filters */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setBayFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                bayFilter === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({slots.length})
            </button>
            <button
              onClick={() => setBayFilter('free')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                bayFilter === 'free'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Free ({metrics.availableSlots})
            </button>
            <button
              onClick={() => setBayFilter('occupied')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                bayFilter === 'occupied'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Occupied ({metrics.occupiedSlots})
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 font-medium">Legend:</span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-400"></span>
            <span>Available Bay</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-md bg-blue-100 border border-blue-400"></span>
            <span>Car Parked</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-md bg-sky-100 border border-sky-400"></span>
            <span>Bike Parked</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-3 h-3 rounded-md bg-indigo-100 border border-indigo-400"></span>
            <span>Heavy (2 Bays)</span>
          </span>
        </div>

        {/* Grid of Slots */}
        <div className="p-5 max-h-[460px] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
            {displayedSlots.map((slot) => {
              const occ = slot.occupiedBy;
              const isOccupied = slot.isOccupied && occ;
              const isTruck = occ?.vehicleType === 'Truck';
              const isBike = occ?.vehicleType === 'Bike';

              return (
                <div
                  key={slot.slotNumber}
                  onClick={() => {
                    if (isOccupied && occ?.ticketId) {
                      const t = activeTickets.find((x) => x.ticketId === occ.ticketId);
                      if (t) setTicketForModal(t);
                    } else if (!isOccupied) {
                      setActiveTab('park');
                    }
                  }}
                  className={`p-2.5 rounded-xl border transition-all text-center flex flex-col justify-between items-center cursor-pointer select-none group relative min-h-[76px] ${
                    isOccupied
                      ? isTruck
                        ? 'bg-indigo-50/80 border-indigo-300 hover:border-indigo-500 hover:shadow-xs'
                        : isBike
                        ? 'bg-sky-50/80 border-sky-300 hover:border-sky-500 hover:shadow-xs'
                        : 'bg-blue-50/80 border-blue-300 hover:border-blue-500 hover:shadow-xs'
                      : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/70 hover:border-emerald-400 hover:shadow-xs'
                  }`}
                  title={
                    isOccupied
                      ? `Bay #${slot.slotNumber}: ${occ.vehicleType} [${occ.plateNumber}] - ${occ.ownerName}`
                      : `Bay #${slot.slotNumber}: Free (Click to Park)`
                  }
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      #{slot.slotNumber.toString().padStart(2, '0')}
                    </span>
                    {isOccupied ? (
                      isTruck ? (
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      ) : isBike ? (
                        <Bike className="w-3.5 h-3.5 text-sky-600" />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-blue-600" />
                      )
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>

                  <div className="my-1">
                    {isOccupied ? (
                      <span className="font-mono font-bold text-[11px] text-slate-800 truncate block max-w-[70px]">
                        {occ.plateNumber.replace(/\s+/g, '')}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700">
                        FREE
                      </span>
                    )}
                  </div>

                  <div className="w-full text-right">
                    <span className="text-[9px] text-slate-400 group-hover:text-blue-600 font-medium">
                      {isOccupied ? 'Slip →' : 'Park +'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Currently Parked Vehicles Breakdown & Quick List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Active Parked Vehicles
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {activeTickets.length} Present
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live roster of vehicles currently occupying bays in the lot
            </p>
          </div>

          {/* Quick Vehicle Type Filters / Counters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600 font-medium">Bikes:</span>
              <span className="font-bold text-slate-900">{metrics.activeBikes}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600 font-medium">Cars:</span>
              <span className="font-bold text-slate-900">{metrics.activeCars}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-slate-600 font-medium">Trucks:</span>
              <span className="font-bold text-slate-900">{metrics.activeTrucks}</span>
            </div>
          </div>
        </div>

        {/* Search bar inside dashboard */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search active vehicle by plate (e.g. TN37AB1234), ticket ID, or owner..."
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
          />
          {dashboardSearch && (
            <button
              onClick={() => setDashboardSearch('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Active Vehicles List/Table */}
        {filteredActive.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {dashboardSearch ? (
              <p className="text-sm">No parked vehicle matches &ldquo;{dashboardSearch}&rdquo;</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-600">The parking lot is currently empty.</p>
                <button
                  onClick={() => setActiveTab('park')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Park the first vehicle now &rarr;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Slot(s)</th>
                  <th className="py-3 px-4">Vehicle Type</th>
                  <th className="py-3 px-4">Number Plate</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Entry Time</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActive.map((ticket) => {
                  const isTruck = ticket.vehicleType === 'Truck';
                  return (
                    <tr
                      key={ticket.ticketId}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {ticket.ticketId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px] ${
                            isTruck
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {ticket.allocatedSlots.length > 1
                            ? `Slots #${ticket.allocatedSlots[0]} & #${ticket.allocatedSlots[1]}`
                            : `Slot #${ticket.allocatedSlots[0]}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                          {ticket.vehicleType === 'Bike' && (
                            <Bike className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {ticket.vehicleType === 'Car' && (
                            <Car className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          {ticket.vehicleType === 'Truck' && (
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                          {ticket.vehicleType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-semibold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {ticket.vehicleNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {ticket.ownerName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDisplayDateTime(ticket.entryTime)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setTicketForModal(ticket)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg transition-all shadow-2xs cursor-pointer"
                          >
                            <span>View Slip</span>
                          </button>
                          <button
                            onClick={() => handleExitClick(ticket.ticketId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 hover:border-rose-600 rounded-lg transition-all shadow-2xs cursor-pointer"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Exit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredActive.length} of {activeTickets.length} active parked vehicles</span>
          <button
            onClick={() => setActiveTab('park')}
            className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Book a slot for parking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── EXIT CONFIRMATION DIALOG ─────────────────────────────── */}
      {exitConfirmId && (() => {
        const t = activeTickets.find((x) => x.ticketId === exitConfirmId);
        if (!t) return null;
        const bill = calculateParkingBill(t.vehicleType, t.entryTime);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="h-1.5 bg-gradient-to-r from-rose-500 to-orange-500" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Confirm Vehicle Exit</h3>
                    <p className="text-xs text-slate-500">This will free the slot immediately</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-200 mb-5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ticket</span>
                    <span className="font-mono font-bold text-blue-700">{t.ticketId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-mono font-semibold text-slate-800">{t.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entry</span>
                    <span className="text-slate-700">{formatDisplayDateTime(t.entryTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-800">{bill.durationLabel}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                    <span className="text-slate-700 font-semibold">Amount Due</span>
                    <span className="font-bold text-emerald-700 text-sm">{formatCurrency(bill.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setExitConfirmId(null)}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExitConfirm}
                    className="flex-1 py-2.5 px-4 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm"
                  >
                    Confirm Exit
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── EXIT RECEIPT MODAL ───────────────────────────────────── */}
      {exitReceiptTicket && (() => {
        const t = exitReceiptTicket;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

              {/* Header */}
              <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">✓</span>
                  <span className="font-bold text-slate-800 text-sm">Exit Receipt</span>
                </div>
                <button
                  onClick={() => setExitReceiptTicket(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Success badge */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-mono font-bold text-xs mb-2">
                    VEHICLE EXITED SUCCESSFULLY
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{selectedCentre.name}</h2>
                  <p className="text-xs text-slate-400">{selectedCentre.address}, {selectedCentre.locality}</p>
                </div>

                {/* Ticket ref */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                  <span className="text-2xl font-black font-mono text-slate-700 tracking-wider">{t.ticketId}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5 tracking-widest font-mono">EXIT RECEIPT</p>
                </div>

                {/* Details */}
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{t.vehicleNumber}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Type</span>
                    <span className="font-semibold text-slate-800">{t.vehicleType}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Bay(s)</span>
                    <span className="font-mono font-bold text-blue-700">
                      {t.allocatedSlots.length > 1
                        ? `#${t.allocatedSlots[0]} & #${t.allocatedSlots[1]}`
                        : `#${t.allocatedSlots[0]}`}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Entry Time</span>
                    <span className="text-slate-700 font-mono">{formatDisplayDateTime(t.entryTime)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Exit Time</span>
                    <span className="text-slate-700 font-mono">{formatDisplayDateTime(t.exitTime!)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-800">
                      {(() => {
                        const hrs = Math.floor(t.durationHours ?? 0);
                        const mins = Math.round(((t.durationHours ?? 0) - hrs) * 60);
                        return hrs === 0 ? `${mins} min${mins !== 1 ? 's' : ''}` : `${hrs} hr${hrs !== 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`.trim();
                      })()}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Billable Hours</span>
                    <span className="font-semibold text-slate-800">{t.billableHours} hr{t.billableHours !== 1 ? 's' : ''} × {formatCurrency(t.hourlyRate)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-900">Total Amount Paid</span>
                  <span className="text-2xl font-black text-emerald-700">{formatCurrency(t.totalAmount ?? 0)}</span>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  Thank you for parking at ParkEase. Bay {t.allocatedSlots.length > 1 ? 's are' : ' is'} now free for new vehicles.
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => setExitReceiptTicket(null)}
                  className="flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
