
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useModal } from '../components/ModalSystem';
import { Footer } from '../components/layout/Footer';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm, showAlert } = useModal();
  const [isPrivate, setIsPrivate] = useState(false);
  const [isAdultContent, setIsAdultContent] = useState(localStorage.getItem('settings_18_plus') === 'true');

  useEffect(() => {
      const user = authService.getCurrentUser();
      if (user?.profile) { setIsPrivate(user.profile.isPrivate); }
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (await showConfirm("Sair da conta", "Deseja realmente sair do aplicativo? Você precisará fazer login novamente.", "Sair", "Ficar")) {
      authService.logout();
      navigate('/', { replace: true });
    }
  };

  const handleTogglePrivacy = async () => {
    const newState = !isPrivate;
    setIsPrivate(newState);
    const user = authService.getCurrentUser();
    if(user && user.email && user.profile) { 
        authService.completeProfile(user.email, { ...user.profile, isPrivate: newState })
            .catch(e => console.error(e)); 
    }
    await showAlert("Status da Conta", `Sua conta agora é ${newState ? 'PRIVADA' : 'PÚBLICA'}.`);
  };

  const handleToggleAdultContent = () => {
    const newState = !isAdultContent;
    setIsAdultContent(newState);
    localStorage.setItem('settings_18_plus', String(newState));
  };

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-hidden">
      <style>{`
        header { display:flex; align-items:center; padding:16px; background: #0c0f14; position:fixed; width:100%; top:0; z-index:10; border-bottom:1px solid rgba(255,255,255,0.1); height: 65px; }
        header .back-btn { background:none; border:none; color:#fff; font-size:24px; cursor:pointer; padding-right: 15px; }
        main { padding-top: 85px; padding-bottom: 100px; width: 100%; max-width: 600px; margin: 0 auto; padding-left: 20px; padding-right: 20px; overflow-y: auto; flex-grow: 1; -webkit-overflow-scrolling: touch; }
        .settings-group { margin-bottom: 20px; }
        .settings-group h2 { font-size: 16px; color: #00c2ff; padding: 10px 0; margin-bottom: 5px; text-transform: uppercase; }
        .setting-item { display: flex; align-items: center; justify-content: space-between; padding: 15px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); background-color: rgba(255, 255, 255, 0.05); transition: background-color 0.2s; text-decoration: none; color: #fff; cursor: pointer; border-radius: 8px; margin-bottom: 8px; }
        .setting-info { display: flex; align-items: center; }
        .setting-info i { font-size: 20px; width: 30px; text-align: center; margin-right: 15px; color: #00c2ff; }
        .setting-item p { font-size: 16px; font-weight: 500; }
        .switch { position: relative; display: inline-block; width: 45px; height: 25px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 25px; }
        .slider:before { position: absolute; content: ""; height: 19px; width: 19px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #00c2ff; }
        input:checked + .slider:before { transform: translateX(20px); }
        .logout-container { margin-top: 40px; padding: 0 10px 20px 10px; }
        .logout-btn { width: 100%; padding: 15px; background: rgba(255, 77, 77, 0.1); border: 1px solid rgba(255, 77, 77, 0.3); color: #ff4d4d; border-radius: 12px; font-weight: 700; font-size: 16px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
      `}</style>

      <header>
        <button onClick={() => navigate('/profile')} className="back-btn"><i className="fas fa-arrow-left"></i></button>
        <h1>Configurações</h1>
      </header>

      <main>
        <div className="settings-group">
            <h2>Conta</h2>
            <div onClick={() => navigate('/edit-profile')} className="setting-item"><div className="setting-info"><i className="fas fa-user-edit"></i><p>Editar Perfil</p></div><i className="fas fa-chevron-right"></i></div>
            <div onClick={() => navigate('/financial')} className="setting-item"><div className="setting-info"><i className="fas fa-wallet"></i><p>Resgatar Saldo (Financeiro)</p></div><i className="fas fa-chevron-right"></i></div>
        </div>

        <div className="settings-group">
            <h2>Privacidade e Segurança</h2>
            <div className="setting-item"><div className="setting-info"><i className="fas fa-lock"></i><p>Conta Privada</p></div><label className="switch" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={isPrivate} onChange={handleTogglePrivacy} /><span className="slider"></span></label></div>
            <div className="setting-item"><div className="setting-info"><i className="fas fa-triangle-exclamation"></i><p>Habilitar Conteúdo +18</p></div><label className="switch" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={isAdultContent} onChange={handleToggleAdultContent} /><span className="slider"></span></label></div>
            <div onClick={() => navigate('/security-login')} className="setting-item"><div className="setting-info"><i className="fas fa-shield-alt"></i><p>Segurança e Login</p></div><i className="fas fa-chevron-right"></i></div>
            <div onClick={() => navigate('/blocked-users')} className="setting-item"><div className="setting-info"><i className="fas fa-user-slash"></i><p>Gerenciar Bloqueios</p></div><i className="fas fa-chevron-right"></i></div>
        </div>

        <div className="settings-group">
            <h2>Geral</h2>
            <div onClick={() => navigate('/notification-settings')} className="setting-item"><div className="setting-info"><i className="fas fa-bell"></i><p>Configurações de Notificação</p></div><i className="fas fa-chevron-right"></i></div>
            <div onClick={() => navigate('/terms')} className="setting-item"><div className="setting-info"><i className="fas fa-file-alt"></i><p>Termos e Privacidade</p></div><i className="fas fa-chevron-right"></i></div>
            <div onClick={() => navigate('/help')} className="setting-item"><div className="setting-info"><i className="fas fa-headset"></i><p>Ajuda e Suporte</p></div><i className="fas fa-chevron-right"></i></div>
        </div>

        <div className="logout-container">
            <button onClick={handleLogout} className="logout-btn"><i className="fas fa-sign-out-alt"></i> Sair da Conta</button>
            <div style={{textAlign:'center', marginTop:'15px', color:'#555', fontSize:'11px'}}>Flux App v1.2.3</div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
