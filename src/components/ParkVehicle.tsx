import React, { useState, useEffect } from 'react';
import {
  Bike,
  Car,
  Truck,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  CreditCard,
  Hash,
  Info,
  MapPin,
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { VehicleType } from '../types/parking';
import { VEHICLE_RATES, formatCurrency } from '../utils/billing';
import { allocateSlots, validateVehiclePlate } from '../utils/validation';
import { DUMMY_VEHICLES_CATALOG } from '../data/initialData';

export const ParkVehicle: React.FC = () => {
  const { parkVehicle, slots, activeTickets, selectedCentre, setActiveTab, currentUser, metrics } = useParking();

  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [plateNumber, setPlateNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const [customEntryDateTime, setCustomEntryDateTime] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [liveValidation, setLiveValidation] = useState<{
    isValid: boolean;
    message?: string;
  }>({ isValid: false });

  // Prefill logged-in user details & registered vehicles
  useEffect(() => {
    if (currentUser) {
      if (!ownerName) setOwnerName(currentUser.name);
      fetch(`/api/users/${currentUser.userId}/vehicles`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.vehicles) {
            setUserVehicles(data.vehicles);
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  // Update current time display every 10 seconds
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeDisplay(
        new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Set default datetime-local string
  useEffect(() => {
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setCustomEntryDateTime(localIso);
  }, []);

  // Live plate validation feedback
  useEffect(() => {
    if (!plateNumber) {
      setLiveValidation({ isValid: false });
      return;
    }
    const res = validateVehiclePlate(plateNumber);
    setLiveValidation({
      isValid: res.isValid,
      message: res.isValid ? 'Valid format (State + District + Series + Number)' : res.errorMessage,
    });
  }, [plateNumber]);

  // Projected slot allocation preview
  const previewAllocation = allocateSlots(vehicleType, slots);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let entryIso = new Date().toISOString();
    if (!useCurrentTime && customEntryDateTime) {
      entryIso = new Date(customEntryDateTime).toISOString();
    }

    const result = parkVehicle(vehicleType, plateNumber, ownerName, entryIso);

    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      // Clear inputs
      setPlateNumber('');
      setOwnerName('');
    }
  };

  const fillQuickVehicle = (dummy: (typeof DUMMY_VEHICLES_CATALOG)[0]) => {
    setVehicleType(dummy.type);
    setPlateNumber(dummy.plateNumber);
    setOwnerName(dummy.ownerName);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Module Title Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-heading">
          Park Vehicle
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Issue entry tickets, validate number plates, and automatically allocate optimal parking slots.
        </p>
      </div>

      {/* Selected Centre Banner */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium">Selected Centre:</span>
              <span className="font-bold text-slate-900 text-sm">{selectedCentre.name}</span>
              <span className="text-slate-500">({selectedCentre.locality}, {selectedCentre.city})</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 flex-wrap">
              <span className="font-semibold text-slate-800">{selectedCentre.totalSlots} Total Bays</span>
              <span>&bull;</span>
              <span className="font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-300">
                {metrics.availableSlots} Bays Free Now
              </span>
              <span>&bull;</span>
              <span>Rates: Bike ₹{selectedCentre.tariff.bike}/hr | Car ₹{selectedCentre.tariff.car}/hr | Truck ₹{selectedCentre.tariff.truck}/hr</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('centres')}
          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shrink-0 shadow-2xs"
        >
          Change Centre &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Entry Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vehicle Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                1. Select Vehicle Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Bike', 'Car', 'Truck'] as VehicleType[]).map((type) => {
                  const isSelected = vehicleType === type;
                  const slotsRequired = type === 'Truck' ? 2 : 1;
                  const hourlyRate =
                    type === 'Bike'
                      ? selectedCentre.tariff.bike
                      : type === 'Car'
                      ? selectedCentre.tariff.car
                      : selectedCentre.tariff.truck;

                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => {
                        setVehicleType(type);
                        setErrorMsg(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="p-2 rounded-lg bg-white border border-slate-200/60 shadow-2xs text-blue-600">
                          {type === 'Bike' && <Bike className="w-5 h-5" />}
                          {type === 'Car' && <Car className="w-5 h-5" />}
                          {type === 'Truck' && <Truck className="w-5 h-5" />}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <div className="mt-3">
                        <div className="font-bold text-sm">{type}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">
                          {formatCurrency(hourlyRate)}/hr &bull; {slotsRequired} {slotsRequired === 1 ? 'Slot' : 'Slots'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vehicle Number Plate */}
            <div>
              {userVehicles.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-900 block mb-1.5">
                    Your Registered Vehicles (Click to Autofill):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {userVehicles.map((uv: any) => (
                      <button
                        key={uv.vehicle_id}
                        type="button"
                        onClick={() => {
                          setPlateNumber(uv.vehicle_number);
                          if (uv.vehicle_type === 'Car' || uv.vehicle_type === 'Bike' || uv.vehicle_type === 'Truck') {
                            setVehicleType(uv.vehicle_type);
                          }
                          setErrorMsg(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-blue-800 text-xs font-mono font-bold hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="text-[10px] text-blue-600 font-sans font-medium">{uv.vehicle_type}:</span>
                        <span>{uv.vehicle_number}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="plateInput"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600"
                >
                  2. Vehicle Registration Plate
                </label>
                <span className="text-[11px] text-slate-400 font-sans">
                  Format: State + RTO + Series + Digits (e.g. TN38AB1234)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="plateInput"
                  type="text"
                  placeholder="e.g. TN37AB1234"
                  value={plateNumber}
                  onChange={(e) => {
                    setPlateNumber(e.target.value.toUpperCase());
                    setErrorMsg(null);
                  }}
                  maxLength={12}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm font-mono tracking-wider uppercase rounded-lg border bg-white focus:outline-hidden transition-all ${
                    liveValidation.isValid
                      ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-slate-900'
                      : plateNumber
                      ? 'border-amber-400 focus:ring-2 focus:ring-amber-200 text-slate-900'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  }`}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {liveValidation.isValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : plateNumber ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : null}
                </div>
              </div>

              {/* Validation helper text */}
              {plateNumber && (
                <p
                  className={`mt-1.5 text-xs flex items-center gap-1 ${
                    liveValidation.isValid ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>{liveValidation.message}</span>
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label
                htmlFor="ownerInput"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                3. Vehicle Owner / Driver Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="ownerInput"
                  type="text"
                  placeholder="e.g. Arun Kumar"
                  value={ownerName}
                  onChange={(e) => {
                    setOwnerName(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            {/* Entry Date & Time */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    4. Entry Date &amp; Time
                  </span>
                </div>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCurrentTime}
                    onChange={(e) => setUseCurrentTime(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Use Live Clock</span>
                </label>
              </div>

              {useCurrentTime ? (
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="text-slate-500 font-medium">Automatic timestamp:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {currentTimeDisplay} (Now)
                  </span>
                </div>
              ) : (
                <input
                  type="datetime-local"
                  value={customEntryDateTime}
                  onChange={(e) => setCustomEntryDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-200"
                />
              )}
            </div>

            {/* Allocation Target Preview Box */}
            <div
              className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
                previewAllocation.success
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <div>
                <span className="font-bold block">
                  {previewAllocation.success
                    ? 'Target Slot Allocation:'
                    : 'Allocation Not Possible:'}
                </span>
                <span className="text-slate-600 mt-0.5 block">
                  {previewAllocation.success ? (
                    vehicleType === 'Truck' ? (
                      <>
                        Assigning consecutive tandem bays: <b>Slot #{previewAllocation.allocatedSlots[0]}</b> and{' '}
                        <b>Slot #{previewAllocation.allocatedSlots[1]}</b>
                      </>
                    ) : (
                      <>
                        Assigning first free bay: <b>Slot #{previewAllocation.allocatedSlots[0]}</b>
                      </>
                    )
                  ) : (
                    previewAllocation.message
                  )}
                </span>
              </div>
              {previewAllocation.success && (
                <span className="px-2.5 py-1 rounded bg-blue-600 text-white font-bold font-mono text-sm">
                  #{previewAllocation.allocatedSlots.join(' & #')}
                </span>
              )}
            </div>

            {/* Error Message banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Entry Rejected</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!previewAllocation.success}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                previewAllocation.success
                  ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md hover:shadow-blue-500/20 active:scale-98 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue Ticket &amp; Park Vehicle</span>
            </button>
          </form>
        </div>

        {/* Right Column: Rate Card & Dummy Vehicle Quick-Picks */}
        <div className="space-y-6">
          {/* Rate Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Parking Tariff</span>
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded truncate max-w-[150px]">
                {selectedCentre.name}
              </span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-50 text-blue-600">
                    <Bike className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">Bike</span>
                    <span className="text-[11px] text-slate-400">1 Slot Required</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">₹{selectedCentre.tariff.bike}</span>
                  <span className="text-slate-400 text-[11px] block">/ hour</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-50 text-blue-600">
                    <Car className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">Car</span>
                    <span className="text-[11px] text-slate-400">1 Slot Required</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">₹{selectedCentre.tariff.car}</span>
                  <span className="text-slate-400 text-[11px] block">/ hour</span>
                </div>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-blue-50 text-blue-600">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">Truck</span>
                    <span className="text-[11px] text-indigo-600 font-semibold">2 Consecutive Bays</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">₹{selectedCentre.tariff.truck}</span>
                  <span className="text-slate-400 text-[11px] block">/ hour</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Pick Test Vehicles */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" />
                <span>Quick-Fill Test Vehicles</span>
              </h3>
              <span className="text-[10px] text-slate-400">1-click populate</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select one of the 12 dummy test records from the problem specification:
            </p>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {DUMMY_VEHICLES_CATALOG.map((dummy) => {
                const isAlreadyParked = activeTickets.some(
                  (t) => t.vehicleNumber === dummy.plateNumber
                );
                return (
                  <button
                    key={dummy.sNo}
                    type="button"
                    onClick={() => fillQuickVehicle(dummy)}
                    className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">#{dummy.sNo}</span>
                      <span className="font-medium text-slate-800">{dummy.ownerName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {dummy.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-slate-600 text-[11px]">
                        {dummy.plateNumber}
                      </span>
                      {isAlreadyParked && (
                        <span className="text-[10px] px-1 rounded bg-amber-100 text-amber-700 font-bold">
                          Parked
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
