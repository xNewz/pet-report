import React from "react";

export const CuteDogIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 13.5v.5" />
    <path d="M15 13.5v.5" />
    <path d="M11.5 16h1" />
    <path d="M17 10c1.5 0 3 1.5 3 3.5 0 2.5-1.5 3.5-3 3.5a5 5 0 0 1-10 0c-1.5 0-3-1-3-3.5 0-2 1.5-3.5 3-3.5 1-3 3-4 5-4s4 1 5 4z" />
  </svg>
);

export const CuteCatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 13.5v.5" />
    <path d="M15 13.5v.5" />
    <path d="M11.5 16h1" />
    <path d="M6 7l-2-3 3.5 1.5A8.5 8.5 0 0 1 12 5a8.5 8.5 0 0 1 4.5 1.5L20 4l-2 3c1 1.5 2 3.5 2 6 0 4.5-3.5 8-8 8s-8-3.5-8-8c0-2.5 1-4.5 2-6z" />
  </svg>
);

export const CutePawIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="20" cy="16" r="2" />
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
  </svg>
);

export const getAnimalSvgString = (animalType: string) => {
  if (animalType === "dog") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 13.5v.5" /><path d="M15 13.5v.5" /><path d="M11.5 16h1" /><path d="M17 10c1.5 0 3 1.5 3 3.5 0 2.5-1.5 3.5-3 3.5a5 5 0 0 1-10 0c-1.5 0-3-1-3-3.5 0-2 1.5-3.5 3-3.5 1-3 3-4 5-4s4 1 5 4z" /></svg>`;
  } else if (animalType === "cat") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 13.5v.5" /><path d="M15 13.5v.5" /><path d="M11.5 16h1" /><path d="M6 7l-2-3 3.5 1.5A8.5 8.5 0 0 1 12 5a8.5 8.5 0 0 1 4.5 1.5L20 4l-2 3c1 1.5 2 3.5 2 6 0 4.5-3.5 8-8 8s-8-3.5-8-8c0-2.5 1-4.5 2-6z" /></svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" /></svg>`;
};
