'use strict';
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const cowsay = require('cowsay');
const quotes = require('./quotes');

const homedir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const dbName = '.quoteDb.json';
const dbPath = path.resolve(homedir, dbName);

let quoteDb;
if (fs.existsSync(dbPath)) {
  quoteDb = JSON.parse(fs.readFileSync(dbPath));
} else {
  console.log(chalk.green('initializing quote database!'))
  quoteDb = {
    ids: [],
    quotes: []
  };
}

// takes quote and a cow filepath or valid cowsay name returns the colored cow
const makeCow = (quote, cowName) => {
  if (!cowName || cowName === 'owl') {
    cowName = path.resolve(__dirname, 'owl.cow');
  } else if (cowName === 'cow') {
    cowName = null;
  }
  let cow;
  try {
    cow = cowsay.say({
      text: quote,
      f: cowName,
      n: true
    });
  } catch (err) {
    console.log(chalk.red('unrecognized cow file!'));
    cow = cowsay.say({
      text: quote,
      f: path.resolve(__dirname, 'owl.cow'),
      n: true
    });
  }
  // fix spacing issues from chalk
  if (chalk.hasColor) {
    cow = cow.split('\n');
    cow[0] = cow[0].substr(0,cow[0].length - 10);
    const end = quote.split('\n').length + 1;
    cow[end] =  cow[end].substr(0,cow[end].length - 10)
    cow = '  ' + cow.join('\n  ');
  }

  return chalk.cyan(cow);
};

const updateAndLearnMe = cowName => {
  quotes.updateDb(quoteDb).then(db => {
    const quote = quotes.random(db, 50);
    const cow = makeCow(quote, cowName)

    console.log(cow);

    fs.writeFileSync(dbPath, JSON.stringify(db));
  }).catch(reason => console.log(reason));
};

module.exports = {
  makeCow,
  updateAndLearnMe
};
