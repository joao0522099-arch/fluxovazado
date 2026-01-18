
import React, { useState, useEffect } from 'react';

type DurationType = 'continuous' | 'date' | 'period';

interface AdDurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentType: DurationType;
    onSave: (config: { type: DurationType, startDate?: number, endDate?: number, periodConfig?: any }) => void;
    initialConfig: { startDate?: number, endDate?: number, periodConfig?: any };
}

export const AdDurationModal: React.FC<AdDurationModalProps> = ({ isOpen, onClose, currentType, onSave, initialConfig }) => {
    const [selectedType, setSelectedType] = useState<DurationType>(currentType);
    
    // Date states
    const [startDate, setStartDate] = useState<string>(initialConfig.startDate ? new Date(initialConfig.startDate).toISOString().split('T')[0] : '');
    const [endDate, setEndDate] = useState<string>(initialConfig.endDate ? new Date(initialConfig.endDate).toISOString().split('T')[0] : '');
    
    // Period states
    const [selectedDays, setSelectedDays] = useState<number[]>(initialConfig.periodConfig?.days || [1, 2, 3, 4, 5]);
    
    // 48 Slots state (30 min intervals)
    const [selectedSlots, setSelectedSlots] = useState<number[]>(() => {
        if (initialConfig.periodConfig?.hours) {
            const slots: number[] = [];
            initialConfig.periodConfig.hours.forEach((h: any) => {
                const [hStart, mStart] = h.start.split(':').map(Number);
                const [hEnd, mEnd] = h.end.split(':').map(Number);
                
                const startIndex = hStart * 2 + (mStart === 30 ? 1 : 0);
                const endIndex = hEnd * 2 + (mEnd === 30 ? 1 : 0);
                
                for (let i = startIndex; i < endIndex; i++) slots.push(i);
            });
            return slots.length > 0 ? slots : [18, 19, 20, 21, 22, 23, 36, 37, 38, 39, 40, 41]; // Default peaks
        }
        return [18, 19, 20, 21, 22, 23, 36, 37, 38, 39, 40, 41]; // Almoço e Noite (30m blocks)
    });

    if (!isOpen) return null;

    // Helper to format index to HH:MM
    const indexToTime = (index: number) => {
        const h = Math.floor(index / 2);
        const m = (index % 2) * 30;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    // Helper to group selected slots into start/end intervals
    const getIntervals = (slots: number[]) => {
        if (slots.length === 0) return [];
        const sorted = [...slots].sort((a, b) => a - b);
        const intervals = [];
        let start = sorted[0];
        
        for (let i = 0; i < sorted.length; i++) {
            if (sorted[i + 1] !== sorted[i] + 1) {
                intervals.push({
                    start: indexToTime(start),
                    end: indexToTime(sorted[i] + 1)
                });
                start = sorted[i + 1];
            }
        }
        return intervals;
    };

    const handleSave = () => {
        const config: any = { type: selectedType };
        
        if (selectedType === 'date') {
            if (!startDate || !endDate) {
                alert("Por favor, selecione as datas de início e fim.");
                return;
            }
            config.startDate = new Date(startDate).getTime();
            config.endDate = new Date(endDate).getTime();
        } else if (selectedType === 'period') {
            if (selectedDays.length === 0) {
                alert("Selecione ao menos um dia da semana.");
                return;
            }
            if (selectedSlots.length === 0) {
                alert("Selecione ao menos um slot de veiculação.");
                return;
            }
            config.periodConfig = {
                days: selectedDays,
                hours: getIntervals(selectedSlots)
            };
        }

        onSave(config);
        onClose();
    };

    const toggleDay = (day: number) => {
        setSelectedDays(prev => 
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const toggleSlot = (slot: number) => {
        setSelectedSlots(prev => 
            prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
        );
    };

    const weekDays = [
        { id: 1, label: 'S' }, { id: 2, label: 'T' }, { id: 3, label: 'Q' }, 
        { id: 4, label: 'Q' }, { id: 5, label: 'S' }, { id: 6, label: 'S' }, { id: 0, label: 'D' }
    ];

    const slotsRange = Array.from({ length: 48 }, (_, i) => i);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <style>{`
                .duration-modal {
                    width: 100%;
                    max-width: 460px;
                    background: #161a21;
                    border: 1px solid rgba(0, 194, 255, 0.2);
                    border-radius: 32px;
                    padding: 28px;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.8);
                    animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    max-height: 95vh;
                    overflow-y: auto;
                }
                .mode-selector {
                    display: flex;
                    gap: 6px;
                    background: #090b0e;
                    padding: 6px;
                    border-radius: 18px;
                    margin-bottom: 24px;
                }
                .mode-btn {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    background: transparent;
                    color: #555;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    border-radius: 14px;
                    cursor: pointer;
                    transition: 0.3s;
                    letter-spacing: 1px;
                }
                .mode-btn.active {
                    background: #00c2ff;
                    color: #000;
                    box-shadow: 0 4px 12px rgba(0, 194, 255, 0.3);
                }
                .day-chip {
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #666;
                    font-weight: 800;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .day-chip.selected {
                    background: #00c2ff15;
                    border-color: #00c2ff;
                    color: #00c2ff;
                }
                .slots-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 6px;
                    margin-top: 12px;
                }
                .slot-btn {
                    padding: 8px 0;
                    border-radius: 10px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #444;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .slot-btn.selected {
                    background: #00c2ff;
                    color: #000;
                    border-color: #00c2ff;
                    box-shadow: 0 0 8px rgba(0, 194, 255, 0.2);
                }
                .hour-marker {
                    grid-column: span 6;
                    font-size: 9px;
                    color: #444;
                    margin-top: 10px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    padding-bottom: 4px;
                    font-weight: 800;
                    text-transform: uppercase;
                }
                .custom-input {
                    background: #0c0f14;
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    padding: 14px;
                    border-radius: 14px;
                    outline: none;
                    width: 100%;
                    font-size: 14px;
                }
                .custom-input:focus { border-color: #00c2ff; }
                
                @keyframes popIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="duration-modal no-scrollbar" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-black text-center mb-6 uppercase tracking-[3px] text-[#00c2ff]">Programação de Pico</h3>

                <div className="mode-selector">
                    <button className={`mode-btn ${selectedType === 'continuous' ? 'active' : ''}`} onClick={() => setSelectedType('continuous')}>Contínua</button>
                    <button className={`mode-btn ${selectedType === 'date' ? 'active' : ''}`} onClick={() => setSelectedType('date')}>Calendário</button>
                    <button className={`mode-btn ${selectedType === 'period' ? 'active' : ''}`} onClick={() => setSelectedType('period')}>Slots (30m)</button>
                </div>

                <div className="config-section min-h-[350px]">
                    {selectedType === 'continuous' && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16 animate-fade-in">
                            <div className="w-20 h-20 bg-[#00c2ff]/10 rounded-full flex items-center justify-center text-[#00c2ff] text-3xl mb-6 border border-[#00c2ff]/20">
                                <i className="fa-solid fa-infinity"></i>
                            </div>
                            <h4 className="text-white text-lg font-bold mb-2">Entrega Fluida</h4>
                            <p className="text-gray-500 text-xs leading-relaxed px-10">Os anúncios serão exibidos sem interrupções diárias.</p>
                        </div>
                    )}

                    {selectedType === 'date' && (
                        <div className="space-y-6 animate-fade-in py-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Data Inicial</label>
                                <input type="date" className="custom-input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ colorScheme: 'dark' }} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Data Final</label>
                                <input type="date" className="custom-input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ colorScheme: 'dark' }} />
                            </div>
                        </div>
                    )}

                    {selectedType === 'period' && (
                        <div className="space-y-6 animate-fade-in py-2">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4 pl-1">Dias de Atividade</label>
                                <div className="flex justify-between">
                                    {weekDays.map(day => (
                                        <div 
                                            key={day.id} 
                                            className={`day-chip ${selectedDays.includes(day.id) ? 'selected' : ''}`}
                                            onClick={() => toggleDay(day.id)}
                                        >
                                            {day.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4 pl-1">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gráfico de Picos (30 em 30 min)</label>
                                    <span className="text-[9px] font-bold text-[#00c2ff] bg-[#00c2ff]/10 px-2 py-0.5 rounded-full">{(selectedSlots.length * 0.5).toFixed(1)}h Totais</span>
                                </div>
                                <div className="slots-grid h-[240px] overflow-y-auto pr-2 no-scrollbar">
                                    {slotsRange.map(s => {
                                        const isNewHour = s % 2 === 0;
                                        return (
                                            <React.Fragment key={s}>
                                                {isNewHour && <div className="hour-marker">Das {Math.floor(s/2)}:00 às {Math.floor(s/2) + 1}:00</div>}
                                                <button 
                                                    className={`slot-btn ${selectedSlots.includes(s) ? 'selected' : ''}`}
                                                    onClick={() => toggleSlot(s)}
                                                >
                                                    {indexToTime(s).split(':')[1] === '00' ? ':00' : ':30'}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-8 pt-4 border-t border-white/5">
                    <button onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold uppercase text-xs hover:text-white transition-colors">Voltar</button>
                    <button 
                        onClick={handleSave}
                        className="flex-[1.5] py-4 bg-[#00c2ff] text-black font-black rounded-2xl uppercase text-sm shadow-[0_8px_20px_rgba(0,194,255,0.2)] active:scale-95 transition-all"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};
