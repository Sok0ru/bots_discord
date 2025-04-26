const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Проверка задержки бота'),
  async execute(interaction) {
    await interaction.reply(`Понг! Задержка: ${interaction.client.ws.ping}мс`);
  }
};