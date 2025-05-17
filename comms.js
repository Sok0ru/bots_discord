const config = require('./config.json'); // Подключаем файл с параметрами и информацией
const Discord = require('discord.js'); // Подключаем библиотеку discord.js
const prefix = config.prefix; // «Вытаскиваем» префикс
const words = ["иди нахуй"]; // Слова можно задать на любом языке
const starter_encouragements = ["ты рыцаря нахуй послал? А извиниться не хочешь????"];
const starter_who_Dania_ments = ["lox"];
const starter_serega_ments = ["полисорб, подвид нытик"];

// Команды //

function test(robot, mess, args) {
  mess.channel.send('Test!')
}


// Список команд //

var comms_list = [{
  name: "test",
  out: test,
  about: "Тестовая команда"
}];

// Name - название команды, на которую будет реагировать бот
// Out - название функции с командой
// About - описание команды 

module.exports.comms = comms_list;

// Команды //

function test(robot, mess, args) {
    if (words.some(word => mess.content.includes(word))) {
        mess.channel.send("Почему вы грустите? Может быть, я могу вам помочь?");
    } else {
        mess.channel.send('Test!');
    }
}
//old version function, non work
function idi_nahui2(robot, mess, args) {
    const encouragement = starter_encouragements[starter_encouragements.length];
    mess.channel.send(encouragement);
}
function idi_nahui(robot, mess, args) {
    if (words.some(word => mess.content.includes(word))) {
        mess.channel.send("Почему вы грустите? Может быть, я могу вам помочь?");
    } else {
        mess.channel.send('ты рыцаря нахуй послал? А извиниться не хочешь????');
    }
}
//old version function, non work
function who_Dania2(robot, mess, args) {
    const who_Dania_ment = starter_who_Dania_ments[starter_who_Dania_ments.length];
    mess.channel.send(who_Dania_ment);
}
function who_Dania(robot, mess, args) {
    if (words.some(word => mess.content.includes(word))) {
        mess.channel.send(" ");
    } else {
        mess.channel.send('lox');
    }
}

function serega(robot, mess, args) {
    if (words.some(word => mess.content.includes(word))) {
        mess.channel.send(" ");
    } else {
        mess.channel.send('нытик, подвид полисорбовых');
    }
}
//old version function, non work
function seregaa(robot, mess, args) {
    const serega_ment = starter_serega_ments[starter_serega_ments.length];
    mess.channel.send(serega_ment);
}

// Список команд //

var comms_list = [
    {
        name: "test",
        out: test,
        about: "Тестовая команда"
    },
    {
        name: "idi_nahui",
        out: idi_nahui,
        about: "Подбодрить пользователя"
    },
    {
        name: "who_Dania",
        out: who_Dania,
        about: "кто этот ваш Даня"
    },
    {
        name: "serega",
        out: serega,
        about: "серега"
    },
    ///
];


module.exports.comms = comms_list;