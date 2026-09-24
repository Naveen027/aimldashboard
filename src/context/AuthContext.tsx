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

export function AuthProvider({
    children,
}: AuthProviderProps) {

    const [authResponse, setAuthResponse] =
        useState<LoginResponse | null>(null);

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