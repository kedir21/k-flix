
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
    onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Verification email sent! Please check your inbox.');
            }
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'apple' | 'discord') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-500">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 sm:p-12 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
                {/* Decorative elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-[80px]" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
                        {isLogin ? 'Welcome Back' : 'Join K-Flix'}
                    </h2>
                    <p className="text-gray-500 text-xs font-black uppercase tracking-widest pl-1">
                        {isLogin ? 'Access your personalized experience' : 'Start your journey with us'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-600 focus:bg-white/10 transition-all font-bold text-sm"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-600 focus:bg-white/10 transition-all font-bold text-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                            <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black hover:bg-blue-600 hover:text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-xl disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Auth;
