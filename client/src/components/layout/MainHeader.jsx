import React from 'react';
import { Award } from 'lucide-react';
import logoIcon from '../../assets/logo-icon.svg';
import logoFull from '../../assets/logo.svg';

export default function MainHeader() {
  return (
    <div className="bg-white border-b border-slate-200 py-3 px-4 md:px-8 flex items-center justify-between shadow-xs select-none">
      {/* Left: Brand Identity & Vector Logo Stack */}
      <div className="flex items-center space-x-3.5">
        <a href="#hero" className="flex items-center space-x-3.5 group">
          {/* Production SVG Icon Emblem (44px height) */}
          <img
            src={logoIcon}
            alt="BhuDan Logo Emblem"
            className="h-11 w-11 shrink-0 drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0B2447] font-heading">
                BHUDAN
              </span>
              <span className="bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                LIVE PORTAL
              </span>
            </div>
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
              Intelligent Red-Zone &amp; Relocation Decision Support
            </p>
          </div>
        </a>
      </div>

      {/* Right: Official SIH 2026 Recognition Tag */}
      <div className="hidden sm:flex items-center space-x-2 bg-[#FEF3C7] border border-[#FCD34D] px-3.5 py-1.5 rounded-full shadow-2xs">
        <Award className="h-4 w-4 text-[#D97706]" />
        <span className="text-xs font-bold text-[#92400E]">
          Smart India Hackathon 2026
        </span>
      </div>
    </div>
  );
}
