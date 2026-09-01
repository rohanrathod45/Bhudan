import React from 'react';
import { Eye, Globe } from 'lucide-react';
import azadiLogo from '../../assets/azadi-mahotsav.png';
import emblemIndia from '../../assets/emblem-india.png';

export default function AccessibilityBar({
  fontScale,
  setFontScale,
  highContrast,
  setHighContrast,
}) {
  return (
    <div className="bg-[#0B2447] text-white text-xs py-2 px-4 md:px-8 flex items-center justify-between border-b border-[#14356B] select-none z-50 min-h-[50px]">
      {/* Skip to Main Content Link (Visible on Focus) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-3 focus:py-1 focus:bg-[#F59E0B] focus:text-[#0B2447] focus:font-bold focus:rounded"
      >
        Skip to main content
      </a>

      {/* Left: Emblem of India (Image 2) + Government of India & NDMA Title */}
      <div className="flex items-center space-x-3.5 text-[11px] text-slate-200">
        <div className="bg-white p-1 rounded shadow-2xs flex items-center justify-center shrink-0">
          <img
            src={emblemIndia}
            alt="State Emblem of India - Satyamev Jayate"
            className="h-8 w-auto object-contain"
          />
        </div>
        <div>
          <span className="font-extrabold tracking-wide text-white uppercase">GOVERNMENT OF INDIA</span>
          <span className="hidden sm:inline text-slate-400 mx-2">|</span>
          <span className="hidden sm:inline text-slate-300 font-medium">National Disaster Management Authority (NDMA)</span>
        </div>
      </div>

      {/* Right: Azadi Ka Amrit Mahotsav (Image 1) + Text Size (A- A A+) + High Contrast + Language */}
      <div className="flex items-center space-x-4">
        {/* Image 1: Azadi Ka Amrit Mahotsav Logo (Placed to the LEFT of A- A A+) */}
        <div className="bg-white/95 px-2 py-0.5 rounded shadow-2xs hidden xs:flex items-center justify-center shrink-0">
          <img
            src={azadiLogo}
            alt="Azadi Ka Amrit Mahotsav"
            className="h-8 md:h-9 w-auto object-contain"
          />
        </div>

        {/* Font Size Adjuster (A- A A+) */}
        <div className="flex items-center space-x-1 border-l border-r border-slate-700/80 px-3 text-[11px]">
          <span className="text-slate-300 mr-1 hidden sm:inline font-semibold">Text Size:</span>
          <button
            onClick={() => setFontScale('sm')}
            title="Small font size"
            className={`px-1.5 py-0.5 rounded font-extrabold transition cursor-pointer ${
              fontScale === 'sm' ? 'bg-[#F59E0B] text-[#0B2447]' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            A-
          </button>
          <button
            onClick={() => setFontScale('md')}
            title="Default font size"
            className={`px-1.5 py-0.5 rounded font-extrabold transition cursor-pointer ${
              fontScale === 'md' ? 'bg-[#F59E0B] text-[#0B2447]' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            A
          </button>
          <button
            onClick={() => setFontScale('lg')}
            title="Large font size"
            className={`px-1.5 py-0.5 rounded font-extrabold transition cursor-pointer ${
              fontScale === 'lg' ? 'bg-[#F59E0B] text-[#0B2447]' : 'text-slate-200 hover:text-white hover:bg-white/10'
            }`}
          >
            A+
          </button>
        </div>

        {/* High Contrast Toggle */}
        <button
          onClick={() => setHighContrast((prev) => !prev)}
          title="Toggle High Contrast Mode"
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer border ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-300 font-bold'
              : 'text-slate-200 border-slate-700 hover:text-white hover:border-slate-500 bg-white/5'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{highContrast ? 'Standard Mode' : 'High Contrast'}</span>
        </button>

        {/* Language Selector */}
        <div className="relative hidden md:flex items-center space-x-1 text-[11px] text-slate-200">
          <Globe className="h-3.5 w-3.5 text-amber-400" />
          <select
            defaultValue="en"
            aria-label="Select Language"
            className="bg-transparent text-slate-200 border-none outline-none text-[11px] font-medium cursor-pointer pr-1"
          >
            <option value="en" className="bg-[#0B2447] text-white">English</option>
            <option value="hi" className="bg-[#0B2447] text-white">हिंदी (Hindi)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
