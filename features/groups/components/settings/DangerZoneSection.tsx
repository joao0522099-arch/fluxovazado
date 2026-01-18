
import React from 'react';

interface DangerZoneSectionProps {
    isOwner: boolean;
    onAction: (type: 'leave' | 'delete') => void;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ isOwner, onAction }) => {
    return (
        <div className="section-body">
            <button className="danger-btn-ui text-white" onClick={() => onAction('leave')}>
                <i className="fa-solid fa-right-from-bracket mr-2"></i> Sair do Grupo
            </button>
            {isOwner && (
                <button className="danger-btn-ui bg-red-500/20 text-red-500 border-red-500/50 border-none" onClick={() => onAction('delete')}>
                    <i className="fa-solid fa-trash-can mr-2"></i> EXCLUIR GRUPO PERMANENTEMENTE
                </button>
            )}
        </div>
    );
};
