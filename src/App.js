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
        tg.showAlert('Web App инициализирован, пользователь: ' + (tg.initDataUnsafe.user.first_name || 'Неизвестно'));
      } else {
        tg.showAlert('Пользователь Telegram не найден!');
      }
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.alert('Telegram WebApp недоступен! Открыто вне Telegram.');
    }
  }, []);

  // Функция для установки таймаута с явным контролем
  const withTimeout = (promise, timeoutMs, errorMessage) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  };

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
    const tg = window.Telegram?.WebApp;
    if (tg && tg.initDataUnsafe?.user) {
      try {
        const data = JSON.stringify(formData);
        window.Telegram.WebApp.showAlert('Отправляем данные в Telegram: ' + data);
        await withTimeout(tg.sendData(data), 5000, 'Таймаут: Telegram не ответил');
        window.Telegram.WebApp.showAlert('Заявка успешно отправлена боту!');
      } catch (error) {
        window.Telegram.WebApp.showAlert('Ошибка Telegram: ' + error.message + '. Пробуем сервер...');
        await sendToServer();
      }
    } else {
      window.Telegram.WebApp.showAlert('Telegram WebApp недоступен, отправляем на сервер.');
      await sendToServer();
    }
    setIsSubmitting(false); // Убедимся, что кнопка разблокируется
    window.Telegram.WebApp.showAlert('Завершение отправки'); // Отладочный алерт
  };

  const sendToServer = async () => {
    try {
      window.Telegram.WebApp.showAlert('Отправляем на сервер: ' + JSON.stringify(formData));
      const response = await fetch('https://project-tg-server.onrender.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok) {
        window.Telegram.WebApp.showAlert('Заявка успешно отправлена на сервер!');
        setFormData({ name: user?.first_name || `Пользователь ${user?.id}`, message: '' });
      } else {
        window.Telegram.WebApp.showAlert('Ошибка сервера: ' + (result.message || 'Неизвестная ошибка'));
      }
    } catch (error) {
      window.Telegram.WebApp.showAlert('Ошибка связи с сервером: ' + error.message);
    }
  };

  const goBackToBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      try {
        tg.close();
        window.Telegram.WebApp.showAlert('Закрываем Web App, возврат к боту.');
      } catch (error) {
        window.Telegram.WebApp.showAlert('Ошибка при закрытии: ' + error.message);
      }
    } else {
      window.alert('Это действие доступно только в Telegram.');
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