const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require("axios");
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered" });
  } else {
    return res
      .status(400)
      .json({ message: "Username already exists or is invalid" });
  }
});

public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

public_users.get("/async", async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get("/async/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({ message: "Error fetching book" });
  }
});

public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const matchingBooks = {};
  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks[isbn] = books[isbn];
    }
  }
  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});

public_users.get("/async/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(
      `http://localhost:5000/author/${encodeURIComponent(author)}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

public_users.get("/title/:title", function (req, res) {
  const title = decodeURIComponent(req.params.title);
  const matchingBooks = {};
  for (let isbn in books) {
    if (
      books[isbn].title &&
      books[isbn].title.toLowerCase().includes(title.toLowerCase())
    ) {
      matchingBooks[isbn] = books[isbn];
    }
  }
  if (Object.keys(matchingBooks).length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

public_users.get("/async/title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get(
      `http://localhost:5000/title/${encodeURIComponent(title)}`
    );
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res
        .status(404)
        .json({ message: "No books found with this title" });
    }
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews || {});
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
module.exports.isValid = isValid;
module.exports.users = users;
