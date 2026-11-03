import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Hash,
  Layers,
  Car,
  Bike,
  Truck,
} from 'lucide-react';
import { useParking } from '../context/ParkingContext';
import { formatCurrency, formatDisplayDateTime } from '../utils/billing';

export const TicketModal: React.FC = () => {
  const { ticketForModal, setTicketForModal, selectedCentre } = useParking();
  const [copied, setCopied] = useState(false);

  if (!ticketForModal) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketForModal.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isTruck = ticketForModal.vehicleType === 'Truck';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Accent Stripe */}
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700" />

        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100 no-print">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
              P
            </span>
            <span className="font-bold text-slate-800 text-sm font-heading">
              Entry Ticket Issued
            </span>
          </div>
          <button
            onClick={() => setTicketForModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Card Body */}
        <div className="p-6 space-y-5 bg-white" id="parking-entry-ticket">
          {/* Header of Ticket */}
          <div className="text-center space-y-1">
            <div className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-700 font-mono font-bold text-xs">
              SMART PARKING TICKET
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">
              {selectedCentre.name}
            </h2>
            <p className="text-xs text-slate-400">
              {selectedCentre.address}, {selectedCentre.locality} &bull; 24/7 Monitored
            </p>
          </div>

          {/* Ticket ID & Barcode Simulation */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black font-mono text-blue-700 tracking-wider">
                {ticketForModal.ticketId}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                title="Copy ticket number"
                className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-colors no-print"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Barcode graphic lines */}
            <div className="py-1 flex items-center justify-center gap-0.5 overflow-hidden opacity-80 h-9">
              {[3, 1, 4, 1, 2, 5, 2, 1, 3, 4, 2, 1, 5, 3, 2, 4, 1, 3, 2, 4, 1, 5, 2, 3, 1, 4, 2].map(
                (w, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800 h-full rounded-2xs"
                    style={{ width: `${w * 2}px` }}
                  />
                )
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 block tracking-widest">
              VALID ENTRY PASS
            </span>
          </div>

          {/* Ticket Key Info Grid */}
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500">Allocated Bay:</span>
              <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {ticketForModal.allocatedSlots.length > 1
                  ? `Bays #${ticketForModal.allocatedSlots[0]} & #${ticketForModal.allocatedSlots[1]} (Tandem)`
                  : `Bay #${ticketForModal.allocatedSlots[0].toString().padStart(2, '0')}`}
              </span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500">Vehicle Number:</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {ticketForModal.vehicleNumber}
              </span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500">Vehicle Type:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                {ticketForModal.vehicleType === 'Bike' && <Bike className="w-3.5 h-3.5 text-blue-600" />}
                {ticketForModal.vehicleType === 'Car' && <Car className="w-3.5 h-3.5 text-blue-600" />}
                {ticketForModal.vehicleType === 'Truck' && <Truck className="w-3.5 h-3.5 text-indigo-600" />}
                {ticketForModal.vehicleType}
              </span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500">Owner Name:</span>
              <span className="font-medium text-slate-800">{ticketForModal.ownerName}</span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500">Entry Timestamp:</span>
              <span className="text-slate-700 font-mono">
                {formatDisplayDateTime(ticketForModal.entryTime)}
              </span>
            </div>

            <div className="py-2 flex justify-between items-center">
              <span className="text-slate-500">Tariff Rate:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(ticketForModal.hourlyRate)} / hour
              </span>
            </div>
          </div>

          {/* Terms Footer */}
          <div className="text-[10px] text-slate-400 text-center leading-relaxed border-t border-slate-100 pt-3">
            Please retain this ticket slip for vehicle verification and seamless parking management.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Ticket</span>
          </button>
          <button
            type="button"
            onClick={() => setTicketForModal(null)}
            className="flex-1 py-2 px-3 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
