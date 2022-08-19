type Method = "GET" | "POST" | "DELETE" | "PUT" | "HEAD" | "PATCH";

interface Options {
    body?: object;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
}

export function request(
    method: Method,
    url: string,
    { body, headers, credentials }: Options = {},
) {
    const _headers = new Headers();
    _headers.append("Content-Type", "application/json");

    if (headers) {
        Object.entries(_headers).forEach(([key, value]) => {
            _headers.append(key, value);
        });
    }

    return fetch(url, {
        method,
        headers: _headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: credentials || "include",
    });
}

export async function post(url: string, body: object) {
    return await request("POST", url, { body });
}

export async function postToJson<T = object>(url: string, body: object) {
    const res = await post(url, body);
    return (await res.json()) as T;
}
