
import React from 'react';
import { Link } from 'react-router-dom';

interface LoginEmailCardProps {
    email: string;
    setEmail: (val: string) => void;
    password: string;
    setPassword: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onBackToGoogle: () => void;
    loading: boolean;
    error: string;
}

export const LoginEmailCard: React.FC<LoginEmailCardProps> = ({
    email, setEmail, password, setPassword, onSubmit, onBackToGoogle, loading, error
}) => {
    return (
        <div className="w-full animate-fade-in">
            <div className="flex flex-col items-center mb-8">
                <div className="mb-4 w-[60px] h-[60px] bg-white/5 rounded-xl flex items-center justify-center relative border border-white/10">
                    <div className="absolute w-[35px] h-[20px] rounded-[50%] border-[3px] border-[#00c2ff] rotate-[25deg]"></div>
                    <div className="absolute w-[35px] h-[20px] rounded-[50%] border-[3px] border-[#00c2ff] -rotate-[25deg]"></div>
                </div>
                <h1 className="text-2xl font-bold text-white">Acesse sua conta</h1>
                <p className="text-gray-500 text-xs mt-1">Insira suas credenciais abaixo</p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center animate-shake">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i>
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit} className="w-full space-y-4">
                <div className="relative">
                    <i className="fa-solid fa-at absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                    <input 
                        type="email" 
                        placeholder="E-mail" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3.5 pl-11 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-[#00c2ff] transition-all placeholder-gray-600"
                        required
                    />
                </div>
                <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3.5 pl-11 bg-black/20 border border-white/10 rounded-xl text-white outline-none focus:border-[#00c2ff] transition-all placeholder-gray-600"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-[#00c2ff] text-black font-black rounded-xl hover:bg-[#00aaff] transition-all shadow-lg shadow-[#00c2ff]/20 disabled:opacity-50 active:scale-[0.98]"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'ENTRAR'}
                </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-4">
                <button 
                    onClick={onBackToGoogle}
                    className="text-sm font-bold text-[#00c2ff] hover:text-white transition-colors flex items-center gap-2"
                >
                    <i className="fa-brands fa-google"></i>
                    Entrar com Google
                </button>

                <div className="w-full h-[1px] bg-white/5"></div>

                <div className="flex gap-4 text-xs font-semibold">
                    <Link to="/register" className="text-gray-400 hover:text-[#00c2ff] transition-colors">CRIAR CONTA</Link>
                    <span className="text-gray-800">•</span>
                    <Link to="/forgot-password" title="Esqueci a senha" className="text-gray-400 hover:text-white transition-colors">RECUPERAR SENHA</Link>
                </div>
            </div>
        </div>
    );
};
