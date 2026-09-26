import type { UserBasicParams, LoginResponse } from "../lib/types";
import { request } from "./apiConfig";

async function getSelf(): Promise<UserBasicParams> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }
    const response = await request("/users/self", {
        method: "GET",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
    }, "Get self request failed");
    return response.json();
}

async function signupUser(userData: { username: string, email: string, password: string, first_name: string }): Promise<Response> {
    const response = await request("/users/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    },
    "Signup request failed"
  );
    return response;
}

async function loginUser(credentials: { username: string; password: string }): Promise<LoginResponse> {
    const response = await request("/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    }, "Login request failed");

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Login failed: ${errorText}`);
    }
    
    const data = await response.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("tokenType", data.token_type);

    return data;
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
}

export { signupUser, loginUser, logoutUser, getSelf };