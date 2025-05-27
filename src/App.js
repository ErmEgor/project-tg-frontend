import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
  const tg = window.Telegram?.WebApp;
  console.log('Проверка Telegram.WebApp:', tg ? 'Найден' : 'Не найден');
  if (tg) {
    console.log('Web App инициализирован');
    console.log('initDataUnsafe:', JSON.stringify(tg.initDataUnsafe, null, 2));
    tg.ready();
    tg.expand();
    if (tg.initDataUnsafe?.user) {
      console.log('Пользователь:', JSON.stringify(tg.initDataUnsafe.user, null, 2));
      alert(`Пользователь: ID ${tg.initDataUnsafe.user.id}, Имя: ${tg.initDataUnsafe.user.first_name || 'не указано'}`);
      setUser(tg.initDataUnsafe.user);
      setFormData((prev) => ({
        ...prev,
        name: tg.initDataUnsafe.user.first_name || `Пользователь ${tg.initDataUnsafe.user.id}`,
      }));
    } else {
      console.log('Пользователь не найден в initDataUnsafe');
      alert('Пользователь не найден в initDataUnsafe');
      console.log('Полный initDataUnsafe:', JSON.stringify(tg.initDataUnsafe, null, 2));
    }
  } else {
    console.log('Telegram Web App не инициализирован');
    alert('Telegram Web App не инициализирован');
  }
}, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendDataToBot = async () => {
    if (isSubmitting) return;
    if (!formData.name || !formData.message) {
      alert('Заполните все поля формы!');
      return;
    }

    setIsSubmitting(true);
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      try {
        const data = JSON.stringify(formData);
        await tg.sendData(data);
        setFormData({ name: user?.first_name || `Пользователь ${user?.id}`, message: '' });
        alert('Заявка отправлена боту!');
      } catch (error) {
        alert('Ошибка при отправке через Telegram, пробуем через сервер');
        await sendToServer();
      }
    } else {
      await sendToServer();
    }
    setIsSubmitting(false);
  };

  const sendToServer = async () => {
    try {
      const response = await fetch('https://project-tg-server.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok) {
        alert('Заявка отправлена через сервер!');
        setFormData({ name: user?.first_name || `Пользователь ${user?.id}`, message: '' });
      } else {
        alert(`Ошибка при отправке заявки: ${result.message || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      alert('Ошибка при отправке заявки: сервер недоступен');
    }
  };

  const goBackToBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.sendData(JSON.stringify({ action: 'back' }));
      alert('Отправлен запрос на возврат в меню бота');
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
            Привет, {user.first_name || `Пользователь ${user.id}`} {user.last_name || ''}!
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
        <button onClick={sendDataToBot} disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </section>
      <button className="close-button" onClick={goBackToBot}>
        Вернуться к боту
      </button>
    </div>
  );
}

export default App;