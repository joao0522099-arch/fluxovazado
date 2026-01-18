
import React, { useState } from 'react';

interface ModerationSectionProps {
    isAdmin: boolean;
    onlyAdminsPost: boolean;
    setOnlyAdminsPost: (val: boolean) => void;
    msgSlowMode: boolean;
    setMsgSlowMode: (val: boolean) => void;
    msgSlowModeInterval: string;
    setMsgSlowModeInterval: (val: string) => void;
    memberLimit: number | '';
    setMemberLimit: (val: number | '') => void;
    forbiddenWords: string[];
    setForbiddenWords: (val: string[]) => void;
}

export const ModerationSection: React.FC<ModerationSectionProps> = ({
    isAdmin, onlyAdminsPost, setOnlyAdminsPost, msgSlowMode, setMsgSlowMode,
    msgSlowModeInterval, setMsgSlowModeInterval, memberLimit, setMemberLimit,
    forbiddenWords, setForbiddenWords
}) => {
    const [newWord, setNewWord] = useState('');

    if (!isAdmin) return <div className="section-body"><p className="text-gray-400 text-sm">Acesso restrito a administradores.</p></div>;

    return (
        <div className="section-body">
            <div className="toggle-row">
                <div className="toggle-info">
                    <h4 className="font-semibold text-white">Apenas Admins Postam</h4>
                    <p className="text-xs text-gray-400">Membros não podem enviar mensagens</p>
                </div>
                <label className="switch">
                    <input type="checkbox" checked={onlyAdminsPost} onChange={() => setOnlyAdminsPost(!onlyAdminsPost)} />
                    <span className="slider-switch"></span>
                </label>
            </div>
            <div className="toggle-row">
                <div className="toggle-info">
                    <h4 className="font-semibold text-white">Modo Lento</h4>
                    <p className="text-xs text-gray-400">Intervalo entre mensagens (segundos)</p>
                </div>
                <label className="switch">
                    <input type="checkbox" checked={msgSlowMode} onChange={() => setMsgSlowMode(!msgSlowMode)} />
                    <span className="slider-switch"></span>
                </label>
            </div>
            {msgSlowMode && (
                <input type="number" className="input-field mb-3" placeholder="Ex: 30" value={msgSlowModeInterval} onChange={e => setMsgSlowModeInterval(e.target.value)} />
            )}
            <div className="input-group">
                <label>Limite de Membros</label>
                <input type="number" className="input-field" placeholder="Ilimitado" value={memberLimit} onChange={e => setMemberLimit(e.target.value ? parseInt(e.target.value) : '')} />
            </div>
            <div className="input-group">
                <label>Filtro de Palavras</label>
                <div className="flex gap-2">
                    <input type="text" className="input-field" placeholder="Nova palavra..." value={newWord} onChange={e => setNewWord(e.target.value)} />
                    <button onClick={() => { if(newWord.trim()){ setForbiddenWords([...forbiddenWords, newWord.trim().toLowerCase()]); setNewWord(''); } }} className="bg-[#00c2ff] text-black px-4 rounded-lg font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {forbiddenWords.map(w => (
                        <span key={w} className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs flex items-center gap-2">
                            {w} <i className="fa-solid fa-xmark cursor-pointer" onClick={() => setForbiddenWords(forbiddenWords.filter(x => x !== w))}></i>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
