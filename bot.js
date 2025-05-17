const Discord = require('discord.js'); // Подключаем библиотеку discord.js
const { Collection } = Discord;

const GatewayIntentBits = require('discord.js');
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js  
const { EmbedBuilder } = require('@discordjs/builders');
require("dotenv").config();
// Конфигурация
const token = process.env.TOKEN;
const prefix = process.env.COMMAND_PREFIX;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const path = require('path');
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { setTimeout } = require('timers/promises');
//для новых команд использовать ТОЛЬКО const { SlashCommandBuilder } = require('@discordjs/builders')


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
  ],
  allowedMentions: { parse: [] }
});

client.commands = new Collection();



// 1. Инициализация коллекций
client.commands = new Collection();
client.cooldowns = new Collection(); // Выносим cooldowns на уровень клиента

// 2. Загрузка команд
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
      // 3. Инициализация cooldown для каждой команды
      if (command.cooldown && !client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Collection());
      }
      
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);      
    }
  }
}

//Проверка загрузки команд
client.on('interactionCreate', i => console.log(i));

// 8. Регистрация команд
client.once('ready', async () => {
  console.log(`✅ Бот ${client.user.tag} запущен!`);
  
  try {
    const rest = new REST({ version: '10' }).setToken(token);
    
    if (commands.length === 0) {
      console.error('❌ Нет команд для регистрации!');
      return;
    }

    console.log('Регистрируемые команды:', commands);

    if (process.env.ENV === 'production') {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('🔧 Команды зарегистрированы глобально');
    } else {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log('🔧 Команды зарегистрированы для сервера');
    }
  } catch (error) {
    console.error('❌ Ошибка регистрации команд:', error);
  }
});
// Глобальный таймаут (3 секунды)
const RESPONSE_TIMEOUT = 3000;
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const timeout = setTimeout(async () => {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xFF0000)
          .setTitle('⏳ Идёт обработка...')
        ],
        ephemeral: true
      });
    }
  }, RESPONSE_TIMEOUT);

  try {
    await interaction.deferReply();
    const command = client.commands.get(interaction.commandName);
    
    if (!command) {
      await interaction.editReply('⚠️ Команда не найдена');
      return;
    }

    // Проверка cooldown
    if (client.cooldowns.has(interaction.commandName)) {
      const cooldown = client.cooldowns.get(interaction.commandName);
      const userCooldown = cooldown.get(interaction.user.id);
      
      if (userCooldown && Date.now() < userCooldown) {
        const remaining = (userCooldown - Date.now()) / 1000;
        return await interaction.editReply(
          `⌛ Подождите ${remaining.toFixed(1)} сек.`
        );
      }
      
      cooldown.set(interaction.user.id, Date.now() + (command.cooldown || 3000));
    }

    const start = Date.now();
    await command.execute(interaction);
    console.log(`Команда выполнена за ${Date.now() - start}мс`);

  } catch (error) {
    console.error(`Ошибка в ${interaction.commandName}:`, error);
    const errorMsg = process.env.NODE_ENV === 'development' 
      ? `❌ ${error.message}` 
      : 'Ошибка выполнения команды';
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  } finally {
    clearTimeout(timeout);
  }
});

// Исправленный обработчик messageCreate
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  
  const command = client.commands.get(commandName) || 
    client.commands.find(cmd => cmd.aliases?.includes(commandName));

  if (!command) return message.react('❓');

  // Проверка прав
  if (command.permissions) {
    const missing = message.member?.permissions.missing(command.permissions) || [];
    if (missing.length > 0) {
      return message.reply({
        content: `❌ Требуются права: ${missing.join(', ')}`,
        allowedMentions: { repliedUser: false }
      });
    }
  }

  // Cooldown
  if (command.cooldown) {
    const cooldowns = client.cooldowns.get(command.name) || new Collection();
    const now = Date.now();
    
    if (cooldowns.has(message.author.id)) {
      const remaining = (cooldowns.get(message.author.id) - now) / 1000;
      if (remaining > 0) {
        return message.reply({
          content: `⌛ Подождите ${remaining.toFixed(1)} сек.`,
          allowedMentions: { repliedUser: false }
        });
      }
    }
    
    cooldowns.set(message.author.id, now + command.cooldown * 1000);
    client.cooldowns.set(command.name, cooldowns);
  }

  try {
    const start = Date.now();
    await command.execute(message, args);
    console.log(`Префиксная команда выполнена за ${Date.now() - start}мс`);
  } catch (error) {
    console.error(`Ошибка в ${commandName}:`, error);
    await message.reply({
      content: '❌ Ошибка выполнения',
      allowedMentions: { repliedUser: false }
    });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();
  
  // Debug: логируем полученную команду
  console.log(`[DEBUG] Получена команда: ${commandName}`, { 
    args, 
    author: message.author.tag 
  });

  // Поиск команды с учетом алиасов
  const command = client.commands.get(commandName) || 
    client.commands.find(cmd => cmd.aliases?.includes(commandName));

  if (!command) {
    console.log(`[DEBUG] Команда не найдена: ${commandName}`);
    return message.react('❓');
  }

  // Debug: информация о найденной команде
  console.log(`[DEBUG] Найдена команда:`, {
    name: command.data?.name || command.name,
    cooldown: command.cooldown || 'none'
  });

  // Проверка cooldown
  if (command.cooldown) {
    // Инициализируем коллекцию cooldowns если её нет
    if (!client.cooldowns.has(command.data.name)) {
      client.cooldowns.set(command.data.name, new Collection());
      console.log(`[DEBUG] Инициализирован cooldown для ${command.data.name}`);
    }

    const cooldowns = client.cooldowns.get(command.data.name);
    const now = Date.now();
    
    if (cooldowns.has(message.author.id)) {
      const remaining = (cooldowns.get(message.author.id) - now) / 1000;
      if (remaining > 0) {
        console.log(`[DEBUG] Cooldown для ${message.author.tag}: ${remaining.toFixed(1)}s`);
        return message.reply({
          content: `⌛ Подождите ${remaining.toFixed(1)} сек.`,
          allowedMentions: { repliedUser: false }
        });
      }
    }
    
    // Устанавливаем cooldown
    cooldowns.set(message.author.id, now + command.cooldown * 1000);
    console.log(`[DEBUG] Установлен cooldown для ${message.author.tag}`);

    // Очистка cooldown через таймер
    setTimeout(() => {
      cooldowns.delete(message.author.id);
      console.log(`[DEBUG] Очищен cooldown для ${message.author.tag}`);
    }, command.cooldown * 1000);
  }

  // Выполнение команды с обработкой ошибок
  try {
    console.log(`[DEBUG] Выполнение команды ${commandName}...`);
    
    if (!command.execute) {
      throw new Error('Метод execute не найден');
    }
    
    const startTime = Date.now();
    await command.execute(message, args);
    const execTime = Date.now() - startTime;
    
    console.log(`[DEBUG] Команда выполнена за ${execTime}мс`);
    
  } catch (error) {
    console.error(`[ERROR] Ошибка в команде ${commandName}:`, error.stack);
    
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `❌ Ошибка: ${error.message}\n\`\`\`${error.stack}\`\`\``
      : 'Произошла ошибка при выполнении команды';
    
    await message.reply({
      content: errorMessage,
      allowedMentions: { repliedUser: false }
    });
  }
});
client.on('debug', console.log);
client.on('warn', console.warn);
client.login(token).catch(console.error);