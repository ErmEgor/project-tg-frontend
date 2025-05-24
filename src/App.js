import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', message: '' });

  // Инициализация Telegram Web App
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      console.log('Telegram Web App инициализирован');
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
        setFormData((prev) => ({ ...prev, name: tg.initDataUnsafe.user.first_name || '' }));
      }
    } else {
      console.log('Telegram Web App недоступен');
    }
  }, []);

  // Обработка изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Отправка данных
  const sendDataToBot = async () => {
    const tg = window.Telegram?.WebApp;
    if (formData.name && formData.message) {
      if (tg) {
        // Попытка отправки через Telegram Web App
        try {
          console.log('Отправляем через tg.sendData:', formData);
          const data = JSON.stringify(formData);
          tg.sendData(data);
          setFormData({ name: user?.first_name || '', message: '' });
          alert('Заявка отправлена боту!');
        } catch (error) {
          console.error('Ошибка tg.sendData:', error);
          // Fallback на сервер
          await sendToServer();
        }
      } else {
        // Отправка через сервер
        await sendToServer();
      }
    } else {
      alert('Заполните все поля формы!');
    }
  };

  // Отправка данных на сервер
  const sendToServer = async () => {
    try {
      const response = await fetch('YOUR_RENDER_BOT_URL/submit', {  // Замени на URL бота после деплоя
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert('Заявка отправлена!');
        setFormData({ name: user?.first_name || '', message: '' });
      } else {
        alert('Ошибка при отправке заявки.');
      }
    } catch (error) {
      console.error('Ошибка отправки на сервер:', error);
      alert('Ошибка при отправке заявки.');
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
        <h2>За,linebreakЗакажи бота</h2>
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