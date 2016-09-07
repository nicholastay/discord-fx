"use strict";

const Eris = require("eris")
    , fs = require("fs")
    , path = require("path");

const config = require("./config");

class Fxbot {
    constructor() {
        this.client = null;
        this.fx = {}; // effects store
        this.fxLocation = path.join(__dirname, "fx");
        this.prefix = config.discord.prefix || "!";

        if (!config.discord.token)
            throw new Error("No token in config");

        this.loadSounds();
    }

    start() {
        this.client = new Eris(config.discord.token);
        this.attachEvents();
        this.client.connect();
    }

    attachEvents() {
        this.client.on("ready", () => console.log("Connected to Discord."));
        this.client.on("disconnect", () => console.log("Disconnected from Discord, will try to auto-reconnect..."));
        this.client.on("messageCreate", this.handleMessage.bind(this));
    }

    loadSounds() {
        let possibleBundles = fs.readdirSync(this.fxLocation).filter(file => fs.statSync(path.join(this.fxLocation, file)).isDirectory());
        let loadedSoundBundles = 0;
        possibleBundles.forEach(bundleName => {
            let possibleDcas = fs.readdirSync(path.join(this.fxLocation, bundleName)).filter(file => file.endsWith(".dca"));
            if (possibleDcas.length > 0)
                this.fx[bundleName] = possibleDcas.map(dca => path.resolve(this.fxLocation, bundleName, dca));
            console.log(`Loaded bundle ${bundleName} [${possibleDcas.length} sounds]`);
        });
    }

    handleMessage(message) {
        if (!message.content.startsWith(this.prefix)
         || !message.member // PM
         || !message.member.voiceState
         || !message.member.voiceState.channelID
         || this.client.voiceConnections.find(vc => vc.id === message.channel.guild.id)) // already playing
            return;

        let spaceIndex = message.content.indexOf(" ");
        let triggerSent = spaceIndex < 0 ? message.content : message.content.substr(0, spaceIndex);
        triggerSent = triggerSent.replace(this.prefix, "");
        if (this.fx[triggerSent]) {
            console.log(`${message.channel.guild.name} :: #${message.channel.name} // ${message.author.username}#${message.author.discriminator} ~~ FX: ${triggerSent}`);
            let dca;
            if (this.fx[triggerSent].length > 1)
                dca = this.fx[triggerSent][0];
            else
                dca = this.fx[triggerSent][getRandomInt(0, this.fx[triggerSent].length)];

            this.client.joinVoiceChannel(message.member.voiceState.channelID)
                .then(conn => {
                    setTimeout(() => conn.playDCA(dca), 250);
                    conn.on("end", () => this.client.leaveVoiceChannel(message.member.voiceState.channelID));
                })
                .catch(console.log);
        }
    }
}

const bot = new Fxbot();
global.Fx = bot;
bot.start();

const replS = require("repl").start('f(x)> ');
console.log('\n');



// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}