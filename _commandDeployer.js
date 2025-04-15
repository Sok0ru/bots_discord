const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('../../config.json');
const fs = require('fs');
const path = require('path');

module.exports = {
  deploy: async () => {
    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
      if (folder.startsWith('_')) continue;
      
      const folderPath = path.join(commandsPath, folder);
      const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        
        if ('data' in command) {
          commands.push(command.data.toJSON());
        }
      }
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      console.log(`Начало обновления ${commands.length} команд приложения...`);

      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );

      console.log(`Успешно перезагружено ${data.length} команд приложения.`);
    } catch (error) {
      console.error(error);
    }
  }
};