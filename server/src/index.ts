import Express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
config();

import { compare, genSalt, hash } from "bcrypt";
import {
    genSessionId,
    AuthErr,
    UsernameTakenRes,
    MissingUserRes,
    InvalidUserRes,
    getTokenPayload,
    getAccessToken,
} from "./functions";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} from "./jwt";
import booksRouter from "./routers/books";
import { clearRefreshCookie, setRefreshCookie } from "./cookies";

const app = Express();
const PORT = process.env.PORT || 8080;

app.use(
    cors({
        origin: "*",
    }),
);
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.send("Hello Client!");
});

app.use("/books", booksRouter);

// auth

export interface User {
    username: string;
    password: string;
}

export const users = new Map<string, User>();
export const sessions = new Map<string, string>();

export function sessionMatches(username: string, sessionId: string) {
    return (sessions.get(username) || "") === sessionId;
}

app.get("/users", (req, res) => {
    res.json([...users.values()]);
});

app.get("/auth-state", (req, res) => {
    const accessToken = getAccessToken(req);
    const { refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
        res.status(400).json(AuthErr("Missing tokens"));
        return;
    }

    const accessPayload = verifyAccessToken(accessToken);
    const refreshPayload = verifyRefreshToken(refreshToken);

    if (accessPayload) {
        console.log("valid accessToken", accessPayload);
        res.json({ isLogged: true });
        return;
    }

    if (refreshPayload) {
        console.log("Using refreshToken + new tokens", refreshPayload);
        const { username } = refreshPayload;
        const sessionId = genSessionId();

        // update sessionId
        sessions.set(username, sessionId);
        const newRefreshToken = generateRefreshToken({ username, sessionId });
        setRefreshCookie(res, newRefreshToken);
        console.log(
            "newRefreshToken",
            { username, sessionId },
            newRefreshToken,
        );

        res.json({
            isLogged: true,
            accessToken: generateAccessToken({ username, sessionId }),
        });
        return;
    }

    res.status(401).json(AuthErr("Invalid or Expired tokens"));
});

app.post("/logout", (req, res) => {
    const accessToken = getAccessToken(req);
    const { refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
        res.sendStatus(400);
        return;
    }

    let payload = getTokenPayload(accessToken, refreshToken);

    if (!payload) {
        res.sendStatus(401);
        return;
    }

    sessions.set(payload.username, genSessionId());
    clearRefreshCookie(res);
    res.sendStatus(200);
});

app.post("/register", async (req, res) => {
    const user = req.body as User;

    if (!user.username || !user.password) {
        res.status(400).json(MissingUserRes());
        return;
    }

    const { username, password } = user;

    // generate hashed password
    const salt = await genSalt();
    const hashed = await hash(password, salt);
    const sessionId = genSessionId();

    if (users.get(username)) {
        res.status(400).json(UsernameTakenRes());
        return;
    }

    // save user to users
    users.set(username, {
        username: username,
        password: hashed,
    });

    // update sessionId
    sessions.set(username, sessionId);

    const accessToken = generateAccessToken({ username, sessionId });
    const refreshToken = generateRefreshToken({ username, sessionId });

    setRefreshCookie(res, refreshToken);
    res.json({ isLogged: true, username, accessToken });
});

app.post("/login", async (req, res) => {
    const user = req.body as User;

    if (!user.username || !user.password) {
        res.status(400).json(MissingUserRes());
        return;
    }

    const { username, password } = user;
    const hashed = users.get(username)?.password || "";
    const isValidPassword = await compare(hashed, password);

    if (!users.has(username) && !isValidPassword) {
        res.status(400).json(InvalidUserRes());
        return;
    }

    // update sessionId
    const sessionId = genSessionId();
    sessions.set(username, sessionId);

    const accessToken = generateAccessToken({ username, sessionId });
    const refreshToken = generateRefreshToken({ username, sessionId });

    setRefreshCookie(res, refreshToken);
    res.json({ isLogged: true, username, accessToken });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
