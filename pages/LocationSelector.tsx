
import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';

const AutoLocationCard = lazy(() => import('../components/location/AutoLocationCard').then(m => ({ default: m.AutoLocationCard })));
const GlobalFilterCard = lazy(() => import('../components/location/GlobalFilterCard').then(m => ({ default: m.GlobalFilterCard })));

export const LocationSelector: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLocationSelect = (value: string) => {
      localStorage.setItem('feed_location_filter', value);
      navigate('/feed');
  };

  const handleClearFilter = () => {
      localStorage.setItem('feed_location_filter', 'Global');
      navigate('/feed');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-x-hidden">
      <header className="flex items-center p-[16px_32px] bg-[#0c0f14] fixed w-full z-10 border-b border-white/10 top-0 h-[65px]">
        <button onClick={() => navigate('/feed')} className="bg-none border-none text-white text-[22px] cursor-pointer pr-[15px]">
            <i className="fa-solid fa-xmark"></i>
        </button>
        <h1 className="text-[18px] font-semibold text-[#00c2ff]">Explorar por Localização</h1>
      </header>

      <main className="pt-[90px] pb-10 w-full max-w-[500px] mx-auto px-5 flex flex-col gap-6">
        <Suspense fallback={<div className="text-center py-10 opacity-50"><i className="fa-solid fa-circle-notch fa-spin"></i></div>}>
            <AutoLocationCard onSelect={handleLocationSelect} />
            <GlobalFilterCard onClear={handleClearFilter} />
        </Suspense>
      </main>
    </div>
  );
};
