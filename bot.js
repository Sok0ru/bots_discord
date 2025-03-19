const Discord = require('discord.js'); // Подключаем библиотеку discord.js
const { clientId, guildId} = require('./config.json');
const GatewayIntentBits = require('discord.js');
const robot = new Discord.Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});;
 // Объявляем, что robot - бот
const comms = require("./comms.js"); // Подключаем файл с командами для бота
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js  
let config = require('./config.json'); // Подключаем файл с параметрами и информацией
let token = config.token; // «Вытаскиваем» из него токен
let prefix = config.prefix; // «Вытаскиваем» из него префикс
require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const path = require('node:path');

const { Client, Collection, MessageFlags } = require('discord.js');
const { count } = require('node:console');

let definedObject = {
Guilds: ['Guild 1', 'Guild 2', 'Guild 3']
};

// Checking if object is defined before accessing 'guilds' property
if (definedObject) {
  console.log(definedObject.guilds);
   Output: ['Guild 1', 'Guild 2', 'Guild 3']
};
//robot.on("ready", function() {
   //При успешном запуске, в консоли появится сообщение «[Имя бота] запустился!» 
  //console.log(robot.user.username + " запустился!");
//});

robot.on('message', (msg) => { // Реагирование на сообщения
  if (msg.author.username != robot.user.username && msg.author.discriminator != robot.user.discriminator) {
    var comm = msg.content.trim() + " ";
    var comm_name = comm.slice(0, comm.indexOf(" "));
    var messArr = comm.split(" ");
    for (comm_count in comms.comms) {
      var comm2 = prefix + comms.comms[comm_count].name;
      if (comm2 == comm_name) {
        comms.comms[comm_count].out(robot, msg, messArr);
      }
    }
  }
});
          robot.login(token); // Авторизация бота

  robot.on("message", message => { //Пришло сообщение.
    console.log(message.content); //console.log логирует в консоль, message - объект сообщения, message.content - строка объекта с текстом сообщения.
    })
          
  robot.on("message", message => { //Пришло сообщение.
    console.log(message.author.tag); //message.author.tag содержит в себе тег автора.
    })

  robot.on("message", message => { //Пришло сообщение.
    if(message.content.toLowerCase()==config.prefix + "ping") //Если текст сообщения равен префиксу плюс ping, то происходит код в {} Часть кода .toLowerCase() превращает текст в строчный. (Делает из заглавных букв обычные.) 
    {
      message.reply("мой пинг равен " + robot.ping) //message.reply отвечает на сообщение.
    //Также можно использовать message.channel.send(message.author + ", мой пинг равен " + robot.ping);
    }
    })
    robot.on("message", message => { //Пришло сообщение.
      if(message.content.toLowerCase()==config.prefix + "test")
      {
      message.channel.send("I am working now!");
      }
      })
    robot.on("message", message => { //Пришло сообщение.
        if(message.content.toLowerCase()==config.prefix + "ping") //Выше было
        {
        let embed = new Discord.RichEmbed() //Создаём новый эмбед.
        .setTitle('Пинг бота.') //Устанавливаем заголовок.
        .setColor(`GREEN`) //Цвет зелёный. Можно указать hex.
        .setDescription("Пинг : " + robot.ping); //Устанавливаем описание.
        message.channel.send(embed); //Отправляем.
        }
        })
        
        robot.on("message", message => { //Пришло сообщение.
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
        
        robot.commands = new Collection();
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);
        
        
        for (const folder of commandFolders) {
          const commandsPath = path.join(foldersPath, folder);
          const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
          for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
              robot.commands.set(command.data.name, command);
            } else {
              console.log(`[WARNING] у этой команды: ${filePath} отсутствует требуемое свойство "данные" или "выполнить".`);
            }
          }
        }
          
        const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
        const commands = [];
        robot.commands = new Collection();
        
        for (const file of commandFiles)
        {
            const command = require(`./commands/${file}`);
            commands.push(command.data.toJSON());
            robot.commands.set(command.data.name, command);
        }
        
        robot.once("ready", () => 
        {
            console.log("(Discord.js v14) эта падла работает!!!");
        
            const CLIENT_ID = robot.user.id;
            const rest = new REST;
            ({
                version: "10"
            });
        
            (async () =>  
            {
                try {
                    if(process.env.ENV === "production")
                    {
                        await rest.put(Routes.applicationCommands(CLIENT_ID), 
                        {
                            body: commands
                        });
                        console.log("Успешно зарегистрированные команды (global).");
                    }
                    else 
                    {
                        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), 
                        {
                            body: commands
                        });
                        console.log("Успешно зарегистрированные команды (local).");               
                    }
                }
                catch(err)
                {
                        if(err) console.error(err);
                }
            })();
        });
        
        robot.login(token);
