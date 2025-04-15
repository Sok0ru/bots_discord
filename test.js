const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
    data: new SlashCommandBuilder()
      .setName('test')
      .setDescription('Test command'),
    execute: async (interaction) => {
      await interaction.reply('Работает!');
    }
  };