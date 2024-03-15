const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { saveData, loadData, dayOfWeek } = require('./utils');
require('dotenv').config();

const TOKEN = process.env.BOT_TOKEN;
const CHAT_DATA_FILENAME = process.env.CHAT_DATA_FILENAME;
const CHAT_USERS_FILENAME = process.env.CHAT_USERS_FILENAME;
const QUIZ_FILENAME = process.env.QUIZ_FILENAME;
const SHEDULE_INTERVAL = process.env.SHEDULE_INTERVAL;
const ADMIN_USERNAME = process.env.UNAME;


const bot = new TelegramBot(TOKEN, { polling: true });
const quiz = loadData(QUIZ_FILENAME)
let users = loadData(CHAT_USERS_FILENAME)
var chat_ids = loadData(CHAT_DATA_FILENAME).filter(isBotInChat)

const shedule = [
    { fn: createSurvey, cmd: /\/опрос/, day: 'Воскресенье', time: '17:00', text: 'ДРУЗЬЯ!!! Домашка в среду в 19:00 🔥', options: ['Я буду', 'Меня не будет', 'Пока не знаю'], explanation: "Правильный ответ всегда буду)" },
    { fn: distributeUsers, cmd: /\/молитва/, day: 'Среда', time: '22:00' },
    { fn: sendHelpInfo, cmd: /\/помощь/ },
    { fn: createQuiz, cmd: /\/квиз/,text: 'Вопрос: ' }
]


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    const options = {
        reply_markup: {
            keyboard: [
                ["Разрешаю!"]
            ],
            resize_keyboard: true,
            one_time_keyboard: false
        }
    };

    bot.sendMessage(chatId, "Добро пожаловать! Разрешишь мне побыть с Вами?", options);
});

bot.onText(/Разрешаю!/, (msg, ...p) => {
    const chatId = msg.chat.id;

    if (chat_ids.includes(chatId)) {
        bot.sendMessage(chatId, 'Гав-гав! Я уже закреплен за Вами.')
    } else {
        saveData([...chat_ids, msg.chat.id], CHAT_DATA_FILENAME)
        chat_ids = [...chat_ids, msg.chat.id]
        const pairs = createPrayerPairs(users);
        bot.sendMessage(chatId, "Отлично! Теперь я буду с Вами!\r\n" + formatPrayerPairsMessage(pairs));
    }
});


bot.on('message', (msg) => {
    if (msg.document && msg.document.file_name.endsWith('.txt') && msg.from.username === ADMIN_USERNAME) {
        bot.downloadFile(msg.document.file_id, './').then((filePath) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading the file:', err);
                    fs.unlink(filePath)
                    return bot.sendMessage(msg.chat.id, 'Failed to read the file.');
                }

                try {
                    const jsonData = JSON.parse(data);
                    
                    if(Array.isArray(jsonData) && (jsonData.length === 0 || jsonData.some(x=>!(x.hasOwnProperty('username') && x.hasOwnProperty('name')))) ){
                        throw new Error('Invalid format')
                    }
                    fs.renameSync(filePath, changeFilename(filePath, CHAT_USERS_FILENAME))
                    bot.sendMessage(msg.chat.id, 'The users file is validated and changed.');
                    users = jsonData
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    fs.unlink(filePath,()=>{})
                    bot.sendMessage(msg.chat.id, 'The file does not contain valid JSON.');
                }
            });
        });
    }
});

function createPrayerPairs(users) {
    const shuffledUsers = shuffleArray(users);
    const pairs = [];
    for (let i = 0; i < shuffledUsers.length; i += 2) {
        if (i + 1 < shuffledUsers.length) {
            pairs.push([shuffledUsers[i], shuffledUsers[i + 1]]);
        }
    }
    return pairs;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function formatPrayerPairsMessage(pairs) {
    const message = `Дорогие братья и сестры,\n\nЯ рад приветствовать вас! Составил для нас расписание молитв, в котором каждая пара будет молиться друг за друга и за нужды ближних. Давайте ознакомимся с парами, которые будут молиться друг за друга:\n`;

    const pairMessages = pairs.map(pair => `- ${pair[0].name} (${pair[0].username}) и ${pair[1].name} (${pair[1].username})`);
    return message + pairMessages.join('\n');
}

setInterval(() => {
    shedule.forEach(item => {
        const { day, time } = item;
        if(!day || !time) return;
        const now = new Date();
        const today = now.getDay();
        const daysUntilScheduledDay = (7 + dayOfWeek(day) - today) % 7;
        const scheduledTime = new Date(now.getTime() + daysUntilScheduledDay * 24 * 60 * 60 * 1000);
        scheduledTime.setHours(Number(time.split(':')[0]), Number(time.split(':')[1]), 0, 0);

        const timeUntilScheduled = scheduledTime.getTime() - now.getTime();
        if (timeUntilScheduled < SHEDULE_INTERVAL && timeUntilScheduled >= 0) {
            console.log('Вызвана функция:' + item.fn.name)
            item.fn(item)
        }
    });
}, SHEDULE_INTERVAL)

shedule.forEach((it)=>{
    bot.onText(it.cmd, it.fn.bind(null, it))
})

function sendHelpInfo(_item, msg){
    const text = 'Команды:\r\n'+shedule.map(x=> `\t* ${x.cmd.source.slice(1)} - ${x.fn.name}`).join('\r\n')
    bot.sendMessage(msg.chat.id, text)
}

function createQuiz(item, msg) {
    const randomIdx = Math.floor(Math.random() * quiz.length);
    const question = quiz[randomIdx]
    const options = shuffleArray(question.options)
    const correct = options.findIndex(x=>x === question.correct)
    bot.sendPoll(msg.chat.id, item.text+question.title, options, { is_anonymous: false, allows_multiple_answers: false, type: 'quiz', correct_option_id: correct, disable_notification: false })
}

function createSurvey(survey, msg) {
    if(msg) bot.sendPoll(msg.chat.id, survey.text, survey.options, { is_anonymous: false, allows_multiple_answers: false, type: 'regular', correct_option_id: 0, explanation: survey.explanation, disable_notification: false })
    else chat_ids.map(cid => bot.sendPoll(cid, survey.text, survey.options, { is_anonymous: false, allows_multiple_answers: false, type: 'regular', correct_option_id: 0, explanation: survey.explanation, disable_notification: false }))
}

async function distributeUsers(_survey, msg) {
    const pairs = createPrayerPairs(users);
    if (msg) {
        bot.sendMessage(msg.chat.id, formatPrayerPairsMessage(pairs));
    }
    else
        chat_ids.map(cid => {
            bot.sendMessage(cid, formatPrayerPairsMessage(pairs));
        })
}

async function isBotInChat(chatId) {
    try {
        const chatMember = await bot.getChatMember(chatId, bot.options.username)
        return chatMember.status === 'member' || chatMember.status === 'administrator'
    }
    catch (e) {
        return false
    }
}

function changeFilename(filePath, fileName) {
    const pathParts = filePath.split('/');
    pathParts[pathParts.length - 1] = fileName;
    return pathParts.join('.');
  }