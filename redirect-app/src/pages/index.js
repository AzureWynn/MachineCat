'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    fetch('/latest-url.txt')
      .then(res => res.text())
      .then(url => {
        setTargetUrl(url.trim());
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 4000);
    return () => clearInterval(glitchInterval);
  }, []);

  const handleRedirect = () => {
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const gridOffsetX = typeof window !== 'undefined' ? (mousePos.x / window.innerWidth - 0.5) * 30 : 0;
  const gridOffsetY = typeof window !== 'undefined' ? (mousePos.y / window.innerHeight - 0.5) * 30 : 0;

  return (
    <div className="cyber-page">
      {/* 网格背景 */}
      <div 
        className="cyber-grid"
        style={{
          transform: `perspective(800px) rotateX(60deg) translateY(${gridOffsetY}px) translateX(${gridOffsetX}px)`,
        }}
      />

      {/* 鼠标光晕 */}
      <div
        className="mouse-glow"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
        }}
      />

      {/* 扫描线 */}
      <div className="scanlines" />

      {/* 故障覆盖层 */}
      {glitchActive && <div className="glitch-overlay" />}

      {/* 四边霓虹线 */}
      <div className="neon-border neon-border-top" />
      <div className="neon-border neon-border-bottom" />
      <div className="neon-border neon-border-left" />
      <div className="neon-border neon-border-right" />

      {/* 角落装饰 */}
      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />

      {/* 主内容 */}
      <div className="content-wrapper">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-glow" />
          <img src="/logo.jpg" alt="MachineCat" className="logo-img" />
        </div>

        {/* 标题 */}
        <div className="title-container">
          <h1 className={`main-title ${glitchActive ? 'glitching' : ''}`}>
            MACHINECAT
          </h1>
          {glitchActive && (
            <>
              <h1 className="glitch-layer glitch-cyan">MACHINECAT</h1>
              <h1 className="glitch-layer glitch-purple">MACHINECAT</h1>
            </>
          )}
        </div>

        <p className="subtitle">Cross-Chain Privacy Payment Smart Robot Cat Platform</p>
        <p className="tagline">&lt;Giving each physical robot cat a unique "soul" /&gt;</p>

        {/* Bar 装饰 */}
        <div className="bar-container">
          <img src="/bar.png" alt="" className="bar-img" />
        </div>

        {/* 技术标签 */}
        <div className="tech-tags">
          <div className="tech-tag tag-cyan">
            <span className="tag-symbol">⛓</span>
            <span className="tag-text">SOLANA</span>
          </div>
          <div className="tech-tag tag-purple">
            <span className="tag-symbol"></span>
            <span className="tag-text">LI.FI</span>
          </div>
          <div className="tech-tag tag-green">
            <span className="tag-symbol"></span>
            <span className="tag-text">MAGICBLOCK</span>
          </div>
          <div className="tech-tag tag-yellow">
            <span className="tag-symbol">🤖</span>
            <span className="tag-text">X402</span>
          </div>
        </div>

        {/* CTA 按钮 */}
        <button
          onClick={handleRedirect}
          disabled={isLoading || !targetUrl}
          className={`cyber-button ${isLoading || !targetUrl ? 'disabled' : ''}`}
        >
          <span className="button-content">
            <span className="button-icon">🚀</span>
            <span className="button-text">
              {isLoading ? 'INITIALIZING...' : !targetUrl ? 'SYSTEM OFFLINE' : 'ENTER DEMO'}
            </span>
          </span>
          <span className="button-shine" />
        </button>

        {/* 状态指示 */}
        {!isLoading && targetUrl && (
          <div className="status-indicator">
            <span className="status-dot" />
            <span className="status-text">SYSTEM ONLINE</span>
          </div>
        )}

        {/* 底部 */}
        <div className="footer">
          <p>POWERED BY SOLANA + LI.FI + MAGICBLOCK + X402</p>
          <p className="footer-copy">© 2026 MACHINECAT PROTOCOL</p>
        </div>
      </div>

      <style jsx>{`
        .cyber-page {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Courier New', monospace;
        }

        .cyber-grid {
          position: absolute;
          inset: -50%;
          background-image: 
            linear-gradient(rgba(0, 255, 255, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.15) 1px, transparent 1px);
          background-size: 60px 60px;
          transform-origin: center center;
          opacity: 0.4;
          pointer-events: none;
        }

        .mouse-glow {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.12) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          transition: left 0.15s ease-out, top 0.15s ease-out;
          z-index: 1;
        }

        .scanlines {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 2;
        }

        .scanlines::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, transparent, rgba(0, 255, 255, 0.4), transparent);
          animation: scanline 5s linear infinite;
        }

        @keyframes scanline {
          0% { top: -3px; }
          100% { top: 100%; }
        }

        .glitch-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 3;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.04) 2px,
            rgba(0, 255, 255, 0.04) 4px
          );
          animation: glitch-flicker 0.15s steps(3) infinite;
        }

        @keyframes glitch-flicker {
          0% { opacity: 1; transform: translate(0); }
          25% { opacity: 0.8; transform: translate(-2px, 1px); }
          50% { opacity: 1; transform: translate(1px, -1px); }
          75% { opacity: 0.9; transform: translate(-1px, 2px); }
          100% { opacity: 1; transform: translate(0); }
        }

        .neon-border {
          position: absolute;
          z-index: 4;
        }

        .neon-border-top {
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ffff, transparent);
          animation: pulse-h 2s ease-in-out infinite;
        }

        .neon-border-bottom {
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #a855f7, transparent);
          animation: pulse-h 2s ease-in-out infinite 1s;
        }

        .neon-border-left {
          top: 0;
          left: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, #00ffff, transparent);
          animation: pulse-v 2s ease-in-out infinite;
        }

        .neon-border-right {
          top: 0;
          right: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, #a855f7, transparent);
          animation: pulse-v 2s ease-in-out infinite 1s;
        }

        @keyframes pulse-h {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        @keyframes pulse-v {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .corner {
          position: absolute;
          width: 40px;
          height: 40px;
          z-index: 5;
        }

        .corner-tl {
          top: 20px;
          left: 20px;
          border-top: 2px solid #00ffff;
          border-left: 2px solid #00ffff;
        }

        .corner-tr {
          top: 20px;
          right: 20px;
          border-top: 2px solid #a855f7;
          border-right: 2px solid #a855f7;
        }

        .corner-bl {
          bottom: 20px;
          left: 20px;
          border-bottom: 2px solid #a855f7;
          border-left: 2px solid #a855f7;
        }

        .corner-br {
          bottom: 20px;
          right: 20px;
          border-bottom: 2px solid #00ffff;
          border-right: 2px solid #00ffff;
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 40px 20px;
          max-width: 800px;
        }

        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: 30px;
        }

        .logo-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 255, 255, 0.3) 0%, transparent 70%);
          animation: logo-pulse 3s ease-in-out infinite;
        }

        @keyframes logo-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .logo-img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          border-radius: 50%;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))
                  drop-shadow(0 0 30px rgba(0, 255, 255, 0.3));
        }

        .title-container {
          position: relative;
          margin-bottom: 15px;
        }

        .main-title {
          font-size: clamp(48px, 10vw, 96px);
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 8px;
          text-shadow: 
            0 0 10px rgba(0, 255, 255, 0.8),
            0 0 30px rgba(0, 255, 255, 0.4),
            0 0 60px rgba(0, 255, 255, 0.2);
          margin: 0;
          transition: all 0.1s;
        }

        .main-title.glitching {
          animation: title-glitch 0.15s steps(2) infinite;
        }

        @keyframes title-glitch {
          0% { transform: translate(0); }
          25% { transform: translate(-4px, 2px); }
          50% { transform: translate(3px, -3px); }
          75% { transform: translate(-2px, 1px); }
          100% { transform: translate(0); }
        }

        .glitch-layer {
          position: absolute;
          inset: 0;
          font-size: clamp(48px, 10vw, 96px);
          font-weight: 900;
          letter-spacing: 8px;
          margin: 0;
        }

        .glitch-cyan {
          color: #00ffff;
          clip-path: inset(20% 0 40% 0);
          animation: glitch-clip-a 0.15s steps(2) infinite;
        }

        .glitch-purple {
          color: #a855f7;
          clip-path: inset(60% 0 10% 0);
          animation: glitch-clip-b 0.15s steps(2) infinite;
        }

        @keyframes glitch-clip-a {
          0% { clip-path: inset(20% 0 40% 0); }
          50% { clip-path: inset(50% 0 20% 0); }
          100% { clip-path: inset(20% 0 40% 0); }
        }

        @keyframes glitch-clip-b {
          0% { clip-path: inset(60% 0 10% 0); }
          50% { clip-path: inset(30% 0 40% 0); }
          100% { clip-path: inset(60% 0 10% 0); }
        }

        .subtitle {
          font-size: clamp(16px, 3vw, 24px);
          color: #00ffff;
          margin: 0 0 8px 0;
          letter-spacing: 4px;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }

        .tagline {
          font-size: 14px;
          color: #666;
          margin: 0 0 25px 0;
        }

        .bar-container {
          margin-bottom: 30px;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid rgba(0, 255, 255, 0.2);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .bar-img {
          width: 100%;
          max-width: 700px;
          height: auto;
          display: block;
          opacity: 0.9;
        }

        .tech-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
          margin-bottom: 40px;
        }

        .tech-tag {
          padding: 10px 20px;
          font-size: 12px;
          letter-spacing: 3px;
          font-weight: bold;
          position: relative;
          clip-path: polygon(12px 0, 100% 0, calc(100% - 12px) 100%, 0 100%);
          transition: all 0.3s ease;
          cursor: default;
        }

        .tech-tag:hover {
          transform: translateY(-3px);
          filter: brightness(1.4);
        }

        .tag-cyan {
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.6);
          color: #00ffff;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .tag-purple {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.6);
          color: #a855f7;
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.2), inset 0 0 15px rgba(168, 85, 247, 0.1);
        }

        .tag-green {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.6);
          color: #22c55e;
          box-shadow: 0 0 15px rgba(34, 197, 94, 0.2), inset 0 0 15px rgba(34, 197, 94, 0.1);
        }

        .tag-yellow {
          background: rgba(234, 179, 8, 0.1);
          border: 1px solid rgba(234, 179, 8, 0.6);
          color: #eab308;
          box-shadow: 0 0 15px rgba(234, 179, 8, 0.2), inset 0 0 15px rgba(234, 179, 8, 0.1);
        }

        .tag-symbol {
          margin-right: 8px;
        }

        .cyber-button {
          position: relative;
          display: inline-block;
          padding: 18px 60px;
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #00ffff;
          background: transparent;
          border: 2px solid #00ffff;
          cursor: pointer;
          overflow: hidden;
          clip-path: polygon(
            0 0,
            calc(100% - 25px) 0,
            100% 25px,
            100% 100%,
            25px 100%,
            0 calc(100% - 25px)
          );
          transition: all 0.3s ease;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.6);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.3),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }

        .cyber-button:hover:not(.disabled) {
          background: rgba(0, 255, 255, 0.1);
          box-shadow: 
            0 0 40px rgba(0, 255, 255, 0.5),
            inset 0 0 40px rgba(0, 255, 255, 0.2);
          transform: scale(1.05);
        }

        .cyber-button.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .button-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .button-icon {
          font-size: 24px;
        }

        .button-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 255, 0.15),
            transparent
          );
          transition: left 0.6s ease;
        }

        .cyber-button:hover:not(.disabled) .button-shine {
          left: 100%;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 25px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: status-pulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
        }

        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .status-text {
          font-size: 12px;
          color: #22c55e;
          letter-spacing: 2px;
        }

        .footer {
          margin-top: 60px;
          font-size: 11px;
          color: #444;
          letter-spacing: 2px;
        }

        .footer-copy {
          margin-top: 5px;
          color: #333;
        }
      `}</style>
    </div>
  );
}
