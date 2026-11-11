/**
 * Al-Dheeniyya Arabic College - Main Application Entrypoint
 * Integrates luxury Islamic 3D visualization, astronomical Hijri calendar,
 * and 100% of the college records management logic.
 */

import './luxury-islamic.css';
import { initIslamic3D } from './islamic-3d.js';
import { updateHeaderDate } from './hijri.ts';
import './original_logic.js';

// Initialize 3D Islamic Celestial Star & Particle Scene
window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Login Scene
  try {
    initIslamic3D('canvas3d-login');
  } catch (err) {
    console.warn('Three.js 3D initialization:', err);
  }

  // 2. Initial live date rendering with Hijri calendar
  const orgData = (window as any).db?.org || {};
  updateHeaderDate(orgData.hadj || 0);

  // Hook renderAll to automatically refresh header date with any moon-sighting adjustment
  const origRenderAll = (window as any).renderAll;
  if (typeof origRenderAll === 'function') {
    (window as any).renderAll = function(...args: any[]) {
      const res = origRenderAll.apply(this, args);
      const currentOrg = (window as any).db?.org || {};
      updateHeaderDate(currentOrg.hadj || 0);
      return res;
    };
  }

  // Update date every hour
  setInterval(() => {
    const currentOrg = (window as any).db?.org || {};
    updateHeaderDate(currentOrg.hadj || 0);
  }, 3600000);

  // 3. Subtle 3D Card Hover Tilt Effects for Desktop
  if (window.matchMedia('(min-width: 900px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const addCardTilt = () => {
      document.querySelectorAll<HTMLElement>('.stat, .quick button, .doc').forEach(card => {
        if ((card as any).__tiltAttached) return;
        (card as any).__tiltAttached = true;

        card.addEventListener('mousemove', (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;

          card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    };

    addCardTilt();
    // Re-check for new dynamically added cards
    const observer = new MutationObserver(() => {
      addCardTilt();
    });
    const mainEl = document.querySelector('.main');
    if (mainEl) {
      observer.observe(mainEl, { childList: true, subtree: true });
    }
  }
});
