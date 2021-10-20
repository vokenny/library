(function () {
  'use strict';

  const newBookForm = document.querySelector('#new-book-form');
  const shelves = document.querySelector('#shelves');

  let library = [
    {
      title: 'test',
      author: 'author',
      pages: 123,
      hasRead: false
    },
    {
      title: 'test',
      author: 'author',
      pages: 345,
      hasRead: true
    }
  ];

  function Book(title, author, pages, hasRead) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.hasRead = hasRead;
  }

  function addBookToLib(evt) {
    evt.preventDefault();

    const formElems = evt.target.elements;
    const newBook = Object.create(Book);
    
    newBook.title = formElems.title.value;
    newBook.author = formElems.author.value;
    newBook.pages = formElems.pages.value;
    newBook.hasRead = formElems['has-read'].checked;

    library = library.concat(newBook);
  }

  function addBookToDisplay() {
    const newBook = library.slice(-1)[0];
    shelves.append(createBookElem(newBook));
  }

  function createBookElem(book) {
    const bookElem = document.createElement('div');
    bookElem.classList.add('book');

    for (let prop in book) {
      bookElem.innerHTML += `<p>${prop}: ${book[prop]}</p>`
    }

    return bookElem;
  }

  function displayBooks() {
    library.forEach(book => shelves.append(createBookElem(book)));
  }

  displayBooks();

  newBookForm.addEventListener('submit', (evt) => { addBookToLib(evt), addBookToDisplay() });
}());