module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
      if (!interaction.isChatInputCommand()) return;
  
      const command = interaction.client.commands.get(interaction.commandName);
  
      if (!command) {
        console.error(`Команда ${interaction.commandName} не найдена.`);
        return;
      }
  
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ 
            content: 'Произошла ошибка при выполнении команды!', 
            ephemeral: true 
          });
        } else {
          await interaction.reply({ 
            content: 'Произошла ошибка при выполнении команды!', 
            ephemeral: true 
          });
        }
      }
    }
  };