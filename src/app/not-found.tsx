"use client";
import React, { useState, useEffect } from 'react';
import { Home, Search, ArrowLeft, Zap, MapPin, Compass } from 'lucide-react';

const Modern404Page = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);

  // Initialize floating elements
  useEffect(() => {
    const elements = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 15,
      delay: Math.random() * 3,
      duration: Math.random() * 4 + 5,
    }));
    setFloatingElements(elements);
    
    setTimeout(() => setIsVisible(true), 200);
  }, []);

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const glitchTexts = ['404', '4Ø4', '4*4', '4◊4', '404'];
  const [glitchIndex, setGlitchIndex] = useState(0);

  // Enhanced glitch effect
  useEffect(() => {
    const createGlitch = () => {
      const interval = setInterval(() => {
        setGlitchIndex((prev) => (prev + 1) % glitchTexts.length);
      }, 120);

      setTimeout(() => {
        clearInterval(interval);
        setGlitchIndex(0);
      }, 800);
    };

    createGlitch();
    const mainInterval = setInterval(createGlitch, 5000);

    return () => clearInterval(mainInterval);
  }, []);

  return (
    <div className="container">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #1e0546 0%, #2a0a5c 25%, #3d1570 50%, #8e43ff 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 20%, rgba(142, 67, 255, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(142, 67, 255, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 40% 90%, rgba(30, 5, 70, 0.8) 0%, transparent 50%);
          animation: backgroundPulse 8s ease-in-out infinite;
        }

        .floating-element {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(142, 67, 255, 0.15), rgba(142, 67, 255, 0.05));
          backdrop-filter: blur(1px);
          animation: float var(--duration, 6s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
          opacity: 0.6;
          pointer-events: none;
        }

        .floating-element::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(45deg, #8e43ff, transparent);
          animation: rotate 8s linear infinite;
          opacity: 0.3;
        }

        .grid-background {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(142, 67, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(142, 67, 255, 0.1) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridMove 25s linear infinite;
          opacity: 0.3;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 800px;
          text-align: center;
        }

        .main-content {
          transform: translateY(3rem);
          opacity: 0;
          transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-content.visible {
          transform: translateY(0);
          opacity: 1;
        }

        .error-number {
          position: relative;
          margin-bottom: 3rem;
          user-select: none;
        }

        .glitch-text {
          font-size: clamp(6rem, 20vw, 16rem);
          font-weight: 900;
          background: linear-gradient(45deg, #8e43ff, #ffffff, #8e43ff, #c084fc);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
          animation: gradientFlow 4s ease-in-out infinite;
          text-shadow: 0 0 50px rgba(142, 67, 255, 0.5);
          letter-spacing: -0.1em;
        }

        .glitch-shadow {
          position: absolute;
          top: 0;
          left: 0;
          font-size: clamp(6rem, 20vw, 16rem);
          font-weight: 900;
          opacity: 0.15;
          pointer-events: none;
          letter-spacing: -0.1em;
        }

        .glitch-shadow:nth-child(2) {
          color: #ff4444;
          animation: glitchRed 0.3s ease-in-out infinite;
        }

        .glitch-shadow:nth-child(3) {
          color: #44ffff;
          animation: glitchBlue 0.3s ease-in-out infinite;
        }

        .icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .icon-wrapper {
          position: relative;
          animation: levitate 3s ease-in-out infinite;
        }

        .icon-background {
          width: 7rem;
          height: 7rem;
          background: linear-gradient(135deg, rgba(142, 67, 255, 0.2), rgba(255, 255, 255, 0.1));
          border: 2px solid rgba(142, 67, 255, 0.3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          box-shadow: 
            0 25px 50px -12px rgba(142, 67, 255, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }

        .icon-background::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(from 0deg, transparent, rgba(142, 67, 255, 0.4), transparent);
          animation: spin 3s linear infinite;
        }

        .compass-icon {
          width: 3.5rem;
          height: 3.5rem;
          color: #ffffff;
          z-index: 1;
          position: relative;
          filter: drop-shadow(0 0 10px rgba(142, 67, 255, 0.5));
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: #8e43ff;
          animation: particleFloat 2s ease-in-out infinite;
          box-shadow: 0 0 20px rgba(142, 67, 255, 0.6);
        }

        .particle:nth-child(3) { 
          top: -0.75rem; right: -0.75rem; 
          width: 1.2rem; height: 1.2rem; 
        }

        .particle:nth-child(4) { 
          bottom: -0.5rem; left: -0.5rem; 
          width: 0.8rem; height: 0.8rem; 
          animation-delay: 0.7s; 
        }

        .particle:nth-child(5) { 
          top: 50%; left: -2rem; 
          width: 0.6rem; height: 0.6rem; 
          animation-delay: 1.4s; 
        }

        .message-section {
          margin-bottom: 4rem;
        }

        .title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 1.5rem 0;
          text-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          line-height: 1.1;
        }

        .subtitle {
          font-size: clamp(1.2rem, 3vw, 1.4rem);
          color: rgba(255, 255, 255, 0.8);
          max-width: 32rem;
          margin: 0 auto;
          line-height: 1.6;
          font-weight: 400;
        }

        .emoji-text {
          display: block;
          margin-top: 1rem;
          color: #8e43ff;
          font-weight: 600;
          font-size: 1.1em;
          text-shadow: 0 0 20px rgba(142, 67, 255, 0.4);
        }

        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          margin-bottom: 5rem;
        }

        .btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.2rem 2.5rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 1.1rem;
          border: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          text-decoration: none;
          backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 2rem;
          padding: 2px;
          background: linear-gradient(135deg, rgba(142, 67, 255, 0.8), rgba(255, 255, 255, 0.1));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          transition: all 0.4s ease;
        }

        .btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 20px 40px rgba(142, 67, 255, 0.3);
        }

        .btn:hover::before {
          background: linear-gradient(135deg, #8e43ff, #ffffff);
        }

        .btn-primary {
          background: linear-gradient(135deg, #8e43ff, #c084fc);
          color: #ffffff;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #7c3aed, #8e43ff);
          box-shadow: 0 20px 40px rgba(142, 67, 255, 0.4);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border: 1px solid rgba(142, 67, 255, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(142, 67, 255, 0.2);
          border-color: rgba(142, 67, 255, 0.6);
        }

        .btn-icon {
          width: 1.3rem;
          height: 1.3rem;
          transition: all 0.3s ease;
        }

        .btn:hover .btn-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .fun-fact {
          max-width: 32rem;
          margin: 0 auto 3rem auto;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          border: 1px solid rgba(142, 67, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .fun-fact-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .zap-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: #8e43ff;
          animation: spark 2s ease-in-out infinite;
        }

        .fun-fact-title {
          font-weight: 700;
          color: #ffffff;
          font-size: 1.1rem;
        }

        .fun-fact-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
          margin: 0;
          line-height: 1.6;
        }

        .quick-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .quick-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }

        .quick-link:hover {
          color: #ffffff;
          background: rgba(142, 67, 255, 0.2);
          transform: translateY(-1px);
        }

        .link-icon {
          width: 1.1rem;
          height: 1.1rem;
        }

        /* Animations */
        @keyframes backgroundPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(60px, 60px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.3; }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 200% 50%; }
          75% { background-position: 300% 50%; }
        }

        @keyframes glitchRed {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }

        @keyframes glitchBlue {
          0% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
          100% { transform: translate(0); }
        }

        @keyframes levitate {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes particleFloat {
          0%, 100% { transform: scale(1) translateY(0px); opacity: 1; }
          50% { transform: scale(1.5) translateY(-10px); opacity: 0.7; }
        }

        @keyframes spark {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          
          .button-group {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            width: 100%;
            max-width: 300px;
          }
          
          .quick-links {
            flex-direction: column;
            gap: 1rem;
          }
        }

        /* Setting CSS custom properties for floating elements */
        ${floatingElements.map((el, index) => `
          .floating-element:nth-child(${index + 1}) {
            left: ${el.x}%;
            top: ${el.y}%;
            width: ${el.size}px;
            height: ${el.size}px;
            --duration: ${el.duration}s;
            --delay: ${el.delay}s;
          }
        `).join('')}
      `}</style>

      {/* Floating Background Elements */}
      {floatingElements.map((element) => (
        <div key={element.id} className="floating-element" />
      ))}

      {/* Animated Grid Background */}
      <div className="grid-background" />

      {/* Main Content */}
      <div className="content-wrapper">
        <div 
          className={`main-content ${isVisible ? 'visible' : ''}`}
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
          }}
        >
          {/* 404 Number with Enhanced Glitch Effect */}
          <div className="error-number">
            <h1 className="glitch-text">{glitchTexts[glitchIndex]}</h1>
            <div className="glitch-shadow">{glitchTexts[glitchIndex]}</div>
            <div className="glitch-shadow">{glitchTexts[glitchIndex]}</div>
          </div>

          {/* Floating Icon with Enhanced Effects */}
          <div className="icon-container">
            <div className="icon-wrapper">
              <div className="icon-background">
                <Compass className="compass-icon" />
              </div>
              <div className="particle" />
              <div className="particle" />
              <div className="particle" />
            </div>
          </div>

          {/* Main Message */}
          <div className="message-section">
            <h2 className="title">Oops! Page Not Found</h2>
            <p className="subtitle">
              Looks like this page got lost in the digital universe!
              <span className="emoji-text">🚀 Let's navigate you back to safety</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <a href="/en" className="btn btn-primary">
              <Home className="btn-icon" />
              <span>Go Home</span>
            </a>

  
          </div>

          {/* Enhanced Fun Facts Section */}
          <div className="fun-fact">
            <div className="fun-fact-header">
              <Zap className="zap-icon" />
              <span className="fun-fact-title">Did You Know?</span>
            </div>
            <p className="fun-fact-text">
              The first 404 error was discovered at CERN in 1992. You're now part of internet history! 🌐✨
            </p>
          </div>

          {/* Quick Links */}
          <div className="quick-links">
            <a href="/en/workbench" className="quick-link">
              <MapPin className="link-icon" />
              <span>Sitemap</span>
            </a>
            <a href="/en/help" className="quick-link">Help Center</a>
            <a href="/en/about" className="quick-link">About Us</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modern404Page;