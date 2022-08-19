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

export type CookiePayload = { username: string; uuid: string };

export function Auth(req: Request, res: Response, next: NextFunction) {
    if (!req.cookies.jid) {
        res.status(403).json({ isLogged: false });
        return;
    }

    const jid = JSON.parse(req.cookies.jid) as CookiePayload;
    console.log(jid, new Date().toUTCString());

    if (compareUuid(jid)) {
        next();
    } else {
        res.status(403).json({ isLogged: false });
    }
}

export function compareUuid(jid: CookiePayload) {
    return jid.uuid === (users.get(jid.username)?.uuid || "");
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
    userPasssword: string,
) {
    return await compare(userPasssword, hashedPassword);
}
