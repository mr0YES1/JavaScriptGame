class Renderer {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.particleSystems = []; // Система частиц для эффектов
    }

    // Очистка canvas
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Отрисовка фона с градиентом и облаками
    drawBackground() {
        // Создаем градиент для неба (от голубого к светло-зеленому)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB'); // Голубой (небо)
        gradient.addColorStop(0.7, '#98FB98'); // Светло-зеленый (земля)
        gradient.addColorStop(1, '#90EE90'); // Зеленый (ближе к земле)
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем солнце
        this.drawSun();

        // Рисуем облака
        this.drawClouds();

        // Рисуем дальние горы (параллакс-эффект)
        this.drawMountains();
    }

    // Отрисовка солнца
    drawSun() {
        this.ctx.fillStyle = '#FFD700'; // Золотой цвет
        this.ctx.beginPath();
        this.ctx.arc(700, 80, 40, 0, Math.PI * 2); // Солнце в правом верхнем углу
        this.ctx.fill();

        // Лучи солнца
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI) / 6;
            const startX = 700 + Math.cos(angle) * 45;
            const startY = 80 + Math.sin(angle) * 45;
            const endX = 700 + Math.cos(angle) * 60;
            const endY = 80 + Math.sin(angle) * 60;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }

    // Отрисовка облаков
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // Облако 1
        this.drawCloud(100, 80, 60);
        // Облако 2
        this.drawCloud(300, 120, 40);
        // Облако 3
        this.drawCloud(600, 90, 50);
        // Облако 4
        this.drawCloud(200, 150, 30);
        // Облако 5
        this.drawCloud(500, 180, 35);
    }

    // Отрисовка одного облака
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        // Основные круги облака
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.9, y - size * 0.1, size * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Отрисовка гор на заднем плане
    drawMountains() {
        this.ctx.fillStyle = 'rgba(139, 69, 19, 0.3)'; // Коричневый с прозрачностью
        
        // Гора 1
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height - 100);
        this.ctx.lineTo(200, 200);
        this.ctx.lineTo(400, this.canvas.height - 100);
        this.ctx.fill();

        // Гора 2
        this.ctx.beginPath();
        this.ctx.moveTo(300, this.canvas.height - 100);
        this.ctx.lineTo(500, 250);
        this.ctx.lineTo(700, this.canvas.height - 100);
        this.ctx.fill();

        // Гора 3
        this.ctx.beginPath();
        this.ctx.moveTo(600, this.canvas.height - 100);
        this.ctx.lineTo(750, 300);
        this.ctx.lineTo(900, this.canvas.height - 100);
        this.ctx.fill();
    }

    // Отрисовка всех игровых элементов
    drawGameElements(player, platforms, coins, enemies) {
        // Сначала рисуем платформы
        platforms.forEach(platform => {
            // УБИРАЕМ отрисовку платформы-выхода
            platform.draw(this.ctx);
        });

        // Затем рисуем монеты
        coins.forEach(coin => {
            this.drawCoin(coin);
        });

        // Затем рисуем врагов
        enemies.forEach(enemy => {
            this.drawEnemy(enemy);
        });

        // Игрок рисуется последним (поверх всего)
        player.draw(this.ctx);

        // Отрисовываем частицы эффектов
        this.drawParticles();
    }

    // Отрисовка монеты с анимацией
    drawCoin(coin) {
        const time = Date.now() * 0.01;
        const scale = 1 + Math.sin(time) * 0.1; // Пульсация монеты
        
        this.ctx.save();
        this.ctx.translate(coin.x + coin.size / 2, coin.y + coin.size / 2);
        this.ctx.scale(scale, scale);
        
        // Основной круг монеты
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Блеск монеты
        this.ctx.fillStyle = '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(-coin.size / 4, -coin.size / 4, coin.size / 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Контур монеты
        this.ctx.strokeStyle = '#B8860B';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, coin.size / 2, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    // Отрисовка врага
    drawEnemy(enemy) {
        // Тело врага
        this.ctx.fillStyle = '#8B0000'; // Темно-красный
        this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Глаза врага
        this.ctx.fillStyle = '#FFF';
        const eyeSize = enemy.width * 0.2;
        this.ctx.fillRect(enemy.x + enemy.width * 0.2, enemy.y + enemy.height * 0.3, eyeSize, eyeSize);
        this.ctx.fillRect(enemy.x + enemy.width * 0.6, enemy.y + enemy.height * 0.3, eyeSize, eyeSize);
        
        // Зрачки
        this.ctx.fillStyle = '#000';
        const pupilOffset = enemy.direction > 0 ? 0 : eyeSize * 0.5;
        this.ctx.fillRect(enemy.x + enemy.width * 0.2 + pupilOffset, enemy.y + enemy.height * 0.3, eyeSize * 0.5, eyeSize * 0.5);
        this.ctx.fillRect(enemy.x + enemy.width * 0.6 + pupilOffset, enemy.y + enemy.height * 0.3, eyeSize * 0.5, eyeSize * 0.5);
        
        // Рот
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(enemy.x + enemy.width * 0.3, enemy.y + enemy.height * 0.7, enemy.width * 0.4, enemy.height * 0.1);
        
        // Шипы на спине
        this.ctx.fillStyle = '#FF0000';
        for (let i = 0; i < 3; i++) {
            const spikeX = enemy.x + enemy.width * 0.2 + i * enemy.width * 0.3;
            this.ctx.beginPath();
            this.ctx.moveTo(spikeX, enemy.y);
            this.ctx.lineTo(spikeX + enemy.width * 0.15, enemy.y - enemy.height * 0.3);
            this.ctx.lineTo(spikeX + enemy.width * 0.3, enemy.y);
            this.ctx.fill();
        }
    }

    // УБИРАЕМ отрисовку основного интерфейса пользователя
    // drawUI(score, level, lives) { ... }

    // Отрисовка прогресса уровня (сбор монет) - ПЕРЕМЕЩАЕМ В ЛЕВЫЙ ВЕРХНИЙ УГОЛ
    drawLevelProgress(collected, required) {
        const progressWidth = 200;
        const progressHeight = 25;
        const x = 20; // Перемещаем в левый верхний угол
        const y = 20;
        
        // Фон прогресс-бара
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, progressWidth, progressHeight);
        
        // Белая рамка
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, progressWidth, progressHeight);
        
        // Заполнение прогресс-бара
        const progress = Math.min(collected / required, 1);
        const fillWidth = (progressWidth - 4) * progress;
        
        this.ctx.fillStyle = '#FFD700'; // Золотой цвет для прогресса
        this.ctx.fillRect(x + 2, y + 2, fillWidth, progressHeight - 4);
        
        // Текст прогресса
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            `Монеты: ${collected}/${required}`,
            x + progressWidth / 2,
            y + progressHeight / 2
        );
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }

    // Отрисовка экрана завершения уровня
    drawLevelComplete(level) {
        // Полупрозрачный черный фон
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Основное сообщение
        this.ctx.fillStyle = '#4CAF50'; // Зеленый цвет успеха
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('УРОВЕНЬ ПРОЙДЕН!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Информация об уровне
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.fillText(`Уровень ${level} завершен`, this.canvas.width / 2, this.canvas.height / 2);
        
        // Сообщение о переходе
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Переход на следующий уровень...', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        // Анимация летящих звезд
        this.drawFlyingStars();
        
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }

    // Отрисовка летящих звезд для эффекта завершения уровня
    drawFlyingStars() {
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 5; i++) {
            const starX = (this.canvas.width / 2) + Math.sin(time + i) * 200;
            const starY = (this.canvas.height / 2 - 30) + Math.cos(time * 0.7 + i) * 100;
            const size = 5 + Math.sin(time * 2 + i) * 3;
            
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(starX, starY, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Лучи звезды
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 1;
            for (let j = 0; j < 8; j++) {
                const angle = (j * Math.PI) / 4;
                const rayLength = size * 2;
                this.ctx.beginPath();
                this.ctx.moveTo(starX, starY);
                this.ctx.lineTo(
                    starX + Math.cos(angle) * rayLength,
                    starY + Math.sin(angle) * rayLength
                );
                this.ctx.stroke();
            }
        }
    }

    // Отрисовка экрана паузы
    drawPauseScreen() {
        // Полупрозрачный черный фон
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Текст паузы
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ПАУЗА', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Инструкция
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Нажмите "Пауза" для продолжения', this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        // Иконка паузы
        this.ctx.fillStyle = '#FFF';
        const iconSize = 40;
        const iconX = this.canvas.width / 2 - iconSize * 1.5;
        const iconY = this.canvas.height / 2 - 150;
        
        // Два прямоугольника для иконки паузы
        this.ctx.fillRect(iconX, iconY, iconSize, iconSize * 2);
        this.ctx.fillRect(iconX + iconSize * 2, iconY, iconSize, iconSize * 2);
        
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }

    // Отрисовка экрана окончания игры
    drawGameOver(score) {
        // Полупрозрачный черный фон
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Текст "Игра окончена"
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ИГРА ОКОНЧЕНА', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        // Отображение счета
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText(`Ваш счет: ${score}`, this.canvas.width / 2, this.canvas.height / 2);
        
        // Инструкция
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Нажмите "Рестарт" для новой игры', this.canvas.width / 2, this.canvas.height / 2 + 80);
        
        // Анимация падающих букв для драматического эффекта
        this.drawFallingLetters();
        
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }

    // Отрисовка падающих букв для экрана окончания игры
    drawFallingLetters() {
        const time = Date.now() * 0.001;
        const letters = ['G', 'A', 'M', 'E', 'O', 'V', 'E', 'R'];
        
        for (let i = 0; i < letters.length; i++) {
            const letterX = 100 + i * 80;
            const fallOffset = Math.sin(time * 2 + i) * 50;
            const letterY = 150 + fallOffset;
            
            this.ctx.fillStyle = `hsl(${i * 45}, 100%, 60%)`;
            this.ctx.font = 'bold 40px Arial';
            this.ctx.fillText(letters[i], letterX, letterY);
        }
    }

    // Создание системы частиц для эффектов
    createParticleSystem(x, y, color, count = 10) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1.0,
                color: color,
                size: Math.random() * 4 + 2
            });
        }
        this.particleSystems.push(particles);
    }

    // Отрисовка и обновление частиц
    drawParticles() {
        for (let i = this.particleSystems.length - 1; i >= 0; i--) {
            const particles = this.particleSystems[i];
            
            for (let j = particles.length - 1; j >= 0; j--) {
                const particle = particles[j];
                
                // Обновление позиции
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.1; // Гравитация
                particle.life -= 0.02;
                
                // Отрисовка частицы
                if (particle.life > 0) {
                    this.ctx.globalAlpha = particle.life;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Удаление "мертвых" частиц
                    particles.splice(j, 1);
                }
            }
            
            // Удаление пустых систем частиц
            if (particles.length === 0) {
                this.particleSystems.splice(i, 1);
            }
        }
        this.ctx.globalAlpha = 1.0;
    }

    // Отрисовка начального экрана (меню)
    drawMenuScreen() {
        // Градиентный фон
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a2a6c');
        gradient.addColorStop(0.5, '#b21f1f');
        gradient.addColorStop(1, '#fdbb2d');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Заголовок игры
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 72px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('ПЛАТФОРМЕР', this.canvas.width / 2, this.canvas.height / 2 - 100);
        
        // Инструкция
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Нажмите "Старт" чтобы начать игру', this.canvas.width / 2, this.canvas.height / 2);
        
        // Управление
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Управление: ← → для движения, Space для прыжка', this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        // Автор
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Создано с помощью JavaScript', this.canvas.width / 2, this.canvas.height - 50);
        
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'alphabetic';
    }
}