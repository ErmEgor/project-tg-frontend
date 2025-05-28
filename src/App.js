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
      window.Telegram.WebApp.showAlert('Пропускаем Telegram, отправляем на сервер...');
      await sendToServer();
    } catch (error) {
      window.Telegram.WebApp.showAlert('Ошибка: ' + error.message);
    } finally {
      setIsSubmitting(false);
      window.Telegram.WebApp.showAlert('Завершение отправки');
    }
  };

  const sendToServer = async () => {
    try {
      window.Telegram.WebApp.showAlert('Отправляем на сервер: ' + JSON.stringify(formData));
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        window.Telegram.WebApp.showAlert('Таймаут fetch сработал'); // Отладка
      }, 5000); // Таймаут 5 секунд
      try {
        const response = await fetch('https://project-tg-server.onrender.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        const result = await response.json();
        if (response.ok) {
          window.Telegram.WebApp.showAlert('Заявка успешно отправлена на сервер!');
          setFormData({ name: user?.first_name || `Пользователь ${user?.id}`, message: '' });
        } else {
          window.Telegram.WebApp.showAlert('Ошибка сервера: ' + (result.message || 'Неизвестная ошибка'));
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error('Таймаут: сервер не ответил за 5 секунд');
        }
        throw error;
      }
    } catch (error) {
      window.Telegram.WebApp.showAlert('Ошибка связи с сервером: ' + error.message);
    }
  };

  const goBackToBot = () => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.MainButton.hide();
      window.Telegram.WebApp.showAlert('Возврат к основному меню (закрытие не работает).');
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
      <section class="skills">
        <h2>Мои навыки</h2>
        <p>Я создаю Telegram-ботов и веб-приложения. Мои проекты — это сочетание функциональности, современного дизайна и удобства.</p>
      </section>
      <section class="projects">
        <h2>Мои проекты</h2>
        <div class="project-grid">
          <div class="project-card">
            <h3>Лендинг</h3>
            <p>Одностраничный сайт с красивым дизайном и рабочими кнопками.</p>
            <a href="https://ermegor.github.io/BuildMax/" target="_blank" rel="noopener noreferrer" class="project-button">
              Посмотреть
            </a>
          </div>
          <div class="project-card">
            <h3>Telegram-бот</h3>
            <p>Интерактивный бот для общения и демонстрации навыков.</p>
            <a href="https://t.me/prostof2p" target="_blank" rel="noopener noreferrer" class="project-button">
              Перейти к боту
            </a>
          </div>
        </div>
      </section>
      <section class="contact-form">
        <h2>Заказать услуги</h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Твоё имя"
          class="input-field"
        />
        <textarea
          name="message"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder="Опиши, какой бот нужен"
          class="input-field textarea"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <button onClick={sendDataToBot} disabled={isSubmitting}>
          {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
        </button>
      </section>
      <button class="close-button" onClick={goBackToBot}>
        Вернуться к боту
      </button>
    </div>
  );
}

export default App;