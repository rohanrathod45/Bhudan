import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AccessibilityBar from './AccessibilityBar';
import MainHeader from './MainHeader';
import TopNavbar from './TopNavbar';
import Footer from './Footer';

export default function Layout() {
  const [fontScale, setFontScale] = useState('md'); // 'sm' | 'md' | 'lg'
  const [highContrast, setHighContrast] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll-spy using IntersectionObserver
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sectionIds = ['hero', 'dashboard', 'red-zones', 'safe-sites', 'capacity', 'relocation', 'reports', 'admin'];
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '-15% 0px -60% 0px',
        threshold: 0.1,
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => sections.forEach((s) => observer.unobserve(s));
  }, [location.pathname]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const fontScaleClass =
    fontScale === 'sm' ? 'font-scale-sm' : fontScale === 'lg' ? 'font-scale-lg' : 'font-scale-md';

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex flex-col font-sans ${fontScaleClass} ${highContrast ? 'high-contrast' : ''}`}>
      {/* Top Accessibility Strip */}
      <AccessibilityBar
        fontScale={fontScale}
        setFontScale={setFontScale}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />

      {/* Main Header Branding Band */}
      <MainHeader />

      {/* Top Sticky Navigation Bar */}
      <TopNavbar activeSection={activeSection} scrollToSection={scrollToSection} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full">
        <Outlet context={{ scrollToSection }} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}