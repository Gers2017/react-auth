import { FormEvent, useRef, useState } from "react";
import { Provider, useAuthContext } from "./AuthContext";
import { authState, loginUser, registerUser } from "./requests";

import Content from "./Content";

export interface User {
    username: string;
    password: string;
}

function App() {
    return (
        <div className="app">
            <Provider>
                <nav>
                    <h1>React auth demo</h1>
                </nav>
                <main>
                    <RegisterForm />
                    <Protected component={<Content />} />
                </main>
            </Provider>
        </div>
    );
}

function RegisterForm() {
    const { setIsLogged } = useAuthContext();
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

    async function handleSumbit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!usernameInput.current || !passwordInput.current) return;

        const user: User = {
            username: usernameInput.current.value,
            password: passwordInput.current.value,
        };

        clearInputs();
        const func = isLoginForm ? loginUser : registerUser;
        const { isLogged, msg } = await func(user);
        msg && setErrorMsg(msg);
        isLogged && setIsLogged(isLogged);
    }

    return (
        <div>
            <form onSubmit={handleSumbit} className="column">
                <h2>{formState} form</h2>

                {errorMsg !== "" && <p className="error">{errorMsg}</p>}

                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    ref={usernameInput}
                />

                <label htmlFor="password">Password</label>
                <input
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
                <button
                    onClick={async () => {
                        const { isLogged } = await authState();
                        console.log({
                            isLogged,
                            date: new Date().toUTCString(),
                        });
                    }}
                >
                    Check auth
                </button>
            </div>
        </div>
    );
}

function Protected({ component }: { component: React.ReactNode }) {
    const { isLogged } = useAuthContext();

    return (
        <div>
            {isLogged ? (
                <>{component}</>
            ) : (
                <>
                    <h2>⚠️ Protected Content, please Login ⚠️</h2>
                </>
            )}
        </div>
    );
}

export default App;
