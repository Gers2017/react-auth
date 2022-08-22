import { JwtPayload, sign, verify } from "jsonwebtoken";
import { sessionMatches } from "./index";
import { ACCESS_SECRET, REFRESH_SECRET } from "./constants";

type Token = { username: string; sessionId: string };
export type TokenPayload = Token & JwtPayload;

export function generateAccessToken(payload: Token) {
    return sign(payload, ACCESS_SECRET, {
        expiresIn: "15m",
    });
}

export function generateRefreshToken(payload: Token) {
    return sign(payload, REFRESH_SECRET, {
        expiresIn: "7d",
    });
}

function verifyToken(token: string, secret: string) {
    try {
        const payload = verify(token, secret) as TokenPayload;
        const { username, sessionId } = payload;
        if (!sessionMatches(username, sessionId)) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

export function verifyAccessToken(token: string) {
    return verifyToken(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
    return verifyToken(token, REFRESH_SECRET);
}
