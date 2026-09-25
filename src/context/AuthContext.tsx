import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

import {
    loginUser,
    signupUser,
    type LoginResponse,
    type SignupData,
} from "../services/authService";

interface AuthContextType {
    authResponse: LoginResponse | null;
    isAuthenticated: boolean;
    login: (
        username: string,
        password: string,
        rememberMe: boolean
    ) => Promise<LoginResponse>;
    signup: (signupData: SignupData) => Promise<void>;
    logout: () => void;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext =
    createContext<AuthContextType | undefined>(
        undefined
    );

const AUTH_SESSION_KEY = "authSession";

const getStoredAuthResponse = (): LoginResponse | null => {
    const storedSession = localStorage.getItem(AUTH_SESSION_KEY);

    if (!storedSession) {
        return null;
    }

    try {
        const parsedSession = JSON.parse(storedSession) as LoginResponse;

        if (
            parsedSession.status === 200 &&
            (parsedSession.role === "user" ||
                parsedSession.role === "admin") &&
            typeof parsedSession.username === "string"
        ) {
            return parsedSession;
        }
    } catch (error) {
        console.error("Invalid stored authentication session:", error);
    }

    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {

    const [authResponse, setAuthResponse] =
        useState<LoginResponse | null>(
            getStoredAuthResponse
        );

    const login = async (
        username: string,
        password: string,
        rememberMe: boolean
    ): Promise<LoginResponse> => {

        const response = await loginUser(
            username,
            password
        );

        if (response.status === 200) {

            setAuthResponse(response);
            localStorage.setItem(
                AUTH_SESSION_KEY,
                JSON.stringify(response)
            );

            if (rememberMe) {

                localStorage.setItem(
                    "loginCredentials",
                    JSON.stringify({
                        username,
                        rememberMe: true,
                    })
                );

            } else {

                localStorage.removeItem(
                    "loginCredentials"
                );
            }
        }

        return response;
    };

    const signup = async (
        signupData: SignupData
    ): Promise<void> => {

        await signupUser(signupData);
    };

    const logout = () => {

        setAuthResponse(null);
        localStorage.removeItem(AUTH_SESSION_KEY);

        localStorage.removeItem(
            "loginCredentials"
        );
    };

    return (
        <AuthContext.Provider
            value={{
                authResponse,
                isAuthenticated:
                    authResponse?.status === 200,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = (): AuthContextType => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};