import React, { createContext, useState, useContext, useEffect } from "react";
import { authState } from "./requests";
interface IContext {
    isLogged: boolean;
    setIsLogged: (v: boolean) => void;

    username: string;
    setUsername: (v: string) => void;

    login: (username: string) => void;
    logout: () => void;
}

const context = createContext<IContext>({
    isLogged: false,
    setIsLogged: () => {},
    username: "",
    setUsername: () => {},
    login: () => {},
    logout: () => {},
});

export function useAuthContext() {
    return useContext(context);
}

export function Provider({ children }: { children: React.ReactNode }) {
    const [isLogged, setIsLogged] = useState(false);
    const [username, setUsername] = useState("");

    function logout() {
        setIsLogged(false);
        setUsername("");
    }

    function login(username: string) {
        setIsLogged(true);
        setUsername(username);
    }

    useEffect(() => {
        const fetchIsLogged = async () => {
            const { isLogged: ok } = await authState();
            setIsLogged(ok);
            !ok && setUsername("");
        };

        fetchIsLogged();
    }, []);

    return (
        <>
            <context.Provider
                value={{
                    isLogged,
                    setIsLogged,
                    username,
                    setUsername,
                    login,
                    logout,
                }}
            >
                {children}
            </context.Provider>
        </>
    );
}
