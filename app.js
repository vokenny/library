(function () {
  'use strict';

  /* DOCUMENT SELECTORS */
  const newBookExpander = document.querySelector('#new-book-button');
  const newBookContainer = document.querySelector('#new-book-container');
  const newBookForm = document.querySelector('#new-book-form');
  const matchingBookError = document.querySelector('#matching-book-error');
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

  function isValidTitle(titleElem) {
    const value = titleElem.value;
    if (!value || value?.length > 120) titleElem.classList.add('invalid');

    return value && value.length <= 120;
  }

  function isValidAuthor(authorElem) {
    const value = authorElem.value;
    if (!value || value?.length > 120) authorElem.classList.add('invalid');

    return value && value.length <= 120;
  }

  function isValidPages(pagesElem) {
    const value = parseInt(pagesElem.value);
    if (!(value > 0 && value <= 25000)) pagesElem.classList.add('invalid');

    // See https://en.wikipedia.org/wiki/List_of_longest_novels for max number of pages
    return value > 0 && value <= 25000;
  }

  function formatPages(value) {
    return parseInt(value).toFixed(0);
  }

  function isUniqueBook(formElems) {
    const title = formElems.title.value;
    const author = formElems.author.value;
    const pages = formatPages(formElems.pages.value);

    const hasMatchingBook = library().some(book =>
      book.title === title &&
      book.author === author &&
      book.pages === pages
    )

    if (hasMatchingBook) matchingBookError.classList.remove('hidden');

    return !hasMatchingBook;
  }

  function clearErrorsOnForm(formElems) {
    Array.from(formElems).forEach(elem => elem.classList.remove('invalid'));
    matchingBookError.classList.add('hidden');
  }

  function validateForm(evt) {
    const formElems = evt.target.elements;

    clearErrorsOnForm(formElems);

    if (
      isValidTitle(formElems.title) &&
      isValidAuthor(formElems.author) &&
      isValidPages(formElems.pages) &&
      isUniqueBook(formElems)
    )
    {
      addBookToLib(formElems)
    }
  }

  function addBookToLib(formElems) {
    const newBook = Object.create(Book);

    newBook.id = generateBookID();
    newBook.title = formElems.title.value;
    newBook.author = formElems.author.value;
    newBook.pages = formatPages(formElems.pages.value);
    newBook.hasRead = formElems['has-read'].checked;

    const newLibrary = [...library(), newBook];

    localStorage.setItem('library', JSON.stringify(newLibrary));
  }

  function updateBookInLib(id) {
    const newLibrary = library().map(book => {
      return book.id === id
        ? {
          ...book,
          hasRead: !book.hasRead
        }
        : book;
    });

    localStorage.setItem('library', JSON.stringify(newLibrary));
  }

  function removeBookFromLib(evt) {
    const bookId = evt.target.value;
    const newLibrary = [...library().filter(book => book.id !== bookId)];

    localStorage.setItem('library', JSON.stringify(newLibrary));
  }

  function createFieldElems(book) {
    function createFieldElem(prop) {
      const newFieldElem = document.createElement('p');

      switch (prop)
      {
        case 'id':
          newFieldElem.classList.add('book-id');
          newFieldElem.textContent = book[prop];
          break;
        case 'hasRead':
          newFieldElem.textContent = 'Read?';
          newFieldElem.append(createReadToggle(book));
          break;
        default:
          newFieldElem.textContent = prop + ': ' + book[prop];
          break;
      }

      return newFieldElem;
    }

    const fieldElems = Object.keys(book).map(prop => createFieldElem(prop));
    return fieldElems;
  }

  function createReadToggle(book) {
    const toggleElem = document.createElement('input');
    toggleElem.id = 'read-' + book.id;
    toggleElem.type = 'checkbox';
    toggleElem.value = book.id;
    toggleElem.checked = book.hasRead;

    return toggleElem;
  }

  function createRemoveButton(book) {
    const removeButtonElem = document.createElement('button');
    removeButtonElem.id = 'remove-' + book.id;
    removeButtonElem.classList.add(['button', 'secondary', 'remove']);
    removeButtonElem.value = book.id;
    removeButtonElem.textContent = 'Remove';

    return removeButtonElem;
  }

  function createBookElem(book) {
    const bookElem = document.createElement('div');
    bookElem.setAttribute('id', 'book-' + book.id);
    bookElem.classList.add('book');

    if (book.hasRead) bookElem.classList.add('read');

    const fieldElems = createFieldElems(book);
    fieldElems.forEach(elem => bookElem.append(elem));

    bookElem.append(createRemoveButton(book));
    return bookElem;
  }

  function addRemoveEventListener(bookId) {
    const button = document.querySelector('#remove-' + bookId);
    button.addEventListener('click', (evt) => {
      removeBookFromLib(evt);
      displayBooks();
    }, { once: true });
  }

  function addReadToggleEventListener(bookId) {
    const check = document.querySelector('#read-' + bookId);
    check.addEventListener('click', (evt) => {
      toggleReadStatus(evt);
    })
  }

  function addBooksToDisplay() {
    const booksToAdd = library().filter(book => !booksOnDisplayById().includes(book.id));

    booksToAdd.forEach(book => {
      shelves.prepend(createBookElem(book));
      addRemoveEventListener(book.id);
      addReadToggleEventListener(book.id);
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
    const classes = newBookForm.classList;

    classes.contains('hidden')
      ? newBookForm.classList.remove('hidden')
      : newBookForm.classList.add('hidden');
  }

  function toggleReadStatus(evt) {
    const toggleElem = evt.target;
    const bookId = toggleElem.value;
    const bookElem = document.querySelector('#book-' + bookId);

    updateBookInLib(bookId);

    toggleElem.checked
      ? bookElem.classList.add('read')
      : bookElem.classList.remove('read');
  }

  displayBooks();

  newBookExpander.addEventListener('click', toggleNewBookForm);
  newBookForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    validateForm(evt);
    displayBooks();
  });
}());