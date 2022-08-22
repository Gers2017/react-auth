import { NextFunction, Request, Response } from "express";
import { sessions, User } from "./index";
import { CookiePayload, parseCookie } from "./cookies";
import { randomBytes } from "crypto";

export function AuthErr(msg: string) {
    return { isLogged: false, username: "", msg };
}

export function verifyCredentials(res: Response, user: Partial<User>) {
    if (!user.username || !user.password) {
        res.status(400).json(AuthErr("Missing username or password"));
    }
}

export function sendAuthErr(res: Response, msg: string) {
    res.status(400).json({ isLogged: false, msg });
}

export function verifySessionCookie(
    payload: Partial<CookiePayload>,
    res: Response,
) {
    if (!payload.username || !payload.sessionId) {
        return sendAuthErr(res, "Missing authorization token from request");
    }

    if (!sessions.get(payload.username) || "" === payload.sessionId) {
        return sendAuthErr(res, "Invalid authorization token");
    }
}

export function genSessionId() {
    return randomBytes(12).toString("hex");
}

export function AuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    let payload = parseCookie(req);
    verifySessionCookie(payload, res);
    next();
}
