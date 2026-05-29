import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import speakflow_logo from '../assets/speakFlow_logo.png'
import {
    LayoutDashboard, History, Save, UserPlus,
    LogIn, LogOut
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SidebarItem = ({ to, icon: Icon, label, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${isActive ? 'text-indigo-700' : 'text-gray-500 hover:text-white'
            }`
        }
    >
        <Icon size={20} />
        <span className="font-medium text-sm">{label}</span>
    </NavLink>
);

export default function RootLayout({ children }) {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    // Token payload only has { id } but many controllers create user email/username.
    // We'll fetch user info once on mount.
    React.useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
                const data = await res.json().catch(() => ({}));
                if (res.ok && data?.success && data?.user) {
                    setUserName(data.user.username || data.user.email || '');
                    setUserEmail(data.user.email || '');
                }
            } catch {
                // ignore
            }
        };
        loadUser();
    }, []);

    const userInitials = (userName || userEmail)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0]?.toUpperCase())
        .join('');


    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } finally {
            setIsLoggingOut(false);
            navigate('/login');
        }
    };

    return (
        <div className="flex h-screen bg-slate-500 font-sans text-gray-900">

            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-100 bg-slate-950 flex flex-col p-6">
                <div className="flex items-start  mb-5">
                    <img
                        src={speakflow_logo}
                        alt="SpeakFlow Logo"
                        className="h-[90px] w-[75px] object-contain"
                    />
                    <div className="flex flex-col gap-0.5 mt-4">
                        <h1 className="text-lg font-bold tracking-tight text-white">
                            Speak<span className="text-indigo-500">Flow</span>
                        </h1>
                        <p className="text-[13px] text-gray-500">
                            AI Speech to Text
                        </p>
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    <SidebarItem to="/" end={true} icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/history" icon={History} label="History" />
                    <SidebarItem to="/saved" icon={Save} label="Saved Files" />
                    <SidebarItem to="/register" icon={UserPlus} label="Register" />
                    <SidebarItem to="/login" icon={LogIn} label="Login" />
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-gray-500 transition-colors hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </span>
                    </button>
                </nav>

                {/* User Profile */}
                <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {userInitials ? userInitials : 'TU'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate text-white">{userName ? userName : 'Test User'} </p>
                        <p className="text-xs text-gray-500 truncate">{userEmail ? userEmail : 'testuser@example.com'} </p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
                {/* Page Content */}
                <section className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </section>
            </main>
        </div>
    );
}
