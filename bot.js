const Discord = require('discord.js'); // Подключаем библиотеку discord.js

require("dotenv").config();
const GatewayIntentBits = require('discord.js');
 // Объявляем, что client - бот
const comms = require("./comms.js"); // Подключаем файл с командами для бота
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js  


const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");


const { Collection } = Discord;

const path = require('path');


// Конфигурация
const token = process.env.TOKEN;
const prefix = process.env.COMMAND_PREFIX;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  console.error('❌ Токен не найден в .env!');
  process.exit(1);
}

// Инициализация клиента
const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

client.commands = new Collection();

// Загрузка команд
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  if (folder.startsWith('_')) continue;
  
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    }
  }
}

// Регистрация команд
client.once('ready', async () => {
  console.log(`✅ Бот ${client.user.tag} запущен!`);
  
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    
    if (process.env.ENV === 'production') {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log('🔧 Команды зарегистрированы глобально');
    } else {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log('🔧 Команды зарегистрированы для сервера');
    }
  } catch (error) {
    console.error('❌ Ошибка регистрации команд:', error);
  }
});
//обработка Slash-комманд
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  
  // Отправляем "Бот думает..." для всех команд
  await interaction.deferReply({ ephemeral: true }); 
  // ephemeral: true - только для вызывающего пользователя

  try {
    const command = client.commands.get(interaction.commandName);
    if (!command) throw new Error('Команда не найдена');

    await command.execute(interaction);
    
  } catch (error) {
    await interaction.editReply('❌ Ошибка выполнения команды');
    console.error(error);
  }
});


// Обработчик сообщений (если нужно сохранить префиксные команды)
client.on('messageCreate', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('Произошла ошибка при выполнении команды!');
  }
});

// Только ОДИН вызов login в конце файла
client.login(token).catch(console.error);