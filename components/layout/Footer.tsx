
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { chatService } from '../../services/chatService';
import { db } from '../../database';

interface FooterProps {
    visible?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ visible = true }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadNotifs, setUnreadNotifs] = useState(0);
    const [unreadMsgs, setUnreadMsgs] = useState(0);

    useEffect(() => {
        const updateCounts = () => {
            setUnreadNotifs(notificationService.getUnreadCount());
            setUnreadMsgs(chatService.getUnreadCount());
        };
        updateCounts();
        
        const unsubNotif = db.subscribe('notifications', updateCounts);
        const unsubChat = db.subscribe('chats', updateCounts);
        
        return () => {
            unsubNotif();
            unsubChat();
        };
    }, []);

    const isActive = (paths: string[]) => {
        return paths.some(path => location.pathname === path);
    };

    return (
        <footer className={`fixed bottom-0 left-0 w-full bg-[#0c0f14] flex justify-around py-3.5 rounded-t-2xl z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-full'}`}>
            <button 
                onClick={() => navigate('/feed')} 
                className={`text-[22px] p-2 transition-all hover:text-white ${isActive(['/feed']) ? 'text-white' : 'text-[#00c2ff]'}`}
            >
                <i className="fa-solid fa-newspaper"></i>
            </button>
            
            <button 
                onClick={() => navigate('/messages')} 
                className={`text-[22px] p-2 relative transition-all hover:text-white ${isActive(['/messages']) ? 'text-white' : 'text-[#00c2ff]'}`}
            >
                <i className="fa-solid fa-comments"></i>
                {unreadMsgs > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ff4d4d] rounded-full border border-[#0c0f14]"></div>
                )}
            </button>
            
            <button 
                onClick={() => navigate('/notifications')} 
                className={`text-[22px] p-2 relative transition-all hover:text-white ${isActive(['/notifications']) ? 'text-white' : 'text-[#00c2ff]'}`}
            >
                <i className="fa-solid fa-bell"></i>
                {unreadNotifs > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#ff4d4d] rounded-full border border-[#0c0f14]"></div>
                )}
            </button>
            
            <button 
                onClick={() => navigate('/profile')} 
                className={`text-[22px] p-2 transition-all hover:text-white ${isActive(['/profile', '/settings', '/edit-profile']) ? 'text-white' : 'text-[#00c2ff]'}`}
            >
                <i className="fa-solid fa-user"></i>
            </button>
        </footer>
    );
};
