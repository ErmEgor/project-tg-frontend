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
       }
     }, []);

     const handleInputChange = (e) => {
       const { name, value } = e.target;
       alert(`Input changed: name=${name}, value=${value}`);
       setFormData((prev) => ({ ...prev, [name]: value }));
     };

     const handleKeyDown = (e) => {
       alert(`Key pressed: ${e.key}`);
       if (e.key.length === 1) {
         setFormData((prev) => {
           const newValue = prev.message + e.key;
           alert(`Manually updated value: ${newValue}`);
           return { ...prev, message: newValue };
         });
       } else if (e.key === 'Backspace') {
         setFormData((prev) => {
           const newValue = prev.message.slice(0, -1);
           alert(`Manually updated value: ${newValue}`);
           return { ...prev, message: newValue };
         });
       } else if (e.key === 'Enter') {
         setFormData((prev) => {
           const newValue = prev.message + '\n';
           alert(`Manually updated value: ${newValue}`);
           return { ...prev, message: newValue };
         });
         e.preventDefault();
       }
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
           alert('Ошибка при отправке через Telegram: ' + error.message);
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
             onKeyDown={handleKeyDown}
             placeholder="Опиши, какой бот нужен"
             className="input-field textarea"
             autoFocus
           />
           <p>Текущий текст в textarea: {formData.message}</p>
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