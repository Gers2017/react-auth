import { User } from "../App";
import { Book } from "../books";
import { request, post, postToJson } from "./fetcher";
import { getToken, setToken } from "../tokens";

const SERVER_URL = "http://localhost:8080";

function url(...routes: string[]) {
    return `${SERVER_URL}/${routes.join("/")}`;
}

export async function ping() {
    try {
        const res = await request("POST", url("register"), {
            body: { username: "USER1", password: "123" },
        });

        let data = await res.json();
        if (!data.isLogged) return;
        let { accessToken } = data;
        console.log(data);

        const res2 = await request("GET", url("auth-state"), {
            headers: { authorization: `Bearer ${accessToken}` },
        });

        console.log(await res2.json());

        const res3 = await request("POST", url("logout"), {
            headers: { authorization: `Bearer ${accessToken}` },
        });

        console.log(res3.status, res3.statusText);
    } catch (e) {
        console.error(e);
    }
}

type AuthResponse =
    | {
          isLogged: true;
          username: string;
          accessToken: string;
      }
    | {
          isLogged: false;
          msg: string;
      };

export async function registerUser(user: User): Promise<AuthResponse> {
    try {
        return await postToJson<AuthResponse>(url("register"), user);
    } catch (error) {
        console.error(error);
        return { isLogged: false, msg: "" };
    }
}

export async function loginUser(user: User): Promise<AuthResponse> {
    try {
        return await postToJson<AuthResponse>(url("login"), user);
    } catch (error) {
        console.error(error);
        return { isLogged: false, msg: "" };
    }
}

type AuthStateResponse = { isLogged: boolean; accessToken?: string };

export async function authState(): Promise<AuthStateResponse> {
    try {
        const res = await request("GET", url("auth-state"), {
            headers: { authorization: `Bearer ${getToken()}` },
        });
        const data: AuthStateResponse = await res.json();
        if (data.accessToken) setToken(data.accessToken);
        return data;
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
        const res = await request("DELETE", url("books", name), {
            headers: { authorization: `Bearer ${getToken()}` },
        });
        return res.status === 200;
    } catch (e) {
        console.error(e);
        return false;
    }
}

export async function logoutUser(): Promise<boolean> {
    try {
        const res = await request("POST", url("logout"), {
            headers: { authorization: `Bearer ${getToken()}` },
        });
        return res.status === 200;
    } catch (e) {
        console.error(e);
        return false;
    }
}
