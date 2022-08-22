import { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import { verifyAccessToken, verifyRefreshToken } from "./jwt";

export function AuthErr(msg: string) {
    return { isLogged: false, msg };
}

export function getAccessToken(req: Request) {
    return req.headers.authorization?.split(" ")[1]?.trim() || "";
}

export function MissingUserRes() {
    return AuthErr("Missing username or password");
}

export function InvalidUserRes() {
    return AuthErr("Invalid username or password");
}

export function UsernameTakenRes() {
    return AuthErr("Username already taken");
}

export function genSessionId() {
    return randomBytes(12).toString("hex");
}

export function getTokenPayload(access: string, refresh: string) {
    let payload = verifyAccessToken(access);
    if (!payload) payload = verifyRefreshToken(refresh);
    return payload;
}

export function isAuthorized(
    res: Response,
    accessToken?: string,
    refreshToken?: string,
) {
    if (!accessToken || !refreshToken) {
        res.status(400).json(AuthErr("Missing tokens"));
        return false;
    }

    let payload = getTokenPayload(accessToken, refreshToken);

    if (!payload) {
        res.status(401).json(AuthErr("Invalid or Expired tokens"));
        return false;
    }

    return true;
}

export function AuthMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const accessToken = getAccessToken(req);
    const { refreshToken } = req.cookies;
    if (isAuthorized(res, accessToken, refreshToken)) next();
}
