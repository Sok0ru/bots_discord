const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Выдает роль')
    .addStringOption(option =>
      option.setName('role')
        .setDescription('Выберите роль')
        .setRequired(true)
        .addChoices(
          { name: 'Администратор', value: 'admin' },
          { name: 'Модератор', value: 'moderator' },
          { name: 'Пользователь', value: 'user' },
        )),
   // Логика выдачи роли
  async execute(interaction) {
    const role = interaction.options.getString('role');
   
  }
};