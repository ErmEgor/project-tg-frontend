import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', message: '' });

  // Инициализация Telegram Web App
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      console.log('Telegram Web App инициализирован:', tg.initDataUnsafe);
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
        setFormData((prev) => ({ ...prev, name: tg.initDataUnsafe.user.first_name || '' }));
      } else {
        console.log('Пользователь не авторизован в Telegram Web App');
      }
    } else {
      console.error('Telegram Web App недоступен');
    }
  }, []);

  // Обработка изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Отправка данных
  const sendDataToBot = async () => {
    if (!formData.name || !formData.message) {
      alert('Заполните все поля формы!');
      return;
    }

    const tg = window.Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      // Попытка отправки через Telegram Web App
      try {
        console.log('Отправляем через tg.sendData:', formData);
        const data = JSON.stringify(formData);
        tg.sendData(data);
        console.log('Данные отправлены через tg.sendData');
        setFormData({ name: user?.first_name || '', message: '' });
        alert('Заявка отправлена боту!');
      } catch (error) {
        console.error('Ошибка tg.sendData:', error);
        // Fallback на сервер
        await sendToServer();
      }
    } else {
      console.log('Telegram Web App недоступен, отправляем через сервер');
      await sendToServer();
    }
  };

  // Отправка данных на сервер
  const sendToServer = async () => {
    try {
      console.log('Отправляем POST-запрос на сервер:', formData);
      const response = await fetch('https://telegram-bot-k3q0.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      console.log('Ответ сервера:', result);
      if (response.ok) {
        alert('Заявка отправлена через сервер!');
        setFormData({ name: user?.first_name || '', message: '' });
      } else {
        console.error('Ошибка сервера:', result);
        alert(`Ошибка при отправке заявки: ${result.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка отправки на сервер:', error);
      alert('Ошибка при отправке заявки: сервер недоступен');
    }
  };

  // Закрытие приложения
  const closeApp = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.close();
    } else {
      alert('Это действие доступно только в Telegram.');
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Портфолио Егора</h1>
        {user && (
          <p className="welcome-text">
            Привет, {user.first_name} {user.last_name || ''}!
          </p>
        )}
      </header>
      <section className="skills">
        <h2>Мои навыки</h2>
        <p>Я создаю Telegram-ботов и веб-приложения. Мои проекты — это сочетание функциональности, современного дизайна и удобства.</p>
      </section>
      <section className="projects">
        <h2>Мои проекты</h2>
        <div className="project-grid">
          <div className="project-card">
            <h3>Лендинг</h3>
            <p>Одностраничный сайт с красивым дизайном и рабочими кнопками.</p>
            <a href="https://ermegor.github.io/BuildMax/" target="_blank" rel="noopener noreferrer" className="project-button">
              Посмотреть
            </a>
          </div>
          <div className="project-card">
            <h3>Telegram-бот</h3>
            <p>Интерактивный бот для общения и демонстрации навыков.</p>
            <a href="https://t.me/prostof2p" target="_blank" rel="noopener noreferrer" className="project-button">
              Перейти к боту
            </a>
          </div>
        </div>
      </section>
      <section className="contact-form">
        <h2>Заказать услуги</h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Твоё имя"
          className="input-field"
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          placeholder="Опиши, какой бот нужен"
          className="input-field textarea"
        />
        <button onClick={sendDataToBot}>Отправить заявку</button>
      </section>
      <button className="close-button" onClick={closeApp}>
        Закрыть приложение
      </button>
    </div>
  );
}

export default App;