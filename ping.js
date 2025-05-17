const { SlashCommandBuilder } = require('@discordjs/builders');

/* module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Проверка работы бота'),
    
  async execute(interaction) {
    // 1. Можно сразу редактировать deferred ответ
    await interaction.editReply('⌛ Измеряем задержку...');
    
    // 2. Долгие операции
    const latency = Date.now() - interaction.createdTimestamp;
    const apiPing = interaction.client.ws.ping;
    
    // 3. Финальный ответ
    await interaction.editReply({
      content: `🏓 Понг! Задержка: ${latency}мс | API: ${apiPing}мс`,
      ephemeral: false
    });
  }
}; */
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Проверка работы бота'),
  async execute(interaction) {
    await interaction.editReply('Pong!');
  }
}