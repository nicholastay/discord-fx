"use strict";

/*
 * encoding note
 * 
 * Mika Matsuda - Today at 1:17 PM
 * ffmpeg -i snowblind.mp3 -c:a libopus -b:a 64000 -vbr on -frame_duration 60 snowblind.ogg
 *
 */

const Eris = require("eris")
    , fs = require("fs")
    , path = require("path");

const config = require("./config");

class Fxbot {
    constructor() {
        console.log("f(x) [r e w r i t e]");
        console.log("starting up...\n");

        this.client = null;
        this.fx = {}; // effects store
        this.connQueues = {};
        this.fxLocation = path.join(__dirname, "fx");
        this.prefix = config.discord.prefix || "!";

        if (!config.discord.token)
            throw new Error("No token in config");

        this.reloadSounds();

        this.repl = require("repl").start("f(x)> ");
        console.log("");
        this.registerRepl();
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

    registerRepl() {
        this.repl.defineCommand("r", {
            help: "[f(x)] Reload all fx bundles.",
            action: () => this.reloadSounds()
        });
        this.repl.context.fx = this;
    }

    reloadSounds() {
        this.fx = {};
        let possibleBundles = fs.readdirSync(this.fxLocation).filter(file => fs.statSync(path.join(this.fxLocation, file)).isDirectory());
        possibleBundles.forEach(bundleName => {
            let possibleOggs = fs.readdirSync(path.join(this.fxLocation, bundleName)).filter(file => file.endsWith(".ogg"));
            if (possibleOggs.length > 0)
                this.fx[bundleName] = possibleOggs.map(ogg => path.resolve(this.fxLocation, bundleName, ogg));
            console.log(`Loaded bundle ${bundleName} [${possibleOggs.length} sounds]`);
        });
        console.log(`Finished loading ${Object.keys(this.fx).length} fx bundles.`);
    }

    handleMessage(message) {
        if (!message.content.startsWith(this.prefix)
         || !message.member // PM
         || !message.member.voiceState
         || !message.member.voiceState.channelID)
            return;
        
        let existingConn = this.client.voiceConnections.find(vc => vc.id === message.channel.guild.id);
        let spaceIndex = message.content.indexOf(" ");
        let triggerSent = spaceIndex < 0 ? message.content : message.content.substr(0, spaceIndex);
        triggerSent = triggerSent.replace(this.prefix, "");
        if (this.fx[triggerSent]) {
            console.log(`${message.channel.guild.name} :: #${message.channel.name} // ${message.author.username}#${message.author.discriminator} ~~ FX: ${triggerSent}`);
            let ogg;
            if (this.fx[triggerSent].length < 2)
                ogg = this.fx[triggerSent][0];
            else
                ogg = this.fx[triggerSent][getRandomInt(0, this.fx[triggerSent].length)];

            if (existingConn) {
                if (this.connQueues[message.member.voiceState.channelID].length > 4)
                    return;
                this.connQueues[message.member.voiceState.channelID].push(ogg);
            } else {
                this.connQueues[message.member.voiceState.channelID] = [];
                this.client.joinVoiceChannel(message.member.voiceState.channelID)
                    .then(conn => {
                        conn.play(ogg, { format: "ogg" });
                        conn.on("end", () => {
                            if (this.connQueues[message.member.voiceState.channelID].length < 1) {
                                delete(this.connQueues[message.member.voiceState.channelID]);
                                return this.client.leaveVoiceChannel(message.member.voiceState.channelID);
                            }
                            conn.play(this.connQueues[message.member.voiceState.channelID].shift(), { format: "ogg" });
                        });
                    })
                    .catch(console.log);
            }
        }
    }
}

const bot = new Fxbot();
global.Fx = bot;
bot.start();



// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}