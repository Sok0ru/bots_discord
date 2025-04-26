const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('heavy-task')
      .setDescription('Долгая операция'),
  
    async execute(interaction) {
      // Уже вызвано deferReply в основном обработчике
      
      // Имитация долгой операции (5 сек)
      await new Promise(resolve => setTimeout(resolve, 5000));
  
      // Обновляем ответ
      await interaction.editReply('✅ Операция завершена!');
    }
  };