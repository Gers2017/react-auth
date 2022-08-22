import Express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
config();

import { compare, genSalt, hash } from "bcrypt";
import {
    setSessionCookie,
    clearSessionCookie,
    parseCookie,
    CookiePayload,
} from "./cookies";

import {
    sendAuthErr,
    verifyCredentials,
    verifySessionCookie,
    genSessionId,
} from "./functions";
import booksRouter from "./routers/books";

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

app.get("/users", (req, res) => {
    res.json([...users.values()]);
});

app.get("/auth-state", (req, res) => {
    const payload = parseCookie(req) as CookiePayload;
    verifySessionCookie(payload, res);
    res.json({ isLogged: true });
});

app.get("/logout", (req, res) => {
    const payload = parseCookie(req) as CookiePayload;
    verifySessionCookie(payload, res);

    sessions.set(payload.username, genSessionId());
    clearSessionCookie(res);
    res.sendStatus(200);
});

app.post("/register", async (req, res) => {
    const user = req.body as User;

    verifyCredentials(res, user);

    const { username, password } = user;
    const salt = await genSalt();
    const hashed = await hash(password, salt);
    const sessionId = genSessionId();

    if (users.get(username)) {
        return sendAuthErr(res, "Username already taken");
    }

    users.set(username, {
        username: username,
        password: hashed,
    });

    sessions.set(username, sessionId);

    setSessionCookie(res, { username, sessionId });
    res.json({ isLogged: true, username, msg: "" });
});

app.post("/login", async (req, res) => {
    const user = req.body as User;

    verifyCredentials(res, user);

    const { username, password } = user;

    const hashed = users.get(username)?.password || "";
    const isValidPassword = await compare(hashed, password);

    if (!isValidPassword) {
        return sendAuthErr(res, "Invalid username or password");
    }

    // update user session
    const sessionId = genSessionId();
    sessions.set(username, sessionId);

    setSessionCookie(res, { username, sessionId });
    res.json({ isLogged: true, username, msg: "" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
