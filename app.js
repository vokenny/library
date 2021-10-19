(function () {
  'use strict';

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
    },
    {
      title: 'test',
      author: 'author',
      pages: 234,
      hasRead: false
    }
  ];

  function Book(title, author, pages, hasRead) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.hasRead = hasRead;
  }

  function addBook() {
    const newBook = Object.create(Book);
    const title = prompt('title');
    const author = prompt('author');
    const pages = prompt('pages');
    const hasRead = prompt('hasRead');

    newBook.title = title;
    newBook.author = author;
    newBook.pages = pages;
    newBook.hasRead = hasRead;

    library = [...library, newBook];
  }

  console.log(library);

  addBook();

  console.log(library);

  document.querySelector('#new-book-form').addEventListener('submit', (evt) => evt.preventDefault());
}());