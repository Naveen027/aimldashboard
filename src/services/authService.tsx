export interface Account {
    id: string;
    username: string;
    password: string;
    gmail?: string;
    phone?: string;
    role?: "user" | "admin";
    modelsUsed?: number;
    totalUsage?: number;
}

export interface LoginResponse {
    status: number;
    message: string;
    token: string | null;
    role: "user" | "admin" | null;
    username: string | null;
    gmail: string | null;
    phone: string | null;
    modelsUsed: number;
    totalUsage: number;
}

export interface SignupData {
    username: string;
    gmail: string;
    phone: string;
    password: string;
}

const HARDCODED_USER = {
    username: "user",
    password: "user@123",
    gmail: "user@example.com",
    phone: "",
    modelsUsed: 4,
    totalUsage: 0,
} as const;

const HARDCODED_ADMIN = {
    username: "admin",
    password: "admin@123",
    gmail: "admin@example.com",
    phone: "",
    modelsUsed: 0,
    totalUsage: 0,
} as const;

const generateToken = (): string => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let token = "";

    for (let i = 0; i < 10; i++) {
        token += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }

    return token;
};

export const loginUser = async (
    username: string,
    password: string
): Promise<LoginResponse> => {
    const normalizedUsername = username.trim();

    if (
        normalizedUsername === HARDCODED_USER.username &&
        password === HARDCODED_USER.password
    ) {
        return {
            status: 200,
            message: "Login successful",
            token: generateToken(),
            role: "user",
            username: HARDCODED_USER.username,
            gmail: HARDCODED_USER.gmail,
            phone: HARDCODED_USER.phone,
            modelsUsed: HARDCODED_USER.modelsUsed,
            totalUsage: HARDCODED_USER.totalUsage,
        };
    }

    if (
        normalizedUsername === HARDCODED_ADMIN.username &&
        password === HARDCODED_ADMIN.password
    ) {
        return {
            status: 200,
            message: "Login successful",
            token: generateToken(),
            role: "admin",
            username: HARDCODED_ADMIN.username,
            gmail: HARDCODED_ADMIN.gmail,
            phone: HARDCODED_ADMIN.phone,
            modelsUsed: HARDCODED_ADMIN.modelsUsed,
            totalUsage: HARDCODED_ADMIN.totalUsage,
        };
    }

    return {
        status: 401,
        message: "Invalid username or password",
        token: null,
        role: null,
        username: null,
        gmail: null,
        phone: null,
        modelsUsed: 0,
        totalUsage: 0,
    };
};

export const signupUser = async (
    _signupData: SignupData
): Promise<void> => {
    // Signup is intentionally local-only; credentials are not persisted.
};