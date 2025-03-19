const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription(' информация о пользователе')
		.addStringOption(option =>
		option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.reply(`
Эта команда была запущена пользователем  ${interaction.user.username}, добавлена поьзователем ${interaction.member.joinedAt}.`);
	},
};