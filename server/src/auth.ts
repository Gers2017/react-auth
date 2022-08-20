import { NextFunction, Request, Response } from "express";
import { compare, genSalt, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { users } from "./index";
import { CookiePayload } from "./cookies";

export interface User {
    username: string;
    password: string;
}

export interface UserDB extends User {
    sessionId: string;
}

export type AuthResponse = { isLogged: boolean; username: string; msg: string };

export function AuthErr(msg: string) {
    return { isLogged: false, username: "", msg };
}

export function parseCookiePayload(req: Request) {
    if (!req.cookies.jid) return null;
    return JSON.parse(req.cookies.jid) as CookiePayload;
}

export function Auth(req: Request, res: Response, next: NextFunction) {
    const jid = parseCookiePayload(req);

    if (!jid) {
        res.json({ isLogged: false });
        return;
    }

    const uuid = users.get(jid.username)?.sessionId || "";
    console.log({
        jid,
        userUUID: uuid,
        date: new Date().toUTCString(),
    });

    if (jid.sessionId !== uuid) {
        res.json({ isLogged: false });
    }

    next();
}

export function genSessionId() {
    return randomBytes(12).toString("hex");
}

export async function genHashedPassword(password: string) {
    const salt = await genSalt();
    return await hash(password, salt);
}

export async function checkPassword(
    hashedPassword: string,
    userPassword: string,
) {
    return await compare(userPassword, hashedPassword);
}
