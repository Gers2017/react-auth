import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Provider, useAuthContext } from "./AuthContext";
import {
    deleteBook,
    getBooks,
    loginUser,
    ping,
    registerUser,
    sendBook,
} from "./requests";
import { BooksList, BookForm, Book } from "./books";
import Navbar from "./Navbar";
import { setToken } from "./tokens";

export interface User {
    username: string;
    password: string;
}

function App() {
    return (
        <div className="app">
            <Provider>
                <Navbar />
                <section className="content">
                    <Protected fallback={<RegisterForm />}>
                        <Main />
                    </Protected>
                    <button onClick={ping}>Ping!</button>
                </section>
            </Provider>
        </div>
    );
}

function Main() {
    const [books, setBooks] = useState<Book[]>([]);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        getBooks().then((_books) => {
            setBooks(_books);
        });
    }, [refresh]);

    async function addBookAction(book: Book) {
        const ok = await sendBook(book);
        ok && setBooks((prev) => [...prev, book]);
    }

    async function deleteBookAction(name: string) {
        const ok = await deleteBook(name);
        ok && setBooks((perv) => perv.filter((it) => it.name !== name));
    }

    function triggerRefresh() {
        setRefresh((prev) => !prev);
    }

    return (
        <main>
            <BookForm addAction={addBookAction} />
            <section>
                <h2>Super secret Content 🤫</h2>
                <br />
                <button onClick={triggerRefresh}>Refresh from server</button>
                <BooksList books={books} deleteAction={deleteBookAction} />
            </section>
        </main>
    );
}

function RegisterForm() {
    const { login } = useAuthContext();
    const [errorMsg, setErrorMsg] = useState("");
    const usernameInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);
    const [isLoginForm, setIsLoginForm] = useState(false);

    const formState = isLoginForm ? "Login" : "Register";

    function toggleForm() {
        setIsLoginForm((prev) => !prev);
    }

    function clearInputs() {
        usernameInput.current!.value = "";
        passwordInput.current!.value = "";
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!usernameInput.current || !passwordInput.current) return;

        const user: User = {
            username: usernameInput.current.value,
            password: passwordInput.current.value,
        };

        clearInputs();
        const func = isLoginForm ? loginUser : registerUser;
        const data = await func(user);

        if (data.isLogged) {
            login(data.username);
            setToken(data.accessToken);
        } else {
            setErrorMsg(data.msg);
        }
    }

    return (
        <div className="container margin-y">
            <form onSubmit={handleSubmit} className="column">
                <h2>{formState} form</h2>

                {errorMsg && <p className="error">{errorMsg}</p>}

                <label htmlFor="username">Username</label>
                <input
                    required
                    type="text"
                    name="username"
                    id="username"
                    ref={usernameInput}
                />

                <label htmlFor="password">Password</label>
                <input
                    required
                    type="password"
                    name="password"
                    id="password"
                    ref={passwordInput}
                />
                <button type="submit">{formState}</button>
            </form>
            <div className="row">
                <button onClick={toggleForm}>
                    Use {isLoginForm ? "register" : "login"} form
                </button>
            </div>
        </div>
    );
}

const Protected: React.FC<{
    children: React.ReactNode;
    fallback: React.ReactNode;
}> = ({ children, fallback }) => {
    const { isLogged } = useAuthContext();
    return (
        <>
            {isLogged && children}
            {!isLogged && fallback}
        </>
    );
};

export default App;
