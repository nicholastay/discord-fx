"use strict";

/*
 * encoding note
 * 
 * Mika Matsuda - Today at 1:17 PM
 * ffmpeg -i snowblind.mp3 -c:a libopus -b:a 64000 -vbr on -frame_duration 60 snowblind.ogg
 * 
 * thanks yous abal :^)
 *
 */

const QUEUE_LENGTH_PER_VOICE = 4;

const Eris = require("eris")
    , fs = require("fs")
    , path = require("path");

class Fxbot {
    constructor() {
        console.log("f(x) [r e w r i t e]");
        console.log("starting up...\n");

        this.client = null;
        this.fx = {}; // effects store
        this.connQueues = {};
        this.fxLocation = path.join(__dirname, "fx");

        this.config = {};
        this.reloadConfig();

        if (!this.config.discord.token)
            throw new Error("No token in config");
        // properties: (loaded in reloadConfig)
        // this.prefix
        // this.alias
        // this.autojoin

        this.reloadSounds();

        this.repl = require("repl").start("f(x)> ");
        console.log("");
        this.registerRepl();
    }

    reloadConfig() {
        hotReload("./config.js");

        this.config = require("./config.js");
        console.log("Config loaded");

        this.prefix = this.config.prefix || "!";
        this.alias = this.config.alias || {};
        this.autojoin = this.config.autojoin || {};
    }

    start() {
        this.client = new Eris(this.config.discord.token);
        this.attachEvents();
        this.client.connect();
    }

    attachEvents() {
        this.client.on("ready", () => console.log("Connected to Discord."));
        this.client.on("disconnect", () => console.log("Disconnected from Discord, will try to auto-reconnect..."));

        this.client.on("messageCreate", this.handleMessage.bind(this));
        this.client.on("voiceChannelJoin", this.autoJoinHandler.bind(this));
    }

    registerRepl() {
        this.repl.defineCommand("r", {
            help: "[f(x)] Reload all fx bundles",
            action: () => this.reloadSounds()
        });
        this.repl.defineCommand("rc", {
            help: "[f(x)] Reload config",
            action: () => this.reloadConfig()
        });
        this.repl.context.fx = this;
    }

    reloadSounds() {
        this.fx = {};
        let possibleBundles = fs.readdirSync(this.fxLocation).filter(file => fs.statSync(path.join(this.fxLocation, file)).isDirectory());
        possibleBundles.forEach(bundleName => {
            let possibleOggs = fs.readdirSync(path.join(this.fxLocation, bundleName)).filter(file => file.endsWith(".ogg"));
            if (possibleOggs.length > 0) {
                this.fx[bundleName] = {};
                possibleOggs.forEach(ogg => this.fx[bundleName][ogg.replace(".ogg", "")] = path.resolve(this.fxLocation, bundleName, ogg));
            }
            console.log(`Loaded bundle ${bundleName} [${possibleOggs.length} sounds]`);
        });
        console.log(`Finished loading ${Object.keys(this.fx).length} fx bundles.`);
    }

    handleMessage(message) {
        if (message.author.id === this.client.user.id // ignore self
         || !message.content.startsWith(this.prefix)
         || !message.member /* PM */ )
            return;

        let { head, tail } = splitHeadTail(message.content, " ");
        let command = head.replace(this.prefix, "");

        if (command === "bundles")
            return this.bundlesCommand(command, tail, message);

        if (!message.member.voiceState
         || !message.member.voiceState.channelID)
            return; // no voice state - cant play any triggers anyway

        // check for alias
        if (this.alias[command]) {
            // switch the context
            console.log(`${message.channel.guild.name} :: #${message.channel.name} // ${message.author.username}#${message.author.discriminator} ~~ ALIAS: ${command} --> ${this.alias[command]}`);
            if (this.alias[command].includes(".")) {
                // special custom tail
                let s = splitHeadTail(this.alias[command], ".");
                command = s.head;
                tail = s.tail;
            } else {
                command = this.alias[command];
            }
        }

        // if a sfx exists
        if (this.fx[command]) {
            let logMsg = `${message.channel.guild.name} :: #${message.channel.name} // ${message.author.username}#${message.author.discriminator} ~~ FX: ${command}${tail ? ` (${tail})` : ""}`;
            let status;

            // find vc to play in
            let voiceChannelId = message.member.voiceState.channelID;
            let existingConn = this.client.voiceConnections.find(vc => vc.id === message.channel.guild.id);

            if (existingConn && (existingConn.channelID !== voiceChannelId)) // just a check
                status = "already in another chan in guild";
            else
                status = this.playSfx(command, tail, voiceChannelId);

            console.log(`${logMsg} (${status})`);
        }
    }

    bundlesCommand(command, tail, message) {
        if (!tail) {
            console.log(`${message.channel.guild.name} :: #${message.channel.name} // ${message.author.username}#${message.author.discriminator} ~~ Bundles Help`);
            message.channel.createMessage(message.author.mention + " ~ Available bundles: " + Object.keys(this.fx).join(", "));
            return;
        }

        let bundle = this.fx[tail];
        if (!bundle) {
            message.channel.createMessage(message.author.mention + " ~ Invalid bundle.");
            return;
        }

        let bundleKeys = Object.keys(bundle);
        if (bundleKeys.length === 1)
            message.channel.createMessage(message.author.mention + " ~ " + tail + ": This bundle only relates to a single sound effect.");
        else
            message.channel.createMessage(message.author.mention + " ~ " + tail + ": Available effects - " + bundleKeys.join(", "));
    }

    autoJoinHandler(member, channel) {
        if (!this.autojoin[member.id])
            return;

        let bundle = this.autojoin[member.id];
        let sound;
        if (bundle.includes(".")) { // specific
            let s = splitHeadTail(this.autojoin[member.id], ".");
            bundle = s.head;
            sound = s.tail;
        }

        console.log(`${channel.guild.name} :: VC#${channel.name} ~~ AUTOJOIN: ${member.id}`);
        this.playSfx(bundle, sound, channel.id);
    }

    playSfx(bundleName, specificSound, voiceChannelId) {
        let bundle = this.fx[bundleName];
        let bundleKeys = Object.keys(bundle);

        let ogg;
        if (specificSound && bundle[specificSound]) // they wanted something specific
            ogg = bundle[specificSound];
        else if (bundleKeys.length < 2) // theres only 1 sound
            ogg = bundle[bundleKeys[0]];
        else // rng!
            ogg = bundle[bundleKeys[getRandomInt(0, bundleKeys.length)]];

        if (this.connQueues[voiceChannelId]) { // existing connection queue found
            if (this.connQueues[voiceChannelId].length > QUEUE_LENGTH_PER_VOICE)
                return "dropped @ queue";
            this.connQueues[voiceChannelId].push(ogg);
            return "+queue";
        } else {
            this.connQueues[voiceChannelId] = [];
            this.client.joinVoiceChannel(voiceChannelId)
                .then(conn => {
                    conn.play(ogg, { format: "ogg" });
                    conn.on("end", () => {
                        if (this.connQueues[voiceChannelId].length < 1) {
                            delete(this.connQueues[voiceChannelId]);
                            return this.client.leaveVoiceChannel(voiceChannelId);
                        }

                        conn.play(this.connQueues[voiceChannelId].shift(), { format: "ogg" });
                    });
                })
                .catch(console.log);
            return "new";
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

function splitHeadTail(str, delimiter) {
    // command parsing style
    let i = str.indexOf(delimiter);
    let head = i < 0 ? str : str.substr(0, i);
    let tail = i < 0 ? null : str.substr(i + 1, str.length);

    return { head, tail };
}

function hotReload(mod) {
    var resName = require.resolve(mod);
    var cached = require.cache[resName];

    if (cached)
        delete require.cache[resName];
}