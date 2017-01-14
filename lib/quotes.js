'use strict';
const chalk = require('chalk');
const got = require('got');
const wrap = require('word-wrap');
const $ = require('cheerio');

const formatDate = date => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const updateDb = db => {
  const today = formatDate(new Date());
  if (db.lastUpdate === today)
    return Promise.resolve(db);

  const limit = db.limit ? db.limit : 100;

  return got('http://www.brainyquote.com/quotes_of_the_day.html').then(res => {
    const soup = $.load(res.body);
    const ids = [];
    const quotes = [];
    soup('.bqQuoteLink').map((i, node) => {
      const quote = $(node);
      quotes.push(quote.text().replace(/\n/g, ''));
      ids.push(quote[0].children[0].next.attribs.class);
    });

    const authors = [];
    soup('.bq-aut').map((i, author) => {
      authors.push($(author).text().replace(/\n/g, ''));
    });

    db.lastUpdate = today;
    ids.forEach((id, index) => {
      if (db.quotes.length === limit) {
        db.quotes.shift();
      }
      if (db.ids.indexOf(id) < 0) {
        const quote = {
          quote: quotes[index],
          author: authors[index]
        };
        db.ids.push(id);
        db.quotes.push(quote);
      }
    });

    return db;
  });
};

const random = (db, width) => {
  const rand = Math.floor(Math.random() * db.quotes.length);
  const quote = db.quotes[rand].quote;
  const author = db.quotes[rand].author;
  return formatQuote(quote, author, width);
};

const formatQuote = (quote, author, options) => {
  // options can be number (width), object (width & colors), or null
  // default options: {width: 50, quoteColor: 'yellow', authorColor: 'magenta'}
  let colors = {
    quote: 'yellow',
    author: 'magenta'
  };
  let width = 50;
  if (options instanceof Number) {
    width = options;
  } else if (options instanceof Object) {
    width = options.width ? options.width : width;
    colors = {
      quote: options.quoteColor ? options.quoteColor : colors['quote'],
      author: options.authorColor ? options.authorColor : colors['author']
    };
  }

  // chalk creates 10 characters that have zero width. all unchalked lines need to
  // appear to have 10 fewer chars than they do. enter the zero-width space.
  let newLine;
  if (chalk.hasColor) {
    // 10 zero-width spaces
    newLine = '\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B\u200B';
  } else {
    newLine = '';
  }

  const out = [newLine];
  wrap(quote, {width: width-10}).split('\n').forEach(l => {
    out.push(chalk[colors['quote']](l));
  });
  out.push(newLine);
  out.push('  -- ' + chalk[colors['author']](author));

  return out.join('\n');
};

module.exports = {updateDb, random, formatQuote};
