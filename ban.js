const PermissionFlagsBits = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Банит пользователя')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Пользователь для бана')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Причина бана'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),
  
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Причина не указана';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ 
        content: 'У вас нет прав на использование этой команды!',
        ephemeral: true 
      });
    }

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply(`Пользователь ${user.tag} был забанен по причине: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'Произошла ошибка при попытке забанить пользователя!',
        ephemeral: true 
      });
    }
  }
};