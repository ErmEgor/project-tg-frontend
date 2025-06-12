import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' });
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
          contact: tg.initDataUnsafe.user.username ? `@${tg.initDataUnsafe.user.username}` : '',
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
    if (!formData.name || !formData.contact || !formData.message) {
      window.Telegram.WebApp.showAlert('Ошибка: заполните все поля!');
      return;
    }
    // Валидация формата contact (Telegram-username или email)
    if (!formData.contact.match(/^(@[A-Za-z0-9_]{5,32}|[^@]+@[^@]+\.[^@]+)$/)) {
      window.Telegram.WebApp.showAlert('Ошибка: введите корректный Telegram (@username) или email!');
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
        setFormData((prev) => ({ ...prev, message: '' }));
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
      try {
        tg.ready(); // Повторная инициализация для надёжности
        tg.close(); // Закрываем WebApp, возвращая в чат с ботом
      } catch (error) {
        console.error('Ошибка при закрытии WebApp:', error);
        window.Telegram.WebApp.showAlert('Не удалось вернуться к боту: ' + error.message);
      }
    } else {
      console.error('Telegram WebApp API недоступен');
      window.alert('Ошибка: Telegram WebApp API недоступен. Попробуйте открыть приложение через Telegram.');
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
          {/* ----- НАЧАЛО ИЗМЕНЕНИЙ ----- */}
          <div className="project-card">
            <h3>Бот-визитка</h3>
            <p>Интерактивный бот для общения и демонстрации ваших услуг.</p>
            <a href="https://t.me/eegorhelper_bot" target="_blank" rel="noopener noreferrer" className="project-button">
              Перейти к боту
            </a>
          </div>
          <div className="project-card">
            <h3>Бот-каталог</h3>
            <p>Демонстрация товаров или услуг в удобном для клиента формате.</p>
            <a href="https://t.me/techspherez_bot" target="_blank" rel="noopener noreferrer" className="project-button">
              Перейти к боту
            </a>
          </div>
          <div className="project-card">
            <h3>Бот-отзывы</h3>
            <p>Автоматизированный сбор и публикация отзывов от ваших клиентов.</p>
            <a href="https://t.me/aromagia_bot" target="_blank" rel="noopener noreferrer" className="project-button">
              Перейти к боту
            </a>
          </div>
          <div className="project-card">
            <h3>Бот для записи на услуги</h3>
            <p>Позволяет клиентам записываться на ваши услуги онлайн 24/7.</p>
            <a href="https://t.me/aeternaz_bot" target="_blank" rel="noopener noreferrer" className="project-button">
              Перейти к боту
            </a>
          </div>
          {/* ----- КОНЕЦ ИЗМЕНЕНИЙ ----- */}
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
        <input
          type="text"
          name="contact"
          value={formData.contact}
          onChange={(e) => setFormData((prev) => ({ ...prev, contact: e.target.value }))}
          placeholder="Telegram (@username) или email"
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