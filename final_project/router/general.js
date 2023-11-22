const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });

      return res.status(200).json({ message: `User ${username} registered` });
    }
    else {
      return res.status(400).json({ message: `User ${username} already registered` });
    }
  }
  else {
    return res.status(404).json({ message: "Must provide username and password" });
  }
});

// Get the book list available in the shop
function getBooks() {
  return new Promise((resolve, _) => {
    resolve(books);
  });
}

// Get the book list available in the shop
public_users.get('/', async function(_, res) {
  const bks = await getBooks();

  res.send(JSON.stringify(bks));
});

function getByISBN(isbn) {
  return new Promise((resolve, reject) => {
    let isbnNum = parseInt(isbn);

    if (books[isbnNum]) {
      resolve(books[isbnNum]);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} not found` });
    }
  })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function(req, res) {
  const result = await getByISBN(req.params.isbn);
  res.send(result);
});

// Get book details based on author
public_users.get('/author/:author', async function(req, res) {
  const { author } = req.params;
  const bookEntries = await getBooks();
  const filteredBooks = Object.values(bookEntries).filter((book) => book.author === author);

  res.send(filteredBooks);
});

// Get all books based on title
public_users.get('/title/:title', async function(req, res) {
  const { title } = req.params;
  const bookEntries = await getBooks();
  const filteredBooks = Object.values(bookEntries).filter((book) => book.title === title);

  res.send(filteredBooks);
});

//  Get book review
public_users.get('/review/:isbn', async function(req, res) {
  const { isbn } = req.params;
  const result = await getByISBN(isbn);

  res.send(result.reviews);
});

module.exports.general = public_users;
