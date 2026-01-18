
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { trackingService } from '../services/trackingService';
import { API_BASE } from '../apiConfig';
import { LoginInitialCard } from '../features/auth/components/LoginInitialCard';
import { LoginEmailCard } from '../features/auth/components/LoginEmailCard';

declare const google: any;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [googleAuthProcessing, setGoogleAuthProcessing] = useState(false);
    const [error, setError] = useState('');
    
    // Email/Password State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showEmailForm, setShowEmailForm] = useState(false);
    
    const buttonRendered = React.useRef(false);
    const GOOGLE_BTN_ID = 'googleButtonDiv';

    // Affiliate Detection
    useEffect(() => {
        trackingService.captureUrlParams();
    }, [location]);

    const handleRedirect = useCallback((user: any, isNewUser: boolean = false) => {
        setGoogleAuthProcessing(false);
        if (isNewUser || (user && !user.isProfileCompleted)) {
            navigate('/complete-profile', { replace: true });
            return;
        }
        const pendingRedirect = sessionStorage.getItem('redirect_after_login') || (location.state as any)?.from?.pathname;
        if (pendingRedirect && pendingRedirect !== '/' && !pendingRedirect.includes('login')) {
            sessionStorage.removeItem('redirect_after_login');
            navigate(pendingRedirect, { replace: true });
        } else {
            navigate('/feed', { replace: true });
        }
    }, [navigate, location]);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user && authService.isAuthenticated()) {
            handleRedirect(user);
        } else {
            setLoading(false);
        }
    }, [handleRedirect]);

    const handleCredentialResponse = useCallback(async (response: any) => {
        setGoogleAuthProcessing(true);
        setError('');
        try {
            if (!response || !response.credential) throw new Error("Login falhou.");
            const referredBy = trackingService.getAffiliateRef() || undefined;
            const result = await authService.loginWithGoogle(response.credential, referredBy);
            if (result && result.user) {
                const isNew = result.nextStep === '/complete-profile' || !result.user.isProfileCompleted;
                handleRedirect(result.user, isNew);
            }
        } catch (err: any) {
            setError(err.message || 'Falha ao autenticar.');
            setGoogleAuthProcessing(false);
        }
    }, [handleRedirect]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || googleAuthProcessing) return;
        setGoogleAuthProcessing(true);
        setError('');
        try {
            const result = await authService.login(email, password);
            if (result && result.user) {
                const isNew = result.nextStep === '/complete-profile' || !result.user.isProfileCompleted;
                handleRedirect(result.user, isNew);
            }
        } catch (err: any) {
            setError(err.message || 'Credenciais inválidas.');
            setGoogleAuthProcessing(false);
        }
    };

    // Google Init logic remains stable in the parent
    useEffect(() => {
        if (showEmailForm) return; // Don't init if not on initial card
        
        let isMounted = true;
        const initGoogle = async () => {
            let clientId = "";
            try {
                const res = await fetch(`${API_BASE}/api/auth/config`);
                if (res.ok) {
                    const data = await res.json();
                    clientId = data.clientId;
                }
            } catch (err) {}

            if (!isMounted || !clientId || clientId.includes("CONFIGURADO")) return;

            const interval = setInterval(() => {
                const btnDiv = document.getElementById(GOOGLE_BTN_ID);
                if (typeof google !== 'undefined' && google.accounts && btnDiv) {
                    clearInterval(interval);
                    google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleCredentialResponse,
                        auto_select: false
                    });
                    google.accounts.id.renderButton(btnDiv, {
                        theme: 'filled_black',
                        size: 'large',
                        width: '400'
                    });
                }
            }, 100);
        };
        initGoogle();
        return () => { isMounted = false; };
    }, [showEmailForm, handleCredentialResponse]);

    if (loading) return null;

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white font-['Inter'] relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-[400px] mx-4 bg-white/5 backdrop-blur-2xl rounded-[32px] p-10 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center">
                {showEmailForm ? (
                    <LoginEmailCard 
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        onSubmit={handleEmailLogin}
                        onBackToGoogle={() => setShowEmailForm(false)}
                        loading={googleAuthProcessing}
                        error={error}
                    />
                ) : (
                    <LoginInitialCard 
                        onSelectEmail={() => setShowEmailForm(true)}
                        googleButtonId={GOOGLE_BTN_ID}
                        loading={loading}
                        googleProcessing={googleAuthProcessing}
                    />
                )}
                
                {googleAuthProcessing && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-[32px] flex items-center justify-center z-50">
                        <i className="fa-solid fa-circle-notch fa-spin text-[#00c2ff] text-2xl"></i>
                    </div>
                )}
            </div>
        </div>
    );
};
