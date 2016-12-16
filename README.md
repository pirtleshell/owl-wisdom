# owl-wisdom

> A wise owl spouts quotes to your terminal, inspired by cowsay :books:

## About

After making an ASCII owl, the desire came to let it inspire me. The module builds a quote database by fetching the [BrainyQuotes quotes of the day](https://www.brainyquote.com/quotes_of_the_day.html) once a day, any day you ask the owl for some wisdom. It adds those quotes to the database and chooses a random quote with which to learn you.

Inspired and powered by [cowsay](https://github.com/piuccio/cowsay). Quote fetching is a rewrite of [quoter](https://www.npmjs.com/package/quoter).

## Install

```sh
$ npm install -g owl-wisdom
```

## Use

```sh
$ owl-wisdom
```
![owl](https://cdn.rawgit.com/PirtleShell/owl-wisdom/master/pics/owl.png)

**Get inspired every time you open your terminal by putting it in your `.bashrc`**:

```sh
$ echo owl-wisdom >> ~/.bashrc
```

Besides the owl, all the creatures of cowsay are available, or you can add a path to [your own cow file](https://github.com/paulkaefer/cowsay-files):

```sh
# your own cowfile
$ owl-wisdom path/to/file.cow

# or an included cowsay file:
$ owl-wisdom stegosaurus
```

![stegosaurus](https://cdn.rawgit.com/PirtleShell/owl-wisdom/master/pics/stegosaurus.png)


```
$ owl-wisdom -h

Usage: owl-wisdom [cowFile]

cowFile    An optional cowfile name or path to cow file for non-owl insight

More help:
 -h        Let's not insult your intelligence here...
 -l        List included cow files
```

## The Quote Database

The database is saved as `.quoteDb.json` in your home directory. Here's what it looks like so you could link in and add your own quotes if so desired. It is simply a JSON file:

```js
{
  ids: ['42'],                // used to ensure the same quote isn't added multiple times
  quotes: [                   // an array of objects that contain a quote and author
    {
      quote: 'We are ways for the Cosmos to know itself.',
      author: 'Carl Sagan'
    }
  ],
  lastUpdate: '2016-12-16'    // recorded so it only updates once a day
}
```

## License
MIT &copy; 2016 [Robert Pirtle](https://pirtle.xyz)
