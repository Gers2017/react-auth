import React, { createContext, useState, useContext, useEffect } from "react";
import { authState } from "./requests";
interface IContext {
    isLogged: boolean;
    setIsLogged: (v: boolean) => void;
}

const cntx = createContext<IContext>({
    isLogged: false,
    setIsLogged: () => {},
});

export function useAuthContext() {
    return useContext(cntx);
}

export function Provider({ children }: { children: React.ReactNode }) {
    const [isLogged, setIsLogged] = useState(false);

    useEffect(() => {
        const fetchIsLogged = async () => {
            const { isLogged } = await authState();
            setIsLogged(isLogged);
        };

        fetchIsLogged();
    }, []);

    return (
        <>
            <cntx.Provider value={{ isLogged, setIsLogged }}>
                {children}
            </cntx.Provider>
        </>
    );
}
