import { useEffect, useState } from "react";
import { getBooks, Book } from "./requests";

export default function Content() {
    const [books, setBooks] = useState<Book[]>([]);
    useEffect(() => {
        getBooks().then((_books) => {
            setBooks(_books);
        });
    }, []);

    return (
        <div>
            <h2>Super secret Content 🤫</h2>
            <ul>
                {books.length > 0 &&
                    books.map((b) => (
                        <li key={b.name}>
                            <h3>{b.name}</h3>
                            <p>{b.author}</p>
                            <p>{b.price}</p>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
