/*
const { Events } = require('discord.js');
module.exports = {
	name: Events.client.ready,
	once: true,
	execute(client) {
		console.log(`работает! вызван ${client.user.tag}`);
	},
};*/
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const { Client} = require('discord.js');
require('dotenv').config();

const client = new Client();
const commands = []; // Ваши команды в формате JSON

// Асинхронная инициализация
const initialize = async () => {
  try {
    await client.login(process.env.TOKEN);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    await rest.put(
      Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✅ Готово!');
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error);
  }
};

initialize(); // Запуск асинхронной инициализации