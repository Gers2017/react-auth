import { FormEvent, useRef } from "react";

export interface Book {
    name: string;
    author: string;
    price: number;
}

export type AddBookAction = (book: Book) => Promise<void>;
export type DeleteBookAction = (name: string) => Promise<void>;

export function BookForm({ addAction }: { addAction: AddBookAction }) {
    const bookName = useRef<HTMLInputElement>(null);
    const bookAuthor = useRef<HTMLInputElement>(null);
    const bookPrice = useRef<HTMLInputElement>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!bookName.current || !bookAuthor.current || !bookPrice.current) {
            return;
        }

        const book: Book = {
            name: bookName.current.value,
            author: bookAuthor.current.value,
            price: bookPrice.current.valueAsNumber,
        };

        await addAction(book);
    }

    return (
        <form onSubmit={handleSubmit} className="column container">
            <h2>Book form</h2>
            <input
                required
                ref={bookName}
                type="text"
                name="book-name"
                placeholder="Book name"
            />
            <input
                required
                ref={bookAuthor}
                type="text"
                name="book-author"
                placeholder="Author"
            />
            <input
                required
                ref={bookPrice}
                type="number"
                name="book-price"
                placeholder="3000"
            />
            <button type="submit">Send</button>
        </form>
    );
}

export function BookItem({
    book: { name, author, price },
    deleteAction,
}: {
    book: Book;
    deleteAction: DeleteBookAction;
}) {
    async function handleDelete() {
        await deleteAction(name);
    }

    return (
        <li className="book-item">
            <h2>{name}</h2>
            <p>{author}</p>
            <strong>{price}</strong>
            <button onClick={handleDelete}>delete</button>
        </li>
    );
}

export function BooksList({
    books,
    deleteAction,
}: {
    books: Book[];
    deleteAction: DeleteBookAction;
}) {
    return (
        <ul>
            {books.length > 0 ? (
                books.map((b) => (
                    <BookItem
                        key={b.name}
                        book={b}
                        deleteAction={deleteAction}
                    />
                ))
            ) : (
                <p>No books...</p>
            )}
        </ul>
    );
}
