# discord f(x)

My 'clone' of [airhorn.solutions](http://airhorn.solutions) for Discord, in JavaScript (node.js) using the discord.js client library.


## Installation

```
$ git clone https://github.com/nicholastay/discord-fx.git && cd discord-fx # or download the zip i guess
$ npm install
$ cp fxc.json.template fxc.json
$ vi fxc.json # or your fav editor - you should be using a bot account for multiple voice connections across servers
$ node fx.js

# join voice channel and !vape away
```


## Adding sound files

```
# Linux/Mac
$ chmod +x ./fxe.sh # you may need to do this first time
$ ./fxe [input file] fx/[sound effect name]/1.mp3 # incrementally, each 1,2,3,etc will be randomly selected per play

# Windows
> fxe [input file] fx\[sound effect name]\1.mp3 # same as above
```


## Limitations

At the moment if people spam the command, it will just join and play once. It will not accept a command from that server until the previous sound has stopped. I am thinking about adding a queue, so it will queue along and do it, or it will overlap and play the stream on top of the previous stream.


*(Before you ask, no, this has nothing to do with math, but yes, I named it this way because f(x) sounds like FX as in 'Sound FX')*
