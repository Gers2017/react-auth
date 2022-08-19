import { Router } from "express";
import { Auth } from "../auth";
const app = Router();

export interface Book {
    name: string;
    author: string;
    price: number;
}

export const books = new Map<string, Book>();

export function newBook(name: string, author: string, price: number) {
    return { name, author, price } as Book;
}

export function setBook(book: Book) {
    books.set(book.name, book);
}

export function removeBook(name: string) {
    books.delete(name);
}

app.get("/", (_req, res) => {
    res.json({ books: [...books.values()] });
});

app.post("/", Auth, (req, res) => {
    const { name, author, price } = req.body;
    setBook(newBook(name, author, price));
    res.send("Book updated!");
});

app.delete("/:name", Auth, (req, res) => {
    const { name } = req.params;
    removeBook(name);
    res.send("Book deleted!");
});

export default app;
