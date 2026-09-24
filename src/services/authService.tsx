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

const demoUser: Account = {
    id: "demo-user",
    username: "user",
    password: "user@123",
    gmail: "user@gmail.com",
    phone: "9876543210",
    role: "user",
    modelsUsed: 0,
    totalUsage: 0,
};

const demoAdmin: Account = {
    id: "demo-admin",
    username: "admin",
    password: "admin@123",
    role: "admin",
};

const API_URL = "http://localhost:3001";

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
    const user =
        demoUser.username === normalizedUsername &&
        demoUser.password === password
            ? demoUser
            : null;

    const isAdmin =
        demoAdmin.username === normalizedUsername &&
        demoAdmin.password === password;

    if (user) {
        return {
            status: 200,
            message: "Login successful",
            token: generateToken(),
            role: "user",
            username: user.username,
            gmail: user.gmail ?? null,
            phone: user.phone ?? null,
            modelsUsed: user.modelsUsed ?? 0,
            totalUsage: user.totalUsage ?? 0,
        };
    }

    if (isAdmin) {
        return {
            status: 200,
            message: "Login successful",
            token: generateToken(),
            role: "admin",
            username: demoAdmin.username,
            gmail: null,
            phone: null,
            modelsUsed: 0,
            totalUsage: 0,
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
    signupData: SignupData
): Promise<void> => {

    const newUser = {
        username: signupData.username,
        gmail: signupData.gmail,
        phone: signupData.phone,
        password: signupData.password,
        role: "user",
    };

    const response = await fetch(
        `${API_URL}/users`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
        }
    );

    if (!response.ok) {
        throw new Error("Signup failed");
    }
};