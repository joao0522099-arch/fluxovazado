
import React, { useState } from 'react';

interface DetectedLocation {
    city: string;
    region: string;
    country_name: string;
    ip: string;
}

interface AutoLocationCardProps {
    onSelect: (value: string) => void;
}

export const AutoLocationCard: React.FC<AutoLocationCardProps> = ({ onSelect }) => {
    const [isLoadingIP, setIsLoadingIP] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const detectLocation = async () => {
        setIsLoadingIP(true);
        setErrorMsg('');
        setDetectedLocation(null);

        try {
            let data;
            // 1. Tenta API Principal (ipapi.co)
            try {
                const response = await fetch('https://ipapi.co/json/');
                if (!response.ok) throw new Error('Network response was not ok');
                data = await response.json();
                if (data.error) throw new Error('API Error');
            } catch (e) {
                console.warn("ipapi.co falhou ou bloqueado, tentando fallback ipwho.is...");
                // 2. Tenta API Fallback (ipwho.is)
                const response = await fetch('https://ipwho.is/');
                if (!response.ok) throw new Error('Backup API failed');
                const fallbackData = await response.json();
                if (!fallbackData.success) throw new Error('GeoIP lookup failed');
                data = {
                    city: fallbackData.city,
                    region: fallbackData.region,
                    country_name: fallbackData.country,
                    ip: fallbackData.ip
                };
            }

            if (!data || !data.country_name) throw new Error("Dados incompletos.");

            setDetectedLocation({
                city: data.city,
                region: data.region, 
                country_name: data.country_name,
                ip: data.ip
            });
        } catch (error) {
            console.error("Erro na detecção:", error);
            setErrorMsg("Não foi possível detectar sua localização automaticamente.");
        } finally {
            setIsLoadingIP(false);
        }
    };

    const selectDetectedLevel = (level: 'city' | 'region' | 'country') => {
        if (!detectedLocation) return;
        let filterValue = '';
        switch (level) {
            case 'city': filterValue = detectedLocation.city; break;
            case 'region': filterValue = detectedLocation.region; break;
            case 'country': filterValue = detectedLocation.country_name; break;
        }
        onSelect(filterValue);
    };

    return (
        <div className="location-card bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl animate-fade-in">
            <div>
                <h2 className="text-base text-white font-semibold flex items-center">
                    <i className="fa-solid fa-satellite-dish text-[#00c2ff] mr-2"></i> 
                    Detecção Automática
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Identifique seu IP e escolha o nível de alcance que deseja ver.
                </p>
            </div>
            
            {!detectedLocation ? (
                <>
                    <button 
                        className="bg-[#00c2ff1a] border border-[#00c2ff] text-[#00c2ff] p-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        onClick={detectLocation} 
                        disabled={isLoadingIP}
                    >
                        {isLoadingIP ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-location-crosshairs"></i>}
                        {isLoadingIP ? 'Detectando...' : 'Detectar Minha Localização'}
                    </button>
                    {errorMsg && <p className="text-red-400 text-xs mt-2 text-center font-medium">{errorMsg}</p>}
                </>
            ) : (
                <div className="flex flex-col gap-2.5 mt-2 animate-fade-in">
                    <p className="text-xs text-[#00ff82] text-center mb-1 font-bold">
                        <i className="fa-solid fa-check-circle"></i> Localização Identificada!
                    </p>
                    
                    <button className="flex items-center justify-between p-4 bg-[#1a1e26] border border-white/10 rounded-xl hover:border-[#00c2ff] transition-all" onClick={() => selectDetectedLevel('city')}>
                        <div className="text-left">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Município</div>
                            <div className="text-sm font-bold text-white">Ver só {detectedLocation.city}</div>
                        </div>
                        <i className="fa-solid fa-city text-[#00c2ff]"></i>
                    </button>

                    <button className="flex items-center justify-between p-4 bg-[#1a1e26] border border-white/10 rounded-xl hover:border-[#00c2ff] transition-all" onClick={() => selectDetectedLevel('region')}>
                        <div className="text-left">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Estado / Região</div>
                            <div className="text-sm font-bold text-white">Ver todo {detectedLocation.region}</div>
                        </div>
                        <i className="fa-solid fa-map text-[#00c2ff]"></i>
                    </button>

                    <button className="flex items-center justify-between p-4 bg-[#1a1e26] border border-white/10 rounded-xl hover:border-[#00c2ff] transition-all" onClick={() => selectDetectedLevel('country')}>
                        <div className="text-left">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">País</div>
                            <div className="text-sm font-bold text-white">Ver {detectedLocation.country_name} inteiro</div>
                        </div>
                        <i className="fa-solid fa-globe text-[#00c2ff]"></i>
                    </button>

                    <button 
                        onClick={() => setDetectedLocation(null)} 
                        className="bg-transparent border-none text-gray-500 text-[10px] mt-2 cursor-pointer font-bold uppercase tracking-widest hover:text-white transition-colors"
                    >
                        Detectar novamente
                    </button>
                </div>
            )}
        </div>
    );
};
