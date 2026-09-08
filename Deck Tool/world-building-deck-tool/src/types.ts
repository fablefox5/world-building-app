type UserBasicParams = {
    username: string;
    email: string;
    first_name: string;
}

type AuthContextType = {
    isAuthenticated: boolean;
    user: UserBasicParams | null;
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

type LoginResponse = {
    token: string;
    token_type: string;
}

export type { UserBasicParams, AuthContextType, LoginResponse };