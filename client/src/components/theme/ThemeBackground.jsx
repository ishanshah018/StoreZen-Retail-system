import React from 'react';

// Animated Background Components for each theme
export const ChristmasBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>❄️</div>
    <div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>🎄</div>
    <div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>🎅</div>
    <div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>⭐</div>
    <div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🎁</div>
  </div>
);

export const HalloweenBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🎃</div>
    <div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>👻</div>
    <div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>🦇</div>
    <div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>🕷️</div>
    <div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🧙</div>
  </div>
);

export const CyberpunkBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🌟</div>
    <div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>⚡</div>
    <div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>🔮</div>
    <div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>💎</div>
    <div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🌌</div>
  </div>
);

export const DiwaliBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🪔</div>
    <div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>🎆</div>
    <div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>✨</div>
    <div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>🌟</div>
    <div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🎇</div>
  </div>
);

// Main Background Component that renders based on theme
const ThemeBackground = ({ currentTheme }) => {
  switch (currentTheme) {
    case 'christmas':
      return <ChristmasBackground />;
    case 'halloween':
      return <HalloweenBackground />;
    case 'cyberpunk':
      return <CyberpunkBackground />;
    case 'diwali':
      return <DiwaliBackground />;
    default:
      return null;
  }
};

export default ThemeBackground;
