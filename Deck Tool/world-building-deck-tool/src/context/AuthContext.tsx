import { useState, createContext, useContext, useEffect } from 'react';
import type { AuthContextType, UserBasicParams } from '../lib//types';
import { getSelf } from '../services/userServices';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem("token"));
    const [user, setUser] = useState<UserBasicParams | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const login = (token: string) => {
        localStorage.setItem("token", token);
        setToken(token);
        setIsAuthenticated(true);
        navigate('/');
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenType");
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        navigate('/');
    };

    useEffect(() => {
        async function fetchUser() {
            if (token) {
                try {
                    const data = await getSelf();
                    setUser(data);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                    // Token is bad — clear it so we don't keep retrying
                    logout();
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }

        fetchUser();
    }, [token]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}