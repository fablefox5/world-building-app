import { request } from "./apiConfig";
import type { Stats, UserBasicParams, Page } from "../lib/types";

// export type AdminUser = {
//     userId: number;
//     username: string;
//     first_name?: string;
//     email?: string;
//     is_admin?: boolean;
// };

export async function getUsers(page = 1, size = 5, query?: string): Promise<Page<UserBasicParams>> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }
    const response = await request(`/users?page=${page}&size=${size}${query ? `&query=${query}` : ""}`, {
        method: "GET",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
    }, "Get all users request failed");
    return response.json();
}

export async function deleteUser(userId: number): Promise<void> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }
    const response = await request(`/users/${userId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
    }, "Delete user request failed");
    if (!response.ok) {
        throw new Error("Failed to delete user");
    }
}

export async function getStats(): Promise<Stats> {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType");
    if (!token || !tokenType) {
        throw new Error("No token found in local storage");
    }
    const response = await request("/users/stats", {
        method: "GET",
        headers: {
            "Authorization": `${tokenType} ${token}`,
            "Content-Type": "application/json",
        },
    }, "Get stats request failed");
    return response.json();
}