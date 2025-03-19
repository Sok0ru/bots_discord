const { Events } = require('discord.js');

module.exports = {
	name: Events.robot.ready,
	once: true,
	execute(robot) {
		console.log(`работает! вызван ${robot.user.tag}`);
	},
};