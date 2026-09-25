import {
    useState,
    useRef,
    useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import "../css/login.css";

import { useAuth } from "../context/AuthContext";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

function Login() {

    const { login } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] =
        useState<string>("");

    const [password, setPassword] =
        useState<string>("");

    const [rememberMe, setRememberMe] =
        useState<boolean>(false);

    const [showPassword, setShowPassword] =
        useState<boolean>(false);

    const [loading, setLoading] =
        useState<boolean>(false);

    const [showPasswordTooltip, setShowPasswordTooltip] =
        useState<boolean>(false);

    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
    }>({});

    const [toasts, setToasts] =
        useState<Toast[]>([]);

    const toastTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(
            null
        );

    useEffect(() => {

        const saved =
            localStorage.getItem(
                "loginCredentials"
            );

        if (saved) {

            try {

                const {
                    username: savedUsername,
                    rememberMe: savedRemember,
                } = JSON.parse(saved);

                setUsername(savedUsername);
                setRememberMe(savedRemember);

            } catch (error) {

                console.error(
                    "Invalid saved login data:",
                    error
                );

                localStorage.removeItem(
                    "loginCredentials"
                );
            }
        }

    }, []);

    const validateForm = (): boolean => {

        const newErrors: {
            username?: string;
            password?: string;
        } = {};

        if (!username.trim()) {
            newErrors.username =
                "Username is required";
        }

        if (!password) {
            newErrors.password =
                "Password is required";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    const addToast = (
        message: string,
        type: "success" | "error" | "info"
    ) => {

        const id = Date.now().toString();

        setToasts((prev) => [
            ...prev,
            {
                id,
                message,
                type,
            },
        ]);

        if (toastTimerRef.current) {
            clearTimeout(
                toastTimerRef.current
            );
        }

        toastTimerRef.current =
            setTimeout(() => {

                setToasts((prev) =>
                    prev.filter(
                        (toast) =>
                            toast.id !== id
                    )
                );

            }, 4000);
    };

    const handleLogin = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        if (!validateForm()) {

            addToast(
                "Please fix the errors above",
                "error"
            );

            return;
        }

        setLoading(true);

        try {

            const loginResponse = await login(
                username,
                password,
                rememberMe
            );

            console.log(
                "Login Response:",
                loginResponse
            );

            if (loginResponse.status === 200) {

                addToast(
                    loginResponse.message,
                    "success"
                );

                console.log(
                    "Status:",
                    loginResponse.status
                );

                console.log(
                    "Message:",
                    loginResponse.message
                );

                console.log(
                    "Token:",
                    loginResponse.token
                );

                console.log(
                    "Role:",
                    loginResponse.role
                );

                setUsername("");
                setPassword("");
                navigate(
                    loginResponse.role === "admin"
                        ? "/admin-dashboard"
                        : "/user-dashboard"
                );

            } else {

                addToast(
                    loginResponse.message,
                    "error"
                );
            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            addToast(
                "Something went wrong. Please try again.",
                "error"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="login-page">

            <div className="toast-container">

                {toasts.map((toast) => (

                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type}`}
                    >
                        {toast.message}
                    </div>

                ))}

            </div>

            <div className="login-wrapper">

                <div className="login-card">

                    <div className="login-header">

                        <div className="login-logo">

                            <img
                                src={logo}
                                alt="Karnataka Ai Logo"
                            />

                        </div>

                        <h1>KARNATAKA AI</h1>

                    </div>

                    <h2>
                        Login to your Account
                    </h2>

                    <form
                        onSubmit={handleLogin}
                        className="login-form"
                    >

                        <div className="form-group">

                            <label>
                                Username
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {

                                    setUsername(
                                        e.target.value
                                    );

                                    if (
                                        errors.username
                                    ) {

                                        setErrors({
                                            ...errors,
                                            username:
                                                undefined,
                                        });
                                    }

                                }}
                                placeholder="e.g., alex.j"
                                disabled={loading}
                                className={
                                    errors.username
                                        ? "input-error"
                                        : ""
                                }
                            />

                            {errors.username && (

                                <p className="error-message">
                                    {errors.username}
                                </p>

                            )}

                        </div>

                        <div className="form-group">

                            <div className="password-label-row">

                                <label>
                                    Password
                                </label>

                                <a
                                    href="#"
                                    className="forgot-password"
                                >
                                    Forgot Password?
                                </a>

                            </div>

                            <div className="password-wrapper">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) => {

                                        setPassword(
                                            e.target.value
                                        );

                                        if (
                                            errors.password
                                        ) {

                                            setErrors({
                                                ...errors,
                                                password:
                                                    undefined,
                                            });
                                        }

                                    }}
                                    placeholder="••••••••"
                                    disabled={loading}
                                    onFocus={() =>
                                        setShowPasswordTooltip(
                                            true
                                        )
                                    }
                                    onBlur={() =>
                                        setShowPasswordTooltip(
                                            false
                                        )
                                    }
                                    className={
                                        errors.password
                                            ? "input-error"
                                            : ""
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={
                                        loading ||
                                        !password
                                    }
                                    className="password-toggle"
                                >
                                    {showPassword
                                        ? "👁️"
                                        : "🙈"}
                                        
                                </button>

                                {showPasswordTooltip && (

                                    <div className="password-tooltip">

                                        Must be 8+ chars,
                                        with number & symbol

                                        <div className="tooltip-arrow"></div>

                                    </div>

                                )}

                            </div>

                            {errors.password && (

                                <p className="error-message">
                                    {errors.password}
                                </p>

                            )}

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="login-button"
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    <div className="signup-link">

                        <p>

                            Don't have an account?{" "}

                            <a href="/signup">
                                Sign Up
                            </a>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;