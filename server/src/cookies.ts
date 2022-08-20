import { Response } from "express";

export type CookiePayload = { username: string; sessionId: string };

export function setJidCookie(res: Response, payload: CookiePayload) {
    res.cookie("jid", JSON.stringify(payload), {
        httpOnly: true, // visibility of this cookie in the browser
        sameSite: "lax",
        secure: process.env.NODE_ENV !== "dev", // send to only https or ssl
        expires: new Date(Date.now() + hoursToMs(24)),
    });
}

function hoursToMs(h: number) {
    return h * 60 * 60 * 1000;
}

export function clearJidCookie(res: Response) {
    res.clearCookie("jid", {
        maxAge: 0,
        httpOnly: true,
    });
}
