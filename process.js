const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
      .setName('process')
      .setDescription('Долгая обработка данных'),
    defer: true, // Флаг для автоматического defer
  
    async execute(interaction) {
      // 1. Получаем данные
      const data = await fetchData(); 
      
      // 2. Промежуточный ответ
      await interaction.editReply('⌛ Обработка...');
      
      // 3. Долгая операция
      const result = await heavyProcessing(data);
      
      // 4. Финальный ответ
      await interaction.editReply(`✅ Результат: ${result}`);
    }
  };