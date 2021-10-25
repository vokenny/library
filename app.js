(function () {
  'use strict';

  /* DOCUMENT SELECTORS */
  const newBookExpander = document.querySelector('#new-book-button');
  const newBookContainer = document.querySelector('#new-book-container');
  const newBookForm = document.querySelector('#new-book-form');
  const matchingBookError = document.querySelector('#matching-book-error');
  const cancelButton = document.querySelector('#cancel-new-book');
  const shelves = document.querySelector('#shelves');
  const bookIds = () => document.querySelectorAll('.book-id');

  const booksOnDisplayById = () => Array.from(bookIds(), id => id.textContent);

  const Book = {
    toggleRead: function () {
      this.hasRead = !this.hasRead;
    }
  }

  const Library = {
    getBooks: function () {
      const booksData = localStorage.getItem('library') ? JSON.parse(localStorage.getItem('library')) : [];

      return booksData.map(bookData => {
        const book = Object.create(Book);
        book.id = bookData.id;
        book.title = bookData.title;
        book.author = bookData.author;
        book.pages = bookData.pages;
        book.hasRead = bookData.hasRead;

        return book
      });
    },

    getBookById: function (id) {
      return this.getBooks().find(book => book.id === id);
    },

    addBook: function (title, author, pages, hasRead) {
      const newBook = Object.create(Book);
      newBook.id = generateBookID();
      newBook.title = title;
      newBook.author = author;
      newBook.pages = formatPages(pages);
      newBook.hasRead = hasRead;

      const newLibrary = [...this.getBooks(), newBook];
      localStorage.setItem('library', JSON.stringify(newLibrary));
    },

    removeBook: function (id) {
      const newLibrary = [...this.getBooks().filter(book => book.id !== id)];
      localStorage.setItem('library', JSON.stringify(newLibrary));
    },

    toggleReadOnBook: function (id) {
      const toggleBook = this.getBookById(id);
      toggleBook.toggleRead();

      const newLibrary = this.getBooks().map(book => book.id === toggleBook.id ? toggleBook : book);
      localStorage.setItem('library', JSON.stringify(newLibrary));
    },

    hasMatchingBook: function (title, author, pages) {
      return this.getBooks().some(book =>
        book.title === title &&
        book.author === author &&
        book.pages === pages
      )
    },
  }

  const lib = Object.create(Library);

  function generateBookID () {
    const array = new Uint32Array(1);
    const uuid = window.crypto.getRandomValues(array)[0];

    return uuid.toString();
  }

  const isValidTitle = (title) => title && title.length <= 120;

  const isValidAuthor = (author) => author && author.length <= 120;

  const isValidPages = (pages) => {
    const value = parseInt(pages);
    // See https://en.wikipedia.org/wiki/List_of_longest_novels for max number of pages
    return value > 0 && value <= 25000;
  }

  const formatPages = (value) => parseInt(value).toFixed(0);

  function isUniqueBook (formElems) {
    const title = formElems.title.value;
    const author = formElems.author.value;
    const pages = formatPages(formElems.pages.value);

    return !lib.hasMatchingBook(title, author, pages);
  }

  function clearErrorsOnForm (formElems) {
    Array.from(formElems).forEach(elem => elem.classList.remove('invalid'));
    matchingBookError.classList.add('hidden');
  }

  function validateForm (evt) {
    const formElems = evt.target.elements;
    const titleElem = formElems.title;
    const authorElem = formElems.author;
    const pagesElem = formElems.pages;
    const hasReadElem = formElems['has-read'];

    clearErrorsOnForm(formElems);

    switch (true) {
      case !isValidTitle(titleElem.value):
        titleElem.classList.add('invalid');
        break;
      case !isValidAuthor(authorElem.value):
        authorElem.classList.add('invalid');
        break;
      case !isValidPages(pagesElem.value):
        pagesElem.classList.add('invalid');
        break;
      case !isUniqueBook(formElems):
        matchingBookError.classList.remove('hidden');
        break;
      default:
        lib.addBook(
          titleElem.value,
          authorElem.value,
          pagesElem.value,
          hasReadElem.checked
        )
    }
  }

  function createFieldElems (book) {
    function createFieldElem (prop) {
      const newFieldElem = document.createElement('p');

      switch (prop) {
        case 'id':
          newFieldElem.classList.add('book-id', 'hidden');
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

  function createReadToggle (book) {
    const toggleElem = document.createElement('input');
    toggleElem.id = 'read-' + book.id;
    toggleElem.type = 'checkbox';
    toggleElem.value = book.id;
    toggleElem.checked = book.hasRead;

    return toggleElem;
  }

  function createRemoveButton (book) {
    const removeButtonElem = document.createElement('button');
    removeButtonElem.id = 'remove-' + book.id;
    removeButtonElem.classList.add(['button', 'secondary', 'remove']);
    removeButtonElem.value = book.id;
    removeButtonElem.textContent = 'Remove';

    return removeButtonElem;
  }

  function createBookElem (book) {
    const bookElem = document.createElement('div');
    bookElem.setAttribute('id', 'book-' + book.id);
    bookElem.classList.add('book');

    if (book.hasRead) bookElem.classList.add('read');

    const fieldElems = createFieldElems(book);
    fieldElems.forEach(elem => bookElem.append(elem));

    bookElem.append(createRemoveButton(book));
    return bookElem;
  }

  function addRemoveEventListener (bookId) {
    const button = document.querySelector('#remove-' + bookId);
    button.addEventListener('click', (evt) => {
      lib.removeBook(evt.target.value);
      displayBooks();
    }, { once: true });
  }

  function addReadToggleEventListener (bookId) {
    const check = document.querySelector('#read-' + bookId);
    check.addEventListener('click', (evt) => {
      toggleReadStatus(evt);
    })
  }

  function addBooksToShelves () {
    const booksToAdd = lib.getBooks().filter(book => !booksOnDisplayById().includes(book.id));

    booksToAdd.forEach(book => {
      shelves.prepend(createBookElem(book));
      addRemoveEventListener(book.id);
      addReadToggleEventListener(book.id);
    });
  }

  function removeBooksFromShelves () {
    const bookIdsToRemove = booksOnDisplayById().filter(id => !lib.getBooks().map(book => book.id).includes(id));

    bookIdsToRemove.forEach(id => {
      const bookElem = document.querySelector('#book-' + id);
      bookElem.remove();
    })
  }

  function displayBooks () {
    const shelfLength = bookIds().length;
    const libLength = lib.getBooks().length;

    // Designed it this way to avoid re-rendering the whole library for each change
    // It only adds or removes the specific book within the respective functions
    if (shelfLength < libLength) addBooksToShelves();
    if (shelfLength > libLength) removeBooksFromShelves();
  }

  function toggleNewBookForm () {
    const classes = newBookContainer.classList;

    classes.contains('hidden')
      ? newBookContainer.classList.remove('hidden')
      : newBookContainer.classList.add('hidden');
  }

  function toggleReadStatus (evt) {
    const toggleElem = evt.target;
    const bookId = toggleElem.value;
    const bookElem = document.querySelector('#book-' + bookId);

    lib.toggleReadOnBook(bookId);

    toggleElem.checked
      ? bookElem.classList.add('read')
      : bookElem.classList.remove('read');
  }

  newBookExpander.addEventListener('click', toggleNewBookForm);
  cancelButton.addEventListener('click', toggleNewBookForm);

  newBookForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    validateForm(evt);
    displayBooks();
  });

  displayBooks();
}());