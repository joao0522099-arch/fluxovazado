
import React, { useState } from 'react';

interface Member {
    id: string;
    name: string;
    role: string;
    isMe: boolean;
    avatar?: string;
}

interface MembersSectionProps {
    isAdmin: boolean;
    members: Member[];
    onAction: (id: string, action: 'kick' | 'ban' | 'promote' | 'demote') => void;
}

export const MembersSection: React.FC<MembersSectionProps> = ({ isAdmin, members, onAction }) => {
    const [memberSearch, setMemberSearch] = useState('');

    return (
        <div className="section-body">
            <div className="relative mb-6">
                <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs"></i>
                <input 
                    type="text" 
                    className="input-field pl-10" 
                    placeholder="Filtrar membros..." 
                    value={memberSearch} 
                    onChange={e => setMemberSearch(e.target.value)} 
                />
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                {members.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).map(member => (
                    <div key={member.id} className="member-item border-none hover:bg-white/[0.03] transition-colors p-3">
                        <div className="relative">
                            {member.avatar ? (
                                <img src={member.avatar} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="Avatar" />
                            ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white/40 border border-white/5">
                                    <i className="fa-solid fa-user text-sm"></i>
                                </div>
                            )}
                            {member.role !== 'Membro' && (
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1a1e26] ${member.role === 'Dono' ? 'bg-[#FFD700]' : 'bg-[#00c2ff]'}`}>
                                    <i className="fa-solid fa-shield text-[7px] text-black"></i>
                                </div>
                            )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                            <div className="text-sm font-bold text-white/90">{member.name} {member.isMe && <span className="text-[10px] text-white/30 font-normal ml-1">(Você)</span>}</div>
                            <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">{member.role}</div>
                        </div>

                        {isAdmin && !member.isMe && member.role !== 'Dono' && (
                            <div className="flex gap-1">
                                <button onClick={() => onAction(member.id, 'promote')} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#00c2ff] hover:bg-[#00c2ff]/10 transition-all"><i className="fa-solid fa-arrow-up-long text-xs"></i></button>
                                <button onClick={() => onAction(member.id, 'kick')} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-orange-400 hover:bg-orange-400/10 transition-all"><i className="fa-solid fa-user-xmark text-xs"></i></button>
                                <button onClick={() => onAction(member.id, 'ban')} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-500 hover:bg-red-500/10 transition-all"><i className="fa-solid fa-ban text-xs"></i></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
