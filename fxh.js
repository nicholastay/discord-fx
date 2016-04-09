'use strict';

const fs = require('fs');


exports.fxh = (client, prefix, fx, message) => {
    if (message.content[0] !== prefix
        || !message.author.voiceChannel
        || message.author.voiceChannel.server.id !== message.channel.server.id
        || client.voiceConnections.find(v => v.server.id === message.channel.server.id)) return;

    if (fx[message.content]) {
        console.log(`[@${message.author.name} :: <${message.channel.server.name}> :: #${message.channel.name}]  ~ FX - ${message.content}`);
        let files = fx[message.content], file;
        if (files.length < 1)
            file = files[0];
        else
            file = files[getRandomInt(0, files.length)];

        client.joinVoiceChannel(message.author.voiceChannel)
        .then(connection => {
            setTimeout(() => {
                let intent = connection.playStream(fs.createReadStream(file));
                intent.on('end', () => client.leaveVoiceChannel(connection));
            }, 350);
        })
        .catch(console.log);
    }
};



// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
