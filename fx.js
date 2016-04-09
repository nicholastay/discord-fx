'use strict';

const Discord = require('discord.js')
    , fs      = require('fs')
    , repl    = require('repl')
    , fxc     = require('./fxc.json')
    , client  = new Discord.Client()
    , prefix  = '!';

let fxh = require('./fxh').fxh, fx;

const replS = repl.start('f(x)> ');
console.log('\n');
replS.context.client = client;

// load names into memory from scanning folders
let reloadFX = () => {
    fx = {};
    fs.readdirSync('./fx').forEach(fc => {
        let f = prefix + fc;
        fx[f] = [];
        for (let i = 1; i <= fs.readdirSync(`./fx/${fc}`).length; i++) {
            try {
                let fl = `./fx/${fc}/${i}.mp3`;
                fs.accessSync(fl, fs.F_OK);
                fx[f].push(fl);
            }
            catch (e) {
                delete fx[f];
                return console.log(`Terminating load for ${fc} - invalid structure, must be 1.mp3, 2.mp3, etc. - `, e);
            }
        }
        console.log(`Loaded ${fc} [${fx[f].length}]`);
    });
    replS.context.fx = fx;
};

reloadFX();
replS.defineCommand('rfx', {
    action: () => {
        reloadFX();
        console.log('Reloaded FX.');
    }
});
replS.defineCommand('rh', {
    action: () => {
        if (require.cache[require.resolve('./fxh')]) {
            fxh = () => {};
            delete(require.cache[require.resolve('./fxh')]);
            fxh = require('./fxh');
        }
        console.log('Reloaded HANDLER.');
    }
});


client.on('message', message => fxh(client, prefix, fx, message));
client.on('ready', () => {
    console.log('Logged in.');
    client.setStatus('online', '!vape').catch(console.log);
});
client.on('disconnected', () => {
    console.log('Dropped, will reconnect every 2.5mins...');
    let reconnInterval = setInterval(() => {
        console.log('Reconnecting...');
        client.loginWithToken(fxc.token).then(token => { if (token) clearInterval(reconnInterval) });
    }, 2.5 * 60 * 1000);
});
client.loginWithToken(fxc.token);
