import logoIcon from '../../assets/logo-icon.svg';
import { PhoneCall, Mail, MapPin, ExternalLink, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#06162C] text-slate-300 pt-12 pb-6 border-t-4 border-[#F59E0B]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
        {/* Column 1: Brand & Mission */}
        <div>
          <div className="flex items-center space-x-2.5 mb-3">
            <img src={logoIcon} alt="BhuDan Logo" className="h-8 w-8 shrink-0" />
            <span className="text-xl font-bold text-white tracking-tight font-heading">BHUDAN</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Intelligent Identification of Hazard-Based Red Zones, Carrying Capacity Assessment and Immediate Relocation Needs for Vulnerable Habitations.
          </p>
          <div className="flex items-center space-x-2 text-xs text-amber-400 font-medium">
            <Globe className="h-4 w-4" />
            <span>National Disaster Management System</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 border-b border-slate-700 pb-1.5">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#hero" className="hover:text-amber-400 transition">About BhuDan Platform</a></li>
            <li><a href="#dashboard" className="hover:text-amber-400 transition">Live Hazard Risk Analytics</a></li>
            <li><a href="#red-zones" className="hover:text-amber-400 transition">GIS Hazard Red Zones</a></li>
            <li><a href="#safe-sites" className="hover:text-amber-400 transition">Safe Sites & Capacity Assessment</a></li>
            <li><a href="#relocation" className="hover:text-amber-400 transition">AI-Driven Relocation Planning</a></li>
            <li><a href="#reports" className="hover:text-amber-400 transition">Executive Reports & Downloads</a></li>
          </ul>
        </div>

        {/* Column 3: Control Room & Emergency Help */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 border-b border-slate-700 pb-1.5">
            Disaster Control Room
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-start space-x-2">
              <PhoneCall className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Emergency Helpline: 1070 / 1077</p>
                <p className="text-[11px] text-slate-400">Toll-Free 24x7 Control Room</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Mail className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300">controlroom@ndma.gov.in</p>
                <p className="text-slate-300">support@bhudan.gov.in</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-slate-400 text-[11px]">
                NDMA Bhawan, A-1, Safdarjung Enclave, New Delhi - 110029
              </p>
            </div>
          </div>
        </div>

        {/* Column 4: Official Government Portals */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 border-b border-slate-700 pb-1.5">
            Official Portals
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="https://ndma.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-amber-400 transition">
                <span>National Disaster Management Authority</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a href="https://sachet.ndma.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-amber-400 transition">
                <span>SACHET Early Warning Portal</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a href="https://nidm.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-amber-400 transition">
                <span>National Institute of Disaster Management</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a href="https://mausam.imd.gov.in" target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 hover:text-amber-400 transition">
                <span>India Meteorological Department (IMD)</span>
                <ExternalLink className="h-3 w-3 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Attribution Strip */}
      <div className="border-t border-slate-800 pt-4 px-4 text-center text-xs text-slate-500">
        <p>
          Built for <strong className="text-amber-400">Smart India Hackathon 2026</strong> — Intelligent Disaster Decision Support System
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Designed in compliance with GIGW & NDMA Disaster Management Framework guidelines.
        </p>
      </div>
    </footer>
  );
}
