import { User } from "./App";
const SERVER_URL = "http://localhost:8080";

function URL(...routes: string[]) {
    return `${SERVER_URL}/${routes.join("/")}`;
}

export async function post(url: string, body: any) {
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
    const res = await fetch(SERVER_URL);
    console.log(res);
}

type IsLoggedResponse = { isLogged: boolean; msg?: string };

export async function registerUser(user: User): Promise<IsLoggedResponse> {
    try {
        const res = await post(URL("register"), user);
        return (await res.json()) as IsLoggedResponse;
    } catch (error) {
        console.error(error);
        return { isLogged: false, msg: "" };
    }
}

export async function loginUser(user: User): Promise<IsLoggedResponse> {
    try {
        const res = await post(URL("login"), user);
        return (await res.json()) as IsLoggedResponse;
    } catch (error) {
        console.error(error);
        return { isLogged: false, msg: "" };
    }
}

type AuthStateResponse = { isLogged: boolean };

export async function authState(): Promise<AuthStateResponse> {
    try {
        const res = await fetch(URL("auth-state"), {
            credentials: "include",
        });
        return (await res.json()) as AuthStateResponse;
    } catch (error) {
        console.error(error);
        return { isLogged: false };
    }
}

export interface Book {
    name: string;
    author: string;
    price: number;
}

export async function getBooks() {
    const res = await fetch(URL("books"));
    const { books } = (await res.json()) as { books: Book[] };
    return books;
}
