const { SlashCommandBuilder } = require('@discordjs/builders');

  module.exports = {
    name: 'clear',
    aliases: ['purge', 'cls'],
    description: 'Удаляет сообщения',
    permissions: ['ManageMessages'],
    cooldown: 3000,
    
    async execute(message, args) {
      const amount = parseInt(args[0]) || 10;
      await message.channel.bulkDelete(Math.min(amount, 100) + 1);
    }
  };