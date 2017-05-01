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
    limit: 100,
    ids: [],
    quotes: []
  };
}

const saveDb = db => {
  if (!db) {
    db = quoteDb;
  }
  fs.writeFileSync(dbPath, JSON.stringify(db));
};

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

const updateDb = isForced => {
  if (isForced)
    console.log('fetching new quotes!');
  return quotes.updateDb(quoteDb, isForced).then(db => {
    saveDb(db);
    return db;
  });
};

const updateAndLearnMe = (cowName, isForcedUpdate) => {
  updateDb(isForcedUpdate).then(db => {
    let quote;
    if (isForcedUpdate) {
      quote = quotes.formatQuote('The update was an utter success!.');
    } else {
      quote = quotes.random(db, 50);
    }
    const cow = makeCow(quote, cowName)
    console.log(cow);
  }).catch(reason => console.log(reason));
};

const setLimit = limit => {
  if (limit === null) {
    if (quoteDb.limit) {
      const msg = quotes.formatQuote(`Your limit is ${quoteDb.limit}.`,
                                     'says the Wise Owl');
      console.log(makeCow(msg));
    } else {
      setLimit(100);
    }
    return;
  } else if (!Number.isInteger(limit)) {
    const msg = quotes.formatQuote('Limit must be an integer.', 'an Angry Owl',
                                   {quoteColor: 'red'});
    console.log(makeCow(msg));
    return;
  }
  quoteDb.limit = limit;
  saveDb();
  console.log(makeCow(chalk.yellow(`Set limit to ${limit}.`)));
  return;
};

const howManyQuotesDoIHave = cowName => {
  const num = quoteDb.ids.length;
  const quip = quotes.formatQuote(`I've got ${num} mots, quips, and aphorisms in my repertoire.`,
                                  'an Owl you can count on');
  const cow = makeCow(quip);
  console.log(cow);
};

const wheresTheDatabase = () => {
  let message = 'My nobel knowledge library is located at ';
  message += chalk.cyan(dbPath);

  console.log(makeCow(
    quotes.formatQuote(message, "a Wise Owl")
  ));
};

module.exports = {
  makeCow,
  updateDb,
  updateAndLearnMe,
  setLimit,
  howManyQuotesDoIHave,
  wheresTheDatabase,
};
