'use strict';
const chalk = require('chalk');
const got = require('got');
const wrap = require('word-wrap');
const xmlParseString = require('xml2js').parseString;
var crypto = require('crypto');

const formatDate = date => {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const updateDb = (db, isForced) => {
  return new Promise((resolve, reject) => {

    const today = formatDate(new Date());
    if (db.lastUpdate === today && !isForced) {
      // console.log('not updating')
      return resolve(db);
    }

    const limit = db.limit ? db.limit : 100;
    const url = 'https://www.brainyquote.com/link/quotebr.rss';

    got(url).then(res => {
      xmlParseString(res.body, (err, xmlResult) => {
        if (err) {
          reject(err);
        }
        
        const todaysQuotes = xmlResult.rss.channel[0].item;
        todaysQuotes.forEach((newQuote) => {
          const hash = crypto.createHash('sha256');

          const quote = {
            author: newQuote.title[0],
            quote: newQuote.description[0]
          }
          hash.update(quote.author+"-"+quote.quote);
          const id = hash.digest('hex');
          if (db.ids.indexOf(id) < 0) {
            db.ids.push(id);
            db.quotes.push(quote);
          }
        });

        while (db.quotes.length > limit) {
          db.quotes.shift();
          // console.log('removing quote')
        }

        return resolve(db);
      })
    });
  });
};

const random = (db, width) => {
  if (!((db || {}).quotes || {}).length) {
    return formatQuote(
      "You don't have any quotes!",
      "Not so wise owl...",
      width
    )
  }
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

  if (!author) {
    author = 'A Wise Owl';
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

  const out = [];
  wrap(quote, {width: width - 10})
  .split('\n')
  .forEach(line => {
    out.push(chalk[colors['quote']](line));
  });
  // out.push(newLine);
  out.push('  -- ' + chalk[colors['author']](author));

  return out.join('\n');
};

module.exports = {updateDb, random, formatQuote};
