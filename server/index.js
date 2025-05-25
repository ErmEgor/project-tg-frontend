const express = require('express');
const { Telegraf } = require('telegraf');
const app = express();
const bot = new Telegraf('7711881075:AAHIzBzogyLUSeitdeWzR2Ahq-KpN1MTR9U'); // Замени на токен от @BotFather

app.use(express.static('../telegram-mini-app/build'));

bot.command('start', (ctx) => {
  ctx.reply('Нажми кнопку ниже!', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть приложение', web_app: { url: 'https://telegram-mini-9vtyr1wee-ermegors-projects.vercel.app/' } }]
      ]
    }
  });
});

bot.launch();
app.listen(3001, () => console.log('Server running on port 3001'));