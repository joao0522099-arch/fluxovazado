
import React, { useState } from 'react';

interface VipMonetizationSectionProps {
    vipPrice: string;
    setVipPrice: (val: string) => void;
    vipCurrency: 'BRL' | 'USD';
    setVipCurrency: (val: 'BRL' | 'USD') => void;
    pixelId: string;
    setPixelId: (val: string) => void;
    pixelToken: string;
    setPixelToken: (val: string) => void;
    vipDoorText: string;
    setVipDoorText: (val: string) => void;
    vipButtonText: string;
    setVipButtonText: (val: string) => void;
    onManualRelease: (username: string) => Promise<boolean>;
    onOpenDoorEditor: () => void;
}

export const VipMonetizationSection: React.FC<VipMonetizationSectionProps> = ({
    vipPrice, setVipPrice, vipCurrency, setVipCurrency,
    pixelId, setPixelId, onManualRelease, onOpenDoorEditor
}) => {
    const [manualUser, setManualUser] = useState('');

    return (
        <div className="section-body">
            <div className="bg-black/20 p-5 rounded-2xl border border-[#FFD700]/10 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="input-group mb-0">
                        <label>Valor de Venda</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-bold text-sm">R$</span>
                            <input type="text" className="input-field pl-12 font-black text-lg text-[#00ff82]" value={vipPrice} onChange={e => {
                                const v = e.target.value.replace(/\D/g, "");
                                const n = parseFloat(v) / 100;
                                setVipPrice(n.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
                            }} />
                        </div>
                    </div>
                    <div className="input-group mb-0">
                        <label>Moeda Base</label>
                        <select className="input-field font-bold" value={vipCurrency} onChange={e => setVipCurrency(e.target.value as any)}>
                            <option value="BRL">BRL (R$)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <button 
                className="w-full py-4 mb-8 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded-xl font-black uppercase text-xs tracking-widest transition-all hover:bg-[#FFD700]/20 flex items-center justify-center gap-3" 
                onClick={onOpenDoorEditor}
            >
                <i className="fa-solid fa-palette"></i> Editar Design da Porta
            </button>

            <div className="space-y-6">
                <div className="input-group">
                    <label>Meta Pixel (Opcional)</label>
                    <input type="text" className="input-field" placeholder="ID do Pixel" value={pixelId} onChange={e => setPixelId(e.target.value)} />
                    <p className="text-[9px] text-white/20 mt-2 tracking-wide">Rastreie PageView e Leads automaticamente.</p>
                </div>

                <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[2px] mb-4">Acesso Administrativo</h4>
                    <div className="flex gap-2">
                        <input type="text" className="input-field" placeholder="Digite @usuario..." value={manualUser} onChange={e => setManualUser(e.target.value)} />
                        <button 
                            onClick={async () => { if(await onManualRelease(manualUser)) setManualUser(''); }} 
                            className="bg-white text-black px-6 rounded-xl font-black uppercase text-[10px] hover:bg-[#00c2ff] hover:text-black transition-all"
                        >
                            Liberar
                        </button>
                    </div>
                    <p className="text-[9px] text-white/20 mt-3 italic">Libera o acesso VIP sem necessidade de pagamento.</p>
                </div>
            </div>
        </div>
    );
};
