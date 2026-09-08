import { useState, createContext, useContext, useEffect } from 'react';
import type { AuthContextType, UserBasicParams } from '../types';
import { getSelf } from '../services/userServices';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<UserBasicParams | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = (token: string) => {
        setToken(token);
        setIsAuthenticated(true);
        navigate('/'); 
    }

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    useEffect(() => {
        async function fetchUser() {
            if (token) {
                try {
                    const data = await getSelf();
                    setUser(data);
                } catch (error) {
                    console.error("Failed to fetch user:", error);
                }
            }
        }

        fetchUser();
    }, [token]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
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