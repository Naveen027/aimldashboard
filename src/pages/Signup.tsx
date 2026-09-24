import {
    useState,
    useRef,
} from "react";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo (2).png";
import "../css/signup.css";

import { useAuth } from "../context/AuthContext";

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info";
}

function Signup() {

    const { signup } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] =
        useState<string>("");

    const [gmail, setGmail] =
        useState<string>("");

    const [phone, setPhone] =
        useState<string>("");

    const [password, setPassword] =
        useState<string>("");

    const [confirmPassword, setConfirmPassword] =
        useState<string>("");

    const [showPassword, setShowPassword] =
        useState<boolean>(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);

    const [loading, setLoading] =
        useState<boolean>(false);

    const [errors, setErrors] = useState<{
        username?: string;
        gmail?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const [toasts, setToasts] =
        useState<Toast[]>([]);

    const [passwordStrength, setPasswordStrength] =
        useState<number>(0);

    const [phoneValidated, setPhoneValidated] =
        useState<boolean>(false);

    const toastTimerRef =
        useRef<ReturnType<typeof setTimeout> | null>(
            null
        );

    const calculatePasswordStrength = (
        pwd: string
    ): number => {

        let strength = 0;

        if (pwd.length >= 8)
            strength++;

        if (pwd.length >= 12)
            strength++;

        if (
            /[a-z]/.test(pwd) &&
            /[A-Z]/.test(pwd)
        )
            strength++;

        if (/\d/.test(pwd))
            strength++;

        if (/[^a-zA-Z\d]/.test(pwd))
            strength++;

        return Math.min(strength, 4);
    };

    const handlePasswordChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {

        const pwd = e.target.value;

        setPassword(pwd);

        setPasswordStrength(
            calculatePasswordStrength(pwd)
        );

        if (errors.password) {

            setErrors({
                ...errors,
                password: undefined,
            });
        }
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

    const validateEmail = (
        email: string
    ): boolean => {

        const regex =
            /^[^\s@]+@gmail\.com$/;

        return regex.test(email);
    };

    const validatePhone = (): void => {

        if (!phone.trim()) {

            addToast(
                "Please enter a phone number",
                "error"
            );

            return;
        }

        if (
            !/^\d{10}$/.test(
                phone.replace(/\D/g, "")
            )
        ) {

            addToast(
                "Phone number must be 10 digits",
                "error"
            );

            return;
        }

        setPhoneValidated(true);

        addToast(
            "Phone number validated successfully!",
            "success"
        );
    };

    const validateForm = (): boolean => {

        const newErrors: {
            username?: string;
            gmail?: string;
            phone?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        if (!username.trim()) {

            newErrors.username =
                "Username is required";

        } else if (username.length < 3) {

            newErrors.username =
                "Username must be at least 3 characters";
        }

        if (!gmail.trim()) {

            newErrors.gmail =
                "Email is required";

        } else if (!validateEmail(gmail)) {

            newErrors.gmail =
                "Please use a valid Gmail address";
        }

        if (!phoneValidated) {

            newErrors.phone =
                "Please validate your phone number";
        }

        if (!password) {

            newErrors.password =
                "Password is required";

        } else if (password.length < 6) {

            newErrors.password =
                "Password must be at least 6 characters";
        }

        if (!confirmPassword) {

            newErrors.confirmPassword =
                "Please confirm your password";

        } else if (
            password !== confirmPassword
        ) {

            newErrors.confirmPassword =
                "Passwords do not match";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    const handleSignup = async (
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

            await signup({
                username,
                gmail,
                phone,
                password,
            });

            addToast(
                "Signup successful! Redirecting...",
                "success"
            );

            setUsername("");
            setGmail("");
            setPhone("");
            setPassword("");
            setConfirmPassword("");
            setPhoneValidated(false);
            setPasswordStrength(0);
            navigate("/");

        } catch (error) {

            console.error(
                "Signup error:",
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

        <div className="signup-page">

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

            <div className="signup-card">

                <div className="signup-header">

                    <div className="brand">

                        <div className="signup-logo">

                            <img
                                src={logo}
                                alt="AI Nexus Logo"
                            />

                        </div>

                        <h1>AI Nexus</h1>

                    </div>

                    <h2>
                        Create an Account
                    </h2>

                </div>

                <form
                    onSubmit={handleSignup}
                >

                    <div className="signup-content">

                        <section>

                            <h2>
                                Contact Details
                            </h2>

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
                                />

                                {errors.username && (

                                    <p className="error-message">
                                        {errors.username}
                                    </p>

                                )}

                            </div>

                            <div className="form-group">

                                <label>
                                    Gmail
                                </label>

                                <input
                                    type="email"
                                    value={gmail}
                                    onChange={(e) => {

                                        setGmail(
                                            e.target.value
                                        );

                                        if (
                                            errors.gmail
                                        ) {

                                            setErrors({
                                                ...errors,
                                                gmail:
                                                    undefined,
                                            });
                                        }

                                    }}
                                    placeholder="example@gmail.com"
                                    disabled={loading}
                                />

                                {errors.gmail && (

                                    <p className="error-message">
                                        {errors.gmail}
                                    </p>

                                )}

                            </div>

                            <div className="form-group">

                                <label>
                                    Phone Number
                                </label>

                                <div className="phone-row">

                                    <select
                                        disabled={loading}
                                    >

                                        <option>
                                            🇮🇳 +91
                                        </option>

                                        <option>
                                            🇺🇸 +1
                                        </option>

                                        <option>
                                            🇬🇧 +44
                                        </option>

                                        <option>
                                            🇨🇦 +1
                                        </option>

                                    </select>

                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => {

                                            setPhone(
                                                e.target.value
                                            );

                                            setPhoneValidated(
                                                false
                                            );

                                            if (
                                                errors.phone
                                            ) {

                                                setErrors({
                                                    ...errors,
                                                    phone:
                                                        undefined,
                                                });
                                            }

                                        }}
                                        placeholder="Phone number"
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            validatePhone
                                        }
                                        disabled={
                                            loading ||
                                            !phone
                                        }
                                        className={
                                            phoneValidated
                                                ? "validate-button validated"
                                                : "validate-button"
                                        }
                                    >

                                        {phoneValidated
                                            ? "✓"
                                            : "Validate"}

                                    </button>

                                </div>

                                {errors.phone && (

                                    <p className="error-message">
                                        {errors.phone}
                                    </p>

                                )}

                            </div>

                        </section>

                        <section>

                            <h2>
                                Set Password
                            </h2>

                            <div className="form-group">

                                <label>
                                    Create Password
                                </label>

                                <div className="password-wrapper">

                                    <input
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={
                                            handlePasswordChange
                                        }
                                        placeholder="••••••••"
                                        disabled={loading}
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

                                </div>

                                {password && (

                                    <div className="password-strength">

                                        <div className="strength-bars">

                                            {[1, 2, 3, 4].map(
                                                (level) => (

                                                    <span
                                                        key={level}
                                                        className={
                                                            level <=
                                                            passwordStrength
                                                                ? "active"
                                                                : ""
                                                        }
                                                    />

                                                )
                                            )}

                                        </div>

                                        <small>
                                            Must be 8+ characters,
                                            with number & symbol
                                        </small>

                                    </div>

                                )}

                                {errors.password && (

                                    <p className="error-message">
                                        {errors.password}
                                    </p>

                                )}

                            </div>

                            <div className="form-group">

                                <label>
                                    Confirm Password
                                </label>

                                <div className="password-wrapper">

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={
                                            confirmPassword
                                        }
                                        onChange={(e) => {

                                            setConfirmPassword(
                                                e.target.value
                                            );

                                            if (
                                                errors.confirmPassword
                                            ) {

                                                setErrors({
                                                    ...errors,
                                                    confirmPassword:
                                                        undefined,
                                                });
                                            }

                                        }}
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        disabled={
                                            loading ||
                                            !confirmPassword
                                        }
                                        className="password-toggle"
                                    >

                                        {showConfirmPassword
                                            ? "👁️"
                                            : "🙈"}

                                    </button>

                                </div>

                                {errors.confirmPassword && (

                                    <p className="error-message">
                                        {
                                            errors.confirmPassword
                                        }
                                    </p>

                                )}

                            </div>

                        </section>

                    </div>

                    <div className="signup-footer">

                        <button
                            type="submit"
                            disabled={loading}
                            className="signup-button"
                        >

                            {loading ? (

                                <>
                                    <span className="spinner">
                                        ⚙️
                                    </span>

                                    Signing up...
                                </>

                            ) : (

                                "Signup"

                            )}

                        </button>

                        <p className="login-link">

                            Already have an account?{" "}

                            <a href="/">
                                Log In
                            </a>

                        </p>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default Signup;