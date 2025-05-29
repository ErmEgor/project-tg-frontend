import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
        setFormData((prev) => ({
          ...prev,
          name: tg.initDataUnsafe.user.first_name || `Пользователь ${tg.initDataUnsafe.user.id}`,
        }));
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const sendDataToBot = async () => {
    if (isSubmitting) {
      window.Telegram.WebApp.showAlert('Отправка уже выполняется, подождите.');
      return;
    }
    if (!formData.name || !formData.message) {
      window.Telegram.WebApp.showAlert('Ошибка: заполните имя и сообщение!');
      return;
    }
    setIsSubmitting(true);

    try {
      const response = await fetch('https://project-tg-bot.onrender.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok && result.status === 'success') {
        window.Telegram.WebApp.showAlert('Заявка успешно отправлена!');
        setFormData({ name: formData.name, message: '' });
      } else {
        throw new Error(result.message || 'Ошибка сервера');
      }
    } catch (error) {
      window.Telegram.WebApp.showAlert('Ошибка отправки: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const goBackToBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.MainButton.hide();
      const data = JSON.stringify({ action: 'back' });
      tg.sendData(data);
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
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Твоё имя"
          className="input-field"
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder="Опиши, какой бот нужен"
          className="input-field textarea"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
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