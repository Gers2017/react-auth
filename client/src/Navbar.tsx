import { useAuthContext } from "./AuthContext";
import { authState, logoutUser } from "./requests";
export default function Navbar() {
    const { isLogged, username, logout } = useAuthContext();

    const CheckAuth = async () => {
        const data = await authState();

        console.log({
            ...data,
            date: new Date().toUTCString(),
        });
    };

    async function handleLogout() {
        await logoutUser();
        logout();
    }

    return (
        <nav>
            <h1>React auth demo</h1>
            <div className="row">
                {username && <h3>{username}</h3>}
                <button onClick={CheckAuth}>Check auth</button>
                {isLogged && <button onClick={handleLogout}>Logout</button>}
            </div>
        </nav>
    );
}
