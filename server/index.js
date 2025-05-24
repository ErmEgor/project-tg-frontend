const express = require('express');
const { Telegraf } = require('telegraf');
const app = express();
const bot = new Telegraf('7650306469:AAHoO8xxuJwFV8fvJ6tyclzl6cuYYSqJYM8'); // Замени на токен от @BotFather

app.use(express.static('../telegram-mini-app/build'));

bot.command('start', (ctx) => {
  ctx.reply('Нажми кнопку ниже!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: 'https://6c7c-95-182-105-163.ngrok-free.app' } }]
      ]
    }
  });
});

bot.launch();
app.listen(3001, () => console.log('Server running on port 3001'));