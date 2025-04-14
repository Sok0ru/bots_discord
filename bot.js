const Discord = require('discord.js'); // Подключаем библиотеку discord.js

const GatewayIntentBits = require('discord.js');
const commands = [];
const client = new Discord.Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});;

 // Объявляем, что client - бот
const comms = require("./comms.js"); // Подключаем файл с командами для бота
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js  

require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { prefix } = require("./config.json");
const { token } = require("./config.json");
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const path = require('node:path');
const commandsPath = path.join(__dirname, 'commands');

const { Client, Collection, MessageFlags } = require('discord.js');
const { count } = require('node:console');

//костыль, без него бот поляжет
let definedObject = {
Guilds: ['Guild 1', 'Guild 2', 'Guild 3']
};

// Checking if object is defined before accessing 'guilds' property
if (definedObject) {
  console.log(definedObject.guilds);
   Output: ['Guild 1', 'Guild 2', 'Guild 3']
};


client.on('message', (msg) => { // Реагирование на сообщения
  if (msg.author.username != client.user.username && msg.author.discriminator != client.user.discriminator) {
    var comm = msg.content.trim() + " ";
    var comm_name = comm.slice(0, comm.indexOf(" "));
    var messArr = comm.split(" ");
    for (comm_count in comms.comms) {
      var comm2 = prefix + comms.comms[comm_count].name;
      if (comm2 == comm_name) {
        comms.comms[comm_count].out(client, msg, messArr);
      }
    }
  }
});
          client.login(token); // Авторизация бота

  client.on("message", message => { //Пришло сообщение.
    console.log(message.content); //console.log логирует в консоль, message - объект сообщения, message.content - строка объекта с текстом сообщения.
    })
          
  client.on("message", message => { //Пришло сообщение.
    console.log(message.author.tag); //message.author.tag содержит в себе тег автора.
    })

        client.on("message", message => { //Пришло сообщение.
          if(message.content.toLowerCase().startsWith(config.prefix + "avatar")) //Выше было
          {
          let mb = message.mentions.members.first() || message.member; // Если есть упомянание человека в сообщении, то берём его, если нету, то себя. Расскажу чуть позже.
          let color = mb.displayHexColor; //Цвет самой высокой роли человека, если цвет невидимый то самой высокой отображаемой роли.
          if (color == '#000000') color = mb.hoistRole.hexColor;//Цвет самой высокой роли человека.
          let embed = new Discord.RichEmbed() //Создаём эмбед
          .setImage(mb.user.avatarURL) //Устанавливаем картинку - аватар человека.
          .setColor(color) //Цвет.
          .setFooter("Аватар пользователя " + mb.user.tag); //Устанавливаем в подпись чей это аватар.
          message.channel.send({embed}); //Отправляем.
          }
          })
        
        client.commands = new Collection();
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);



// Загрузка команд для ban and kick
for (const folder of commandFolders) {
  if (folder.startsWith('_')) continue; // Пропускаем служебные папки
  
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] Команда в ${filePath} отсутствует требуемое свойство "data" или "execute".`);
    }
  }
}

// Обработка событий
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.once("ready", async () => {
  console.log("(Discord.js v14) Бот успешно запущен!");
  
  const CLIENT_ID = client.user.id;
  //const token = process.env.TOKEN; // Получаем токен из .env
  
  // 1. Правильная инициализация REST
  const rest = new REST({ version: '10' }).setToken(token);
  
  try {
    if(process.env.ENV === "production") {
      // Глобальная регистрация
      await rest.put(
        Routes.applicationCommands(CLIENT_ID), 
        { body: commands }
      );
      console.log("✅ Команды зарегистрированы глобально");
    } else {
      // Локальная регистрация (для разработки)
      await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), 
        { body: commands }
      );
      console.log("✅ Команды зарегистрированы локально");
    }
  } catch(err) {
    console.error("❌ Ошибка регистрации команд:", err);
  }
  client.login(token);
});

// 2. Только ОДИН вызов login
client.login(token);
