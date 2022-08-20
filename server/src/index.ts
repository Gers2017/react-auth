import Express, { Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
    genHashedPassword,
    checkPassword,
    User,
    UserDB,
    Auth,
    AuthErr,
    AuthResponse,
    parseCookiePayload,
    genSessionId,
} from "./auth";

import { setJidCookie, clearJidCookie } from "./cookies";

import booksRouter from "./routers/books";
import { config } from "dotenv";
config();

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

export const users = new Map<string, UserDB>();
const changeUserUuid = (username: string) => {
    const user = users.get(username);
    if (!user) return;
    users.set(username, { ...user, sessionId: genSessionId() });
};

function sendMissingUser(res: Response) {
    res.status(400).json(AuthErr("Missing username or password"));
}

app.get("/users", (req, res) => {
    res.json([...users.values()]);
});

app.get("/auth-state", Auth, (_req, res) => {
    res.json({ isLogged: true });
});

app.get("/logout", Auth, (req, res) => {
    const jid = parseCookiePayload(req)!;
    changeUserUuid(jid.username);
    clearJidCookie(res);
    res.sendStatus(200);
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body as User;

    if (!username || !password) {
        sendMissingUser(res);
        return;
    }

    if (users.has(username)) {
        res.status(400).json(AuthErr("Username already taken"));
        return;
    }

    const hashed = await genHashedPassword(password);
    const sessionId = genSessionId();

    users.set(username, {
        username,
        password: hashed,
        sessionId,
    });

    setJidCookie(res, { username, sessionId });
    res.json({ isLogged: true, username, msg: "" } as AuthResponse);
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body as User;

    if (!username || !password) {
        sendMissingUser(res);
        return;
    }

    const hashed = users.get(username)?.password || "";
    const isValidPassword = await checkPassword(hashed, password);

    if (!isValidPassword) {
        res.status(400).json(AuthErr("Invalid username or password"));
        return;
    }

    // update user uuid
    const sessionId = genSessionId();
    users.set(username, { ...users.get(username)!, sessionId });

    setJidCookie(res, { username, sessionId });
    res.json({ isLogged: true, username, msg: "" } as AuthResponse);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
