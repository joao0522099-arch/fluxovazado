
import React, { useState } from 'react';
import { User, GroupLink } from '../../../types';
import { groupService } from '../../../services/groupService';

interface AccessSectionProps {
    groupId: string;
    isAdmin: boolean;
    approveMembers: boolean;
    setApproveMembers: (val: boolean) => void;
    pendingRequests: User[];
    handlePendingAction: (email: string, action: 'accept' | 'deny') => void;
    links: GroupLink[];
    setLinks: (links: GroupLink[]) => void;
}

export const AccessSection: React.FC<AccessSectionProps> = ({
    groupId, isAdmin, approveMembers, setApproveMembers, pendingRequests, handlePendingAction, links, setLinks
}) => {
    const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
    const [newLinkName, setNewLinkName] = useState('');
    const [maxUses, setMaxUses] = useState('');

    const handleCreateLink = () => {
        if (!newLinkName.trim()) return;
        const uses = maxUses ? parseInt(maxUses) : undefined;
        const link = groupService.addGroupLink(groupId, newLinkName, uses);
        if (link) {
            setLinks([link, ...links]);
            setNewLinkName('');
            setMaxUses('');
            setIsLinksModalOpen(false);
        }
    };

    const handleCopyLink = (code: string) => {
        const url = `${window.location.origin}/#/groups?join=${code}`;
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
    };

    const handleDeleteLink = (linkId: string) => {
        groupService.removeGroupLink(groupId, linkId);
        setLinks(links.filter(l => l.id !== linkId));
    };

    return (
        <div className="section-body">
            {isAdmin && (
                <div className="toggle-row">
                    <div className="toggle-info">
                        <h4>Aprovar Membros</h4>
                        <p>Solicitações requerem aprovação</p>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={approveMembers} onChange={() => setApproveMembers(!approveMembers)} />
                        <span className="slider"></span>
                    </label>
                </div>
            )}

            {pendingRequests.length > 0 && (
                <div className="mb-4 mt-2">
                    <div className="text-xs font-bold text-[#ffaa00] uppercase mb-2">Solicitações Pendentes ({pendingRequests.length})</div>
                    {pendingRequests.map(u => (
                        <div key={u.email} className="flex justify-between items-center bg-white/5 p-2 rounded mb-1">
                            <span className="text-sm font-medium">{u.profile?.name}</span>
                            <div className="flex gap-2">
                                <button onClick={() => handlePendingAction(u.email, 'accept')} className="text-[#00ff82]"><i className="fa-solid fa-check"></i></button>
                                <button onClick={() => handlePendingAction(u.email, 'deny')} className="text-[#ff4d4d]"><i className="fa-solid fa-xmark"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="font-bold text-xs text-gray-400 uppercase">Links de Convite</label>
                    {isAdmin && <button onClick={() => setIsLinksModalOpen(true)} className="text-[#00c2ff] text-xs"><i className="fa-solid fa-plus"></i> Novo</button>}
                </div>
                {links.map(link => (
                    <div key={link.id} className="link-item">
                        <div>
                            <div className="link-info">{link.name}</div>
                            <div className="link-code">code: {link.code}</div>
                        </div>
                        <div className="flex gap-3">
                            <i className="fa-regular fa-copy text-gray-400 cursor-pointer" onClick={() => handleCopyLink(link.code)}></i>
                            {isAdmin && <i className="fa-solid fa-trash text-[#ff4d4d] cursor-pointer" onClick={() => handleDeleteLink(link.id)}></i>}
                        </div>
                    </div>
                ))}
            </div>

            {isLinksModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1e26] p-6 rounded-xl w-full max-w-sm border border-white/10">
                        <h3 className="text-lg font-bold mb-4">Novo Link de Convite</h3>
                        <div className="input-group">
                            <label>Nome do Link</label>
                            <input type="text" className="input-field" placeholder="Ex: Instagram Bio" value={newLinkName} onChange={e => setNewLinkName(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Limite de Usos (Opcional)</label>
                            <input type="number" className="input-field" placeholder="Ex: 100" value={maxUses} onChange={e => setMaxUses(e.target.value)} />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button className="flex-1 py-2 bg-gray-700 rounded-lg" onClick={() => setIsLinksModalOpen(false)}>Cancelar</button>
                            <button className="flex-1 py-2 bg-[#00c2ff] text-black font-bold rounded-lg" onClick={handleCreateLink}>Criar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
