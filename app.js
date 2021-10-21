(function () {
  'use strict';

  /* DOCUMENT SELECTORS */
  const newBookExpander = document.querySelector('#new-book-button');
  const newBookContainer = document.querySelector('#new-book-container');
  const newBookForm = document.querySelector('#new-book-form');
  const shelves = document.querySelector('#shelves');
  const bookIds = () => document.querySelectorAll('.book-id');

  const booksOnDisplayById = () => Array.from(bookIds(), id => id.textContent);

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

  function removeBookFromLib(evt) {
    const bookId = evt.target.value;
    const newLibrary = [...library().filter(book => book.id != bookId)];

    localStorage.setItem('library', JSON.stringify(newLibrary));
  }

  function createBookElem(book) {
    const bookElem = document.createElement('div');
    bookElem.setAttribute('id', 'book-' + book.id);
    bookElem.classList.add('book');

    for (let prop in book)
    {
      prop === 'id'
        ? bookElem.innerHTML += `<p class="book-id">${ book[prop] }</p>`
        : bookElem.innerHTML += `<p>${ prop }: ${ book[prop] }</p>`
    }

    bookElem.innerHTML += `<button id="remove-${ book.id }" class="button secondary remove" value="${ book.id }">Remove</button>`;

    return bookElem;
  }

  function addRemoveEventListener(bookId) {
    const button = document.querySelector('#remove-' + bookId);
    button.addEventListener('click', (evt) => {
      removeBookFromLib(evt);
      displayBooks();
    }, { once: true });
  }

  function addBooksToDisplay() {
    const booksToAdd = library().filter(book => !booksOnDisplayById().includes(book.id));

    booksToAdd.forEach(book => {
      shelves.prepend(createBookElem(book));
      addRemoveEventListener(book.id);
    });
  }

  function removeBooksFromDisplay() {
    const bookIdsToRemove = booksOnDisplayById().filter(id => !library().map(book => book.id).includes(id));

    bookIdsToRemove.forEach(id => {
      const bookElem = document.querySelector('#book-' + id);
      bookElem.remove();
    })
  }

  function displayBooks() {
    if (bookIds().length < library().length) addBooksToDisplay();
    if (bookIds().length > library().length) removeBooksFromDisplay();
  }

  function toggleNewBookForm() {
    newBookContainer.style.display === 'block'
      ? newBookContainer.style.display = 'none'
      : newBookContainer.style.display = 'block';
  }

  displayBooks();

  newBookExpander.addEventListener('click', toggleNewBookForm);
  newBookForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    addBookToLib(evt);
    displayBooks();
  });
}());