import { Response, Request } from "express";
import { COOKIE_ID } from "./constants";

export type CookiePayload = { username: string; sessionId: string };

export function setSessionCookie(res: Response, payload: CookiePayload) {
    res.cookie(COOKIE_ID, JSON.stringify(payload), {
        httpOnly: true, // visibility of this cookie in the browser
        sameSite: "lax",
        secure: process.env.NODE_ENV !== "dev", // send to only https or ssl
        expires: new Date(Date.now() + hoursToMs(24)),
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

export function parseCookie(req: Request): Partial<CookiePayload> {
    if (!req.cookies[COOKIE_ID]) return {};
    return JSON.parse(req.cookies[COOKIE_ID]);
}
