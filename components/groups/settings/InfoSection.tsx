
import React from 'react';

interface InfoSectionProps {
    isOwner: boolean;
    groupName: string;
    setGroupName: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    coverImage?: string;
    setCoverImage: (val: string) => void;
    groupType: string;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ 
    isOwner, groupName, setGroupName, description, setDescription, coverImage, setCoverImage, groupType 
}) => {
    return (
        <div className="section-body">
            {isOwner ? (
                <>
                    <div className="mb-4 text-center">
                        <img src={coverImage || 'https://via.placeholder.com/300x100?text=Capa'} className="cover-preview" alt="Capa" />
                        <button onClick={() => document.getElementById('coverInput')?.click()} className="text-[#00c2ff] text-sm underline">Alterar Capa</button>
                        <input type="file" id="coverInput" hidden accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if(file) {
                                const r = new FileReader();
                                r.onload = (ev) => setCoverImage(ev.target?.result as string);
                                r.readAsDataURL(file);
                            }
                        }} />
                    </div>
                    <div className="input-group">
                        <label>Nome do Grupo</label>
                        <input type="text" className="input-field" value={groupName} onChange={e => setGroupName(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Descrição</label>
                        <textarea className="input-field" rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-xs px-2 py-1 rounded border border-[#00c2ff] text-[#00c2ff] uppercase font-bold">
                            {groupType}
                        </span>
                    </div>
                </>
            ) : (
                <p className="text-gray-400 text-sm">Apenas o dono pode editar as informações principais.</p>
            )}
        </div>
    );
};
