import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  MapPin,
  Navigation,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Phone,
  ShieldCheck,
  Zap,
  Car,
  Bike,
  Truck,
  X,
  Compass,
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { ParkingCentre } from '../types/parking';

export const ParkingCentresList: React.FC = () => {
  const {
    parkingCentres,
    selectedCentre,
    selectCentreAndBook,
    setSelectedCentre,
    setActiveTab,
    locationSearch,
    setLocationSearch,
    selectedCity,
    setSelectedCity,
    userCoords,
    isLocating,
    requestUserLocation,
    clearUserLocation,
    toggleUserLocation,
    metrics,
  } = useParking();

  const [selectedAmenity, setSelectedAmenity] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'rating' | 'availability'>('recommended');
  const resultsRef = useRef<HTMLDivElement>(null);

  const cities = ['All', 'Coimbatore', 'Chennai', 'Bengaluru', 'Hyderabad'];
  const amenitiesList = ['ALL', 'EV Fast Charging', 'Covered Parking', '24/7 Open', 'FASTag Enabled'];

  const popularLocations = [
    'Gandhipuram',
    'RS Puram',
    'Brookefields',
    'Peelamedu Airport',
    'T. Nagar',
    'Chennai Central',
    'Indiranagar',
    'Koramangala',
    'Hitech City',
  ];

  // Submit search handler: immediately reset city constraint so query matches everywhere
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const query = locationSearch.trim();

    // If query provided, ensure city is set to 'All' so no search results are hidden
    if (query) {
      setSelectedCity('All');
    }

    // Smoothly scroll down to the parking centres grid
    setTimeout(() => {
      const grid = document.getElementById('centres-results-grid');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleQuickLocationClick = (loc: string) => {
    setLocationSearch(loc);
    setSelectedCity('All');
    setTimeout(() => {
      const grid = document.getElementById('centres-results-grid');
      if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Dedicated GPS toggle handlers with immediate state sync
  const handleToggleGps = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (userCoords || isLocating) {
      clearUserLocation();
      if (sortBy === 'distance') {
        setSortBy('recommended');
      }
    } else {
      setSelectedCity('All');
      setSortBy('distance');
      requestUserLocation();
    }
  };

  const handleTurnOffGps = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    clearUserLocation();
    if (sortBy === 'distance') {
      setSortBy('recommended');
    }
  };

  // Filter & Search logic
  const filteredCentres = useMemo(() => {
    const q = locationSearch.trim().toLowerCase();

    return parkingCentres
      .filter((centre) => {
        // Search text matching
        if (q) {
          const matchName = centre.name.toLowerCase().includes(q);
          const matchLocality = centre.locality.toLowerCase().includes(q);
          const matchAddress = centre.address.toLowerCase().includes(q);
          const matchCity = centre.city.toLowerCase().includes(q);
          const matchLandmark = centre.landmark?.toLowerCase().includes(q);
          const matchesAny = matchName || matchLocality || matchAddress || matchCity || matchLandmark;

          if (!matchesAny) {
            return false;
          }

          // If user specifically clicked a city filter AFTER searching, respect it
          if (selectedCity !== 'All') {
            if (centre.city.toLowerCase() !== selectedCity.toLowerCase()) {
              return false;
            }
          }
        } else {
          // No search text: strictly respect selected city
          if (selectedCity !== 'All' && centre.city.toLowerCase() !== selectedCity.toLowerCase()) {
            return false;
          }
        }

        // Amenity filter
        if (selectedAmenity !== 'ALL') {
          if (selectedAmenity === '24/7 Open' && !centre.is24x7) return false;
          if (selectedAmenity === 'EV Fast Charging' && !centre.amenities.some((a) => a.toLowerCase().includes('ev'))) return false;
          if (selectedAmenity === 'Covered Parking' && !centre.amenities.some((a) => a.toLowerCase().includes('covered'))) return false;
          if (selectedAmenity === 'FASTag Enabled' && !centre.amenities.some((a) => a.toLowerCase().includes('fastag') || a.toLowerCase().includes('boom'))) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance' && userCoords) {
          return (a.distanceKm || 999) - (b.distanceKm || 999);
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'availability') {
          return b.totalSlots - a.totalSlots;
        }
        if (userCoords && a.distanceKm && b.distanceKm) {
          return a.distanceKm - b.distanceKm;
        }
        return b.rating - a.rating;
      });
  }, [parkingCentres, locationSearch, selectedCity, selectedAmenity, sortBy, userCoords]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Discovery Hero Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl text-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-48 h-48 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-semibold text-blue-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart Parking Hubs Across Major Cities &bull; Live Capacity &amp; Location-Specific Tariffs</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading leading-tight">
            Find &amp; Book Parking Nearby
          </h1>
          <p className="text-sm sm:text-base text-blue-100 font-normal leading-relaxed">
            Search by parking facility, location, or GPS distance. Each facility features distinct bay capacity, live availability, and localized tariff rates.
          </p>

          {/* Dedicated Working Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-1 flex flex-col sm:flex-row items-stretch gap-2"
          >
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by centre name, locality, landmark (e.g. Gandhipuram, Brookefields, Airport)..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 text-sm rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-3 focus:ring-blue-300 shadow-sm"
              />
              {locationSearch && (
                <button
                  type="button"
                  onClick={() => setLocationSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dedicated Working Search Button */}
            <button
              type="submit"
              onClick={handleSearchSubmit}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-white hover:bg-blue-50 text-blue-700 shadow-sm hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-blue-600 stroke-[2.5]" />
              <span>Search Centres</span>
            </button>
          </form>

          {/* Dedicated GPS Control Bar with Explicit ON / OFF Toggle */}
          <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 border border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-semibold text-blue-100 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-300" />
                <span>GPS Location:</span>
              </span>

              {/* Master GPS Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleGps}
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-2.5 transition-all shadow-xs cursor-pointer border select-none ${
                  userCoords
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-300 ring-2 ring-emerald-300/30'
                    : isLocating
                    ? 'bg-amber-500 text-white border-amber-300'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
                title={userCoords ? 'Click to Turn GPS OFF' : 'Click to Turn GPS ON'}
              >
                <span className={`w-2 h-2 rounded-full ${userCoords ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
                <span>{isLocating ? 'Acquiring GPS...' : userCoords ? 'GPS is ON' : 'GPS is OFF'}</span>
                
                {/* Switch Graphic */}
                <span
                  className={`w-7 h-4 rounded-full flex items-center p-0.5 transition-colors ${
                    userCoords ? 'bg-emerald-950/70' : 'bg-black/40'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full bg-white shadow-xs transform transition-transform ${
                      userCoords ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>

              {/* Dedicated Red Turn OFF Button whenever GPS is enabled or locating */}
              {(userCoords || isLocating) && (
                <button
                  type="button"
                  onClick={handleTurnOffGps}
                  className="px-3 py-1.5 rounded-lg font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-rose-400"
                  title="Disable GPS location tracking"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Turn OFF GPS</span>
                </button>
              )}
            </div>

            {/* Popular Search Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-blue-100">
              <span className="text-[11px] font-semibold text-blue-200">Popular:</span>
              {popularLocations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => handleQuickLocationClick(loc)}
                  className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 text-[11px] font-medium text-white transition-colors cursor-pointer"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Active GPS Status Indicator Banner with Turn OFF action */}
          {userCoords && (
            <div className="bg-emerald-950/60 backdrop-blur-md border border-emerald-400/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-100 animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>
                  <b className="text-white">GPS Active:</b> Centres are sorted by real-time distance from your current coordinates.
                </span>
              </div>
              <button
                type="button"
                onClick={handleTurnOffGps}
                className="font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ml-3 shrink-0 border border-rose-400"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Turn OFF GPS</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and City Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-4">
        {/* City Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              City:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cities.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls: GPS ON/OFF Toggle & Sort Selector */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Inline GPS ON / OFF Toggle Switch */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">GPS:</span>
              <button
                type="button"
                onClick={handleToggleGps}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer select-none ${
                  userCoords
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                    : isLocating
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title={userCoords ? 'Click to Turn OFF GPS' : 'Click to Turn ON GPS'}
              >
                <div className={`w-2 h-2 rounded-full ${userCoords ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : userCoords ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                <span>{isLocating ? 'Locating...' : userCoords ? 'ON' : 'OFF'}</span>
                <span
                  className={`w-7 h-4 rounded-full flex items-center p-0.5 transition-colors ${
                    userCoords ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full bg-white shadow-xs transform transition-transform ${
                      userCoords ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </span>
              </button>
              {userCoords && (
                <button
                  type="button"
                  onClick={handleTurnOffGps}
                  className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-md transition-colors border border-rose-200 cursor-pointer"
                  title="Turn OFF GPS"
                >
                  Turn OFF
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-hidden"
              >
                <option value="recommended">Recommended</option>
                <option value="distance">Nearest Distance</option>
                <option value="rating">Highest Rated</option>
                <option value="availability">Total Capacity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Amenity Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Amenities:
          </span>
          {amenitiesList.map((amenity) => {
            const isSelected = selectedAmenity === amenity;
            return (
              <button
                key={amenity}
                onClick={() => setSelectedAmenity(amenity)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800 border border-blue-300 font-semibold'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {amenity}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Feedback Bar when searching */}
      {locationSearch && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Showing <b>{filteredCentres.length}</b> parking centre{filteredCentres.length !== 1 ? 's' : ''} for &ldquo;<b>{locationSearch}</b>&rdquo;
            </span>
          </div>
          <button
            onClick={() => setLocationSearch('')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Currently Selected Centre Pill Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Active Selected Centre:</span>
              <span className="font-bold text-slate-900">{selectedCentre.name}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ONLINE
              </span>
            </div>
            <p className="text-slate-500 mt-0.5">
              {selectedCentre.locality}, {selectedCentre.city} &bull; <span className="font-semibold text-slate-700">{selectedCentre.totalSlots} Bays</span> ({metrics.availableSlots} Free) &bull; Bike ₹{selectedCentre.tariff.bike}/h | Car ₹{selectedCentre.tariff.car}/h | Truck ₹{selectedCentre.tariff.truck}/h
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('park')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shrink-0 shadow-2xs"
        >
          <span>Go to Booking Form</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Parking Centre Cards Grid (BookMyShow Style) */}
      <div ref={resultsRef} id="centres-results-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCentres.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 font-heading">
              No Parking Centres Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any parking centres matching &ldquo;{locationSearch}&rdquo;. Try another area or reset filters.
            </p>
            <button
              onClick={() => {
                setLocationSearch('');
                setSelectedCity('All');
                setSelectedAmenity('ALL');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredCentres.map((centre) => {
            const isCurrentSelected = selectedCentre.id === centre.id;

            return (
              <div
                key={centre.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-blue-400 group ${
                  isCurrentSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Top: Name, City & Distance */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {centre.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {centre.locality}, {centre.city}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current text-emerald-600" />
                      <span>{centre.rating}</span>
                    </div>
                  </div>

                  {/* Address & Landmark */}
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {centre.address} &bull; <span className="text-slate-600 font-medium">{centre.landmark}</span>
                  </p>

                  {/* Highlights / Badges: Distance & 24/7 Hours */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {centre.distanceKm !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>{centre.distanceKm} km away</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{centre.openingHours}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{centre.totalSlots} Slots</span>
                    </span>
                    {centre.availableSlots !== undefined && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{centre.availableSlots} Available</span>
                      </span>
                    )}
                  </div>

                  {/* Tariff Preview Pill */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium text-[11px]">Tariff Schedule:</span>
                    <div className="flex items-center gap-3 font-semibold text-slate-800">
                      <span className="flex items-center gap-0.5">
                        <Bike className="w-3 h-3 text-blue-600" /> ₹{centre.tariff.bike}/h
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Car className="w-3 h-3 text-blue-600" /> ₹{centre.tariff.car}/h
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Truck className="w-3 h-3 text-indigo-600" /> ₹{centre.tariff.truck}/h
                      </span>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {centre.amenities.slice(0, 3).map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        {amenity}
                      </span>
                    ))}
                    {centre.amenities.length > 3 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-50 text-slate-400">
                        +{centre.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Book Button */}
                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => selectCentreAndBook(centre)}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md hover:shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Select &amp; Book Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
