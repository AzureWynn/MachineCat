'use client';

import { useState, useEffect } from 'react';

export default function CatAnimation() {
  const [bounce, setBounce] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* 机器猫身体 */}
      <div
        className={`
          absolute inset-0 transition-transform duration-500
          ${bounce ? 'translate-y-0' : '-translate-y-4'}
        `}
      >
        {/* 头部 */}
        <div className="relative w-32 h-28 bg-blue-400 rounded-full mx-auto border-4 border-gray-800">
          {/* 眼睛 */}
          <div className="absolute top-8 left-6 w-6 h-8 bg-white rounded-full border-2 border-gray-800">
            <div className="absolute top-2 left-2 w-3 h-4 bg-black rounded-full" />
          </div>
          <div className="absolute top-8 right-6 w-6 h-8 bg-white rounded-full border-2 border-gray-800">
            <div className="absolute top-2 left-2 w-3 h-4 bg-black rounded-full" />
          </div>
          
          {/* 鼻子 */}
          <div className="absolute top-14 left-1/2 -translate-x-1/2 w-4 h-3 bg-red-500 rounded-full" />
          
          {/* 嘴巴 */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-12 h-4 border-b-2 border-gray-800 rounded-b-full" />
          
          {/* 胡须 */}
          <div className="absolute top-12 -left-4 w-6 h-0.5 bg-gray-800 rotate-12" />
          <div className="absolute top-14 -left-4 w-6 h-0.5 bg-gray-800" />
          <div className="absolute top-16 -left-4 w-6 h-0.5 bg-gray-800 -rotate-12" />
          
          <div className="absolute top-12 -right-4 w-6 h-0.5 bg-gray-800 -rotate-12" />
          <div className="absolute top-14 -right-4 w-6 h-0.5 bg-gray-800" />
          <div className="absolute top-16 -right-4 w-6 h-0.5 bg-gray-800 rotate-12" />
        </div>
        
        {/* 耳朵 */}
        <div className="absolute -top-4 left-4 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-blue-400" />
        <div className="absolute -top-4 right-4 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-blue-400" />
        
        {/* 铃铛 */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-gray-800 flex items-center justify-center">
          <div className="w-1 h-1 bg-gray-800 rounded-full" />
        </div>
      </div>
      
      {/* 发光效果 */}
      <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
    </div>
  );
}
