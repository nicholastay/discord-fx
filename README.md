# discord f(x)

an [airhorn.solutions](http://airhorn.solutions)-esque sound player for Discord written for node.js with [eris](https://github.com/abalabahaha/eris).


## Installation

```
$ git clone https://github.com/nicholastay/discord-fx.git && cd discord-fx # or download the zip i guess
$ npm install
$ cp config.js.template config.js
$ vi config.js # or your fav editor - you should be using a bot account for multiple voice connections across servers
$ node fx.js

# join voice channel and use !prettygood
```


## Adding sound files

```
# Linux/Mac
$ ./fx_encode.sh [path/to/file.wav] [fx name] [fx ID]

# then you can reload with '.r' in the console if already running.
```


## License

Licensed under the Zlib/libpng license. Full text in the root of the repository.


*(Before you ask, no, this has nothing to do with math, but yes, I named it this way because f(x) sounds like FX as in 'Sound FX')*