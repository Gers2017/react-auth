import { User } from "../App";
import { Book } from "../books";
import { request, post, postToJson } from "./fetcher";
const SERVER_URL = "http://localhost:8080";

function url(...routes: string[]) {
    return `${SERVER_URL}/${routes.join("/")}`;
}

async function postReq(url: string, body: object) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    return await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers,
        credentials: "include",
    });
}

export async function ping() {
    const res = await request("POST", url("register"), {
        body: { username: "USER1", password: "123" },
    });
    console.log(await res.json());

    const res3 = await postReq(url("register"), {
        username: "USER2",
        password: "123",
    });

    console.log(await res3.json());

    const res2 = await request("GET", url("users"));
    console.log(await res2.json());
}

type AuthResponse = { isLogged: boolean; username: string; msg: string };

export async function registerUser(user: User): Promise<AuthResponse> {
    try {
        return await postToJson<AuthResponse>(url("register"), user);
    } catch (error) {
        console.error(error);
        return { isLogged: false, msg: "", username: "" };
    }
}

export async function loginUser(user: User): Promise<AuthResponse> {
    try {
        return await postToJson<AuthResponse>(url("login"), user);
    } catch (error) {
        console.error(error);
        return { isLogged: false, msg: "", username: "" };
    }
}

type AuthStateResponse = { isLogged: boolean };

export async function authState(): Promise<AuthStateResponse> {
    try {
        const res = await request("GET", url("auth-state"));
        return (await res.json()) as AuthStateResponse;
    } catch (error) {
        return { isLogged: false };
    }
}

export async function getBooks() {
    const res = await fetch(url("books"));
    return (await res.json()) as Book[];
}

export async function sendBook(book: Book): Promise<boolean> {
    try {
        const res = await post(url("books"), book);
        return res.status === 200;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function deleteBook(name: string): Promise<boolean> {
    try {
        const res = await request("DELETE", url("books", name));
        return res.status === 200;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function logoutUser(): Promise<boolean> {
    try {
        const res = await request("GET", url("logout"));
        return res.status === 200;
    } catch (e) {
        console.error(e);
        return false;
    }
}
