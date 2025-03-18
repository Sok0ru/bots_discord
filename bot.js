/*const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const ytdl = require("ytdl-core");

const robot = new Discord.robot();
const str = undefined;

const result1 = typeof str === 'string' ? str.trim() : '';
console.log(result1); // 👉️ ""
const queue = new Map();

robot.once("ready", () => {
  console.log("Ready!");
});

robot.once("reconnecting", () => {
  console.log("Reconnecting!");
});

robot.once("disconnect", () => {
  console.log("Disconnect!");
});

robot.on("message", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
  } else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
  } else {
    message.channel.send("You need to enter a valid command!");
  }
});

async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "вы должны находиться в канале чтобы я мог к вам присоединиться!"
    );
  const permissions = voiceChannel.permissionsFor(message.robot.user);
  if (!permissions.has("--") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "у меня нет прав!"
    );
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}
*/

const AudioPlayerStatus = require('@discord.js/voice');
const createAudioResource = require('@discord.js/voice');
const createAudioPlayer = require('@discord.js/voice');
const joinVoiceChannel = require('@discord.js/voice');
const  prefix  = require("./config.json");
const { token } = require("./config.json");
const Discord = require('discord.js'); // Подключаем библиотеку discord.js
const { EmbedBuilder } = require('discord.js');
const play = require('play-dl');
const { Collection, MessageFlags } = require('discord.js');;
const {clientId, guildId} = require('./config.json');
const GatewayIntentBits = require('discord.js');
const robot = new Discord.Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});;



const queue = new Map();

robot.on('ready', () => {
  console.log(`Bot logged in as ${robot.user.tag}`);
});

robot.on('messageCreate', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const serverQueue = queue.get(message.guild.id);

  switch(command) {
    case 'play':
      execute(message, args);
      break;
    case 'skip':
      skip(message, serverQueue);
      break;
    case 'stop':
      stop(message, serverQueue);
      break;
  }
});

async function execute(message, args) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply('You need to be in a voice channel!');
  }

  if (!args.length) {
    return message.reply('You need to provide a YouTube URL or search term!');
  }

  const songInfo = await play.search(args.join(' '), { limit: 1 });
  if (!songInfo || !songInfo.length) {
    return message.reply('Could not find the song!');
  }

  const song = {
    title: songInfo[0].title,
    url: songInfo[0].url,
  };

  let serverQueue = queue.get(message.guild.id);

  if (!serverQueue) {
    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      playing: true,
      player: createAudioPlayer(),
    };

    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      queueConstruct.connection = connection;
      play_song(message.guild, queueConstruct.songs[0]);
    } catch (err) {
      queue.delete(message.guild.id);
      return message.reply('Error joining voice channel!');
    }
  } else {
    serverQueue.songs.push(song);
    return message.reply(`${song.title} has been added to the queue!`);
  }
}

async function play_song(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    queue.delete(guild.id);
    return;
  }

  const stream = await play.stream(song.url);
  const resource = createAudioResource(stream.stream, { inputType: stream.type });
  
  serverQueue.player.play(resource);
  serverQueue.connection.subscribe(serverQueue.player);

  serverQueue.player.on(AudioPlayerStatus.Idle, () => {
    serverQueue.songs.shift();
    play_song(guild, serverQueue.songs[0]);
  });

  serverQueue.textChannel.send(`Now playing: ${song.title}`);
}

function skip(message, serverQueue) {
  if (!serverQueue) return message.reply('There is no song playing!');
  serverQueue.player.stop();
  message.reply('Skipped the song!');
}

function stop(message, serverQueue) {
  if (!serverQueue) return message.reply('There is no song playing!');
  serverQueue.songs = [];
  serverQueue.player.stop();
  serverQueue.connection.destroy();
  queue.delete(message.guild.id);
  message.reply('Stopped the music!');
}


async function execute(message, args) {
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.reply('❌ You need to be in a voice channel first!');
  }

  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has('Connect') || !permissions.has('Speak')) {
    return message.reply('❌ I need permissions to join and speak in your voice channel!');
  }

  try {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    connection.on('stateChange', (oldState, newState) => {
      const oldNetworking = Reflect.get(oldState, 'networking');
      const newNetworking = Reflect.get(newState, 'networking');

      const networkStateChangeHandler = (oldNetworkState, newNetworkState) => {
        const newUdp = Reflect.get(newNetworkState, 'udp');
        clearInterval(newUdp?.keepAliveInterval);
      }

      oldNetworking?.off('stateChange', networkStateChangeHandler);
      newNetworking?.on('stateChange', networkStateChangeHandler);
    });

    message.reply('✅ Successfully joined your voice channel!');
    return connection;
  } catch (error) {
    console.error(error);
    message.reply('❌ There was an error joining the voice channel!');
    return null;
  }
}

module.exports = {
  name: 'join',
  description: 'Joins a voice channel',
  execute,
};


robot.login(token);