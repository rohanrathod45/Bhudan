import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertTriangle,
  ShieldCheck,
  Scale,
  Truck,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCheck
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'red-zones', label: 'Red Zones', icon: AlertTriangle },
  { id: 'safe-sites', label: 'Safe Sites', icon: ShieldCheck },
  { id: 'capacity', label: 'Capacity', icon: Scale },
  { id: 'relocation', label: 'Relocation', icon: Truck },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const ADMIN_ITEM = { id: 'admin', label: 'Admin', icon: Users };

export default function TopNavbar({ activeSection, scrollToSection }) {
  const { user, logout, can } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navList = can('admin') ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const roleLabels = {
    admin: 'Administrator',
    disaster_authority: 'Disaster Authority',
    analyst: 'Risk Analyst',
    field_officer: 'Field Officer',
    viewer: 'Public Viewer',
  };

  const handleNavClick = (id) => {
    scrollToSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#0B2447] text-white shadow-md border-b border-[#14356B] select-none">
      <div className="px-4 md:px-8 flex items-center justify-between h-[54px]">
        {/* Horizontal Navigation Items (Desktop) */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 h-full">
          {navList.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative h-full px-3.5 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'text-white bg-white/10 font-bold'
                    : 'text-[#CBD5E1] hover:text-[#F59E0B] hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-colors duration-200 ${
                    isActive ? 'text-[#F59E0B]' : 'text-[#CBD5E1] group-hover:text-[#F59E0B]'
                  }`}
                />
                <span>{item.label}</span>

                {/* Bottom Amber Underline */}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] bg-[#F59E0B] transition-all duration-200 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right-aligned User Profile & Status */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2.5 bg-[#14356B]/70 hover:bg-[#14356B] border border-[#14356B] px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-[#F59E0B] text-[#0B2447] font-bold flex items-center justify-center text-xs uppercase shadow-xs">
                {user?.name?.[0] || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-white truncate max-w-[120px]">{user?.name}</p>
                <p className="text-[10px] text-amber-300 font-medium truncate max-w-[120px]">
                  {roleLabels[user?.role] || user?.role}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 p-2 z-50 animate-fade-up">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-[#0B2447]">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0B2447]/10 text-[#0B2447] border border-[#0B2447]/20 uppercase">
                    {user?.role?.replace(/_/g, ' ')}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Icon */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg bg-[#14356B] text-white hover:bg-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B2447] border-b border-[#14356B] px-4 py-3 space-y-1">
          {navList.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  isActive
                    ? 'bg-[#F59E0B] text-[#0B2447] font-bold'
                    : 'text-[#CBD5E1] hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
