import { Response, Request } from "express";
import { COOKIE_ID } from "./constants";
import { sessions } from "./index";

export type CookiePayload = { username: string; sessionId: string };

export function setSessionCookie(res: Response, payload: object) {
    setHttpOnlyCookie(
        res,
        COOKIE_ID,
        payload,
        new Date(Date.now() + hoursToMs(1)),
    );
}

export function setHttpOnlyCookie( // <-- for the refreshToken
    res: Response,
    cookieName: string,
    cookiePayload: object | string,
    expires: Date,
) {
    const payload =
        typeof cookiePayload === "object"
            ? JSON.stringify(cookiePayload)
            : cookiePayload;
    res.cookie(cookieName, payload, {
        httpOnly: true, // visibility of this cookie in the browser
        sameSite: "lax",
        secure: process.env.NODE_ENV !== "dev", // send to only https or ssl
        expires,
    });
}

function hoursToMs(h: number) {
    return h * 60 * 60 * 1000;
}

export function clearSessionCookie(res: Response) {
    res.clearCookie(COOKIE_ID, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0,
    });
}

export function verifySessionCookie(req: Request) {
    if (!req.cookies[COOKIE_ID]) return null;
    let payload = JSON.parse(req.cookies[COOKIE_ID]) as Partial<CookiePayload>;

    if (!payload.username || !payload.sessionId) {
        return null;
    }

    const sessionId = sessions.get(payload.username) || "";
    if (sessionId !== payload.sessionId) {
        return null;
    }

    return payload as CookiePayload;
}

export function setRefreshCookie(res: Response, payload: string) {
    setHttpOnlyCookie(
        res,
        "refreshToken",
        payload,
        new Date(Date.now() + 7 * hoursToMs(24)),
    );
}

export function clearRefreshCookie(res: Response) {
    setHttpOnlyCookie(res, "refreshToken", "", new Date());
}
