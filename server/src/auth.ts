import { NextFunction, Request, Response } from "express";
import { compare, genSalt, hash } from "bcrypt";
import { randomBytes } from "crypto";
import { users } from "./index";

export interface User {
    username: string;
    password: string;
}

export interface UserDB extends User {
    uuid: string;
}

export type AuthResponse = { isLogged: boolean; username: string; msg: string };

export function AuthErr(msg: string) {
    return { isLogged: false, username: "", msg };
}

export type CookiePayload = { username: string; uuid: string };

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

    const uuid = users.get(jid.username)?.uuid || "";
    console.log({
        jid,
        userUUID: uuid,
        date: new Date().toUTCString(),
    });

    if (jid.uuid !== uuid) {
        res.json({ isLogged: false });
    }

    next();
}

export function setSessionCookie(
    res: Response,
    username: string,
    uuid: string,
) {
    const data: CookiePayload = {
        username,
        uuid,
    };

    // ⚠️ Setting the cookie ⚠️
    res.cookie("jid", JSON.stringify(data), {
        // value which specifies whether or not this cookie can only be retrieved over an SSL or HTTPS connection
        secure: process.env.NODE_ENV !== "dev",
        httpOnly: true,
        sameSite: "none",
        expires: new Date(Date.now() + hoursToMs(1)),
    });
}

function hoursToMs(h: number) {
    return h * 60 * 60 * 1000;
}

export function genUUID() {
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
