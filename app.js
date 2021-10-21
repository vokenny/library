(function () {
  'use strict';

  /* DOCUMENT SELECTORS */
  const newBookForm = document.querySelector('#new-book-form');
  const shelves = document.querySelector('#shelves');
  const bookIds = () => document.querySelectorAll('.book-id');

  const library = () => localStorage.getItem('library') ? JSON.parse(localStorage.getItem('library')) : [];

  function generateBookID() {
    const array = new Uint32Array(1);
    const uuid = window.crypto.getRandomValues(array)[0];

    return uuid.toString();
  }

  function Book(id, title, author, pages, hasRead) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.hasRead = hasRead;
  }

  function addBookToLib(evt) {
    const formElems = evt.target.elements;
    const newBook = Object.create(Book);
    
    newBook.id = generateBookID();
    newBook.title = formElems.title.value;
    newBook.author = formElems.author.value;
    newBook.pages = formElems.pages.value;
    newBook.hasRead = formElems['has-read'].checked;

    const newLibrary = [...library(), newBook];

    localStorage.setItem('library', JSON.stringify(newLibrary));
  }

  function createBookElem(book) {
    const bookElem = document.createElement('div');
    bookElem.classList.add('book');

    for (let prop in book) {
      prop === 'id' 
        // Attach a hidden book ID to the book element
        ? bookElem.innerHTML += `<p class="book-id" hidden>${book[prop]}</p>`
        : bookElem.innerHTML += `<p>${prop}: ${book[prop]}</p>`
    }

    return bookElem;
  }

  function displayBooks() {
    if (bookIds().length > 0) {
      const bookIdsOnDisplay = Array.from(bookIds()).map(id => id.textContent);
      const missingBooks = library().filter(book => !bookIdsOnDisplay.includes(book.id));

      missingBooks.forEach(book => shelves.prepend(createBookElem(book)));
    } else {
      library().forEach(book => shelves.prepend(createBookElem(book)));
    }
  }

  displayBooks();

  newBookForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    addBookToLib(evt);
    displayBooks();
  });
}());