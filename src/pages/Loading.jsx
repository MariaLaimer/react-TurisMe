import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function App() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const phrases = [
    "Compartilhe suas visitas no Diar.me!",
    "Você sabia? A frança é o país mais visitado do mundo.",
    "Compartilhe seu roteiro de viagem com um amigo ou familiar."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        setIsFading(false);
      }, 500); 

    }, 3500); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 font-sans">
      <div 
        className="relative w-full max-w-[440px] h-[956px] max-h-[100vh] overflow-hidden flex flex-col items-center justify-between py-20 shadow-2xl"
        style={{
          background: 'linear-gradient(175deg, #0B293C 0%, #A4D9D9 100%)'
        }}
      >
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative w-[264px] h-[264px] flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 animate-spin-slow">
              <circle
                cx="132"
                cy="132"
                r="100"
                stroke="#000000"
                strokeWidth="40"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="132"
                cy="132"
                r="100"
                stroke="#92ED69"
                strokeWidth="40"
                fill="transparent"
                strokeDasharray="628" 
                strokeDashoffset="450" 
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            </svg>
          </div>
        </div>

        <div className="mb-20">
          <div 
            className="relative bg-[#D9D9D9] rounded-[30px] flex flex-col items-center justify-center p-8 shadow-lg"
            style={{ width: '276px', height: '217px' }}
          >
            <p 
              className={`text-black font-bold text-xl text-center leading-tight transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
            >
              {phrases[currentPhraseIndex]}
            </p>

            <div className="absolute bottom-6 right-6">
              <Send size={32} color="black" strokeWidth={2} className="transform -rotate-12" />
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
}