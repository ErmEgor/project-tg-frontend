import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isTelegram, setIsTelegram] = useState(false);
  const [input, setInput] = useState('');

  // Инициализация Telegram Web App
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready(); // Инициализация приложения
      tg.expand(); // Разворачиваем на полный экран
      setIsTelegram(true);
      // Получаем данные пользователя
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  // Функция для отправки данных в бот
  const sendDataToBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg && input) {
      tg.sendData(input); // Отправляем введённый текст
    } else if (!input) {
      alert('Введите сообщение!');
    } else {
      alert('Это приложение должно быть открыто в Telegram!');
    }
  };

  return (
    <div className="App">
      <h1>Telegram Mini App</h1>
      {isTelegram ? (
        <>
          <p>Добро пожаловать в ваше приложение!</p>
          {user && (
            <p>
              Привет, {user.first_name} {user.last_name || ''}!
            </p>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите сообщение для бота"
            className="input-field"
          />
          <button onClick={sendDataToBot}>Отправить данные в бот</button>
          <button onClick={() => window.Telegram?.WebApp?.close()}>
            Закрыть приложение
          </button>
        </>
      ) : (
        <p>Пожалуйста, откройте это приложение в Telegram.</p>
      )}
    </div>
  );
}

export default App;
