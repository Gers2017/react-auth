import Express, { Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import {
    genHashedPassword,
    genUUID,
    checkPassword,
    setSessionCookie,
    User,
    UserDB,
    Auth,
} from "./auth";

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

function sendInvalidgUserError(res: Response) {
    res.status(401).json({
        isLogged: false,
        msg: "Missing username or password",
    });
}

app.get("/users", (req, res) => {
    res.json([...users.values()]);
});

app.get("/auth-state", Auth, (_req, res) => {
    res.json({ isLogged: true });
});

app.get("/logout", Auth, (_req, res) => {
    res.cookie("jid", "");
    res.sendStatus(200);
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body as User;

    if (!username || !password) {
        sendInvalidgUserError(res);
        return;
    }

    if (users.has(username)) {
        res.status(405).json({
            isLogged: false,
            msg: "Username already taken",
        });
        return;
    }

    const hashed = await genHashedPassword(password);
    const uuid = genUUID();

    users.set(username, {
        username,
        password: hashed,
        uuid,
    });

    setSessionCookie(res, username, uuid);
    res.json({ isLogged: true });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body as User;
    console.log("login:", req.body);

    if (!username || !password) {
        sendInvalidgUserError(res);
        return;
    }

    const hashed = users.get(username)?.password || "";
    const isValidPassword = await checkPassword(hashed, password);

    if (!isValidPassword) {
        res.status(405).json({
            isLogged: false,
            msg: "Invalid username or passsword",
        });
        return;
    }

    // update user uuid
    const uuid = genUUID();
    users.set(username, { ...users.get(username)!, uuid });

    setSessionCookie(res, username, uuid);
    res.json({ isLogged: true, msg: "" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
});
