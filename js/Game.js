class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Инициализация систем игры - ОДИН РАЗ при создании игры
        this.input = new InputHandler();
        this.renderer = new Renderer(canvas);
        this.player = new Player(100, 300, 30, 50);
        
        // Игровые объекты
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        
        // Состояние игры
        this.level = 1;
        this.gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver', 'levelComplete'
        this.lastTime = 0;
        this.coinSpawnTimer = 0;
        
        // Переменные для перехода между уровнями
        this.levelComplete = false;
        this.levelTransitionTimer = 0;
        this.coinsCollected = 0;
        this.coinsRequired = 5; // Количество монет needed для перехода
        
        // Враги (дополнительная функция)
        this.enemySpawnTimer = 0;
        
        this.setupLevel();
        this.setupEventListeners(); // ОДИН РАЗ при создании игры
    }

    setupLevel() {
        // Очищаем массивы игровых объектов
        this.platforms = [];
        this.coins = [];
        this.enemies = [];
        this.coinsCollected = 0;
        this.levelComplete = false;
        this.levelTransitionTimer = 0;
        
        // Увеличиваем сложность с каждым уровнем
        this.coinsRequired = 5 + this.level * 2;
        
        // Создаем землю (основная платформа)
        this.platforms.push(new Platform(0, this.height - 50, this.width, 50, 'ground'));
        
        // Конфигурации платформ для разных уровней
        const platformConfigs = [
            // Уровень 1 - простой уровень для обучения
            [
                { x: 100, y: 400, width: 200, height: 20, type: 'normal' },
                { x: 400, y: 350, width: 150, height: 20, type: 'normal' },
                { x: 200, y: 250, width: 100, height: 20, type: 'normal' },
                { x: 500, y: 200, width: 120, height: 20, type: 'normal' }
            ],
            // Уровень 2 - добавляем движущиеся платформы
            [
                { x: 150, y: 400, width: 180, height: 20, type: 'normal' },
                { x: 450, y: 350, width: 160, height: 20, type: 'moving' },
                { x: 250, y: 280, width: 120, height: 20, type: 'normal' },
                { x: 550, y: 220, width: 100, height: 20, type: 'moving' },
                { x: 350, y: 150, width: 140, height: 20, type: 'normal' }
            ],
            // Уровень 3 - добавляем пружинящие платформы
            [
                { x: 100, y: 400, width: 150, height: 20, type: 'normal' },
                { x: 350, y: 350, width: 120, height: 20, type: 'moving' },
                { x: 200, y: 250, width: 100, height: 20, type: 'bouncy' },
                { x: 500, y: 200, width: 140, height: 20, type: 'moving' },
                { x: 300, y: 150, width: 100, height: 20, type: 'bouncy' }
            ],
            // Уровень 4+ - увеличиваем сложность
            [
                { x: 80, y: 400, width: 120, height: 20, type: 'moving' },
                { x: 300, y: 380, width: 100, height: 20, type: 'bouncy' },
                { x: 500, y: 350, width: 150, height: 20, type: 'moving' },
                { x: 200, y: 250, width: 120, height: 20, type: 'bouncy' },
                { x: 400, y: 200, width: 100, height: 20, type: 'moving' },
                { x: 600, y: 150, width: 120, height: 20, type: 'bouncy' }
            ]
        ];
        
        // Выбираем конфигурацию для текущего уровня
        const configIndex = Math.min(this.level - 1, platformConfigs.length - 1);
        const currentLevelPlatforms = platformConfigs[configIndex];
        
        // Создаем платформы согласно конфигурации
        currentLevelPlatforms.forEach(config => {
            this.platforms.push(new Platform(
                config.x, 
                config.y, 
                config.width, 
                config.height, 
                config.type
            ));
        });
        
        // УБИРАЕМ платформу-выход
        this.exitPlatform = null;
        
        // Спауним монеты для сбора
        this.spawnCoins(this.coinsRequired + 3);
        
        // Спауним врагов на высоких уровнях
        if (this.level >= 2) {
            this.spawnEnemies(Math.min(this.level, 3));
        }
        
        // Устанавливаем игрока в начальную позицию
        this.player.respawn(this.width, this.height);
    }

    // Метод для создания монет
    spawnCoins(count) {
        for (let i = 0; i < count; i++) {
            this.spawnCoin();
        }
    }

    spawnCoin() {
        const size = 15;
        let x, y;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 50; // Увеличиваем количество попыток
        
        // Ищем валидную позицию для монеты (на платформе, но не внутри нее)
        while (!validPosition && attempts < maxAttempts) {
            // Выбираем случайную платформу (кроме земли)
            const validPlatforms = this.platforms.filter(p => p.type !== 'ground');
            if (validPlatforms.length === 0) break;
            
            const platform = validPlatforms[Math.floor(Math.random() * validPlatforms.length)];
            
            // Генерируем позицию НАД платформой (на поверхности)
            x = platform.x + Math.random() * (platform.width - size);
            y = platform.y - size; // Размещаем монету прямо над платформой
            
            // Проверяем, что монета не выходит за границы платформы
            const onPlatform = x >= platform.x && 
                              x + size <= platform.x + platform.width &&
                              y + size <= platform.y && // Монета над платформой
                              y >= platform.y - size;
            
            // Проверяем, что монета не пересекается с другими монетами
            const noCoinOverlap = !this.coins.some(coin => 
                Collision.checkRectCollision(
                    { x, y, width: size, height: size },
                    { x: coin.x, y: coin.y, width: coin.size, height: coin.size }
                )
            );
            
            // Проверяем, что монета не слишком близко к краям
            const safeFromEdges = x > 20 && x + size < this.width - 20;
            
            validPosition = onPlatform && noCoinOverlap && safeFromEdges;
            attempts++;
        }
        
        if (validPosition) {
            this.coins.push({ x, y, size });
        } else {
            console.log('Не удалось найти валидную позицию для монеты');
        }
    }

    // Метод для создания врагов
    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        const size = 25;
        let validPosition = false;
        let attempts = 0;
        const maxAttempts = 20;
        
        // Ищем валидную позицию для врага (на платформе)
        while (!validPosition && attempts < maxAttempts) {
            // Выбираем случайную платформу (кроме земли и движущихся)
            const validPlatforms = this.platforms.filter(p => 
                p.type !== 'ground' && p.type !== 'moving' && p.width >= 80
            );
            if (validPlatforms.length === 0) break;
            
            const platform = validPlatforms[Math.floor(Math.random() * validPlatforms.length)];
            const x = platform.x + 10; // Отступ от края платформы
            const y = platform.y - size; // Враг стоит на платформе
            
            // Проверяем, что враг не пересекается с другими врагами
            const noEnemyOverlap = !this.enemies.some(enemy => 
                Collision.checkRectCollision(
                    { x, y, width: size, height: size },
                    { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height }
                )
            );
            
            validPosition = noEnemyOverlap;
            attempts++;
        }
        
        if (validPosition) {
            // Находим платформу, на которой стоит враг
            const platform = this.platforms.find(p => 
                validPosition && p.type !== 'ground' && p.type !== 'moving'
            );
            
            if (platform) {
                this.enemies.push({
                    x: platform.x + 10,
                    y: platform.y - size,
                    width: size,
                    height: size,
                    speed: 1 + Math.random() * 1,
                    direction: Math.random() > 0.5 ? 1 : -1,
                    platform: platform
                });
            }
        }
    }

    // Настройка обработчиков событий для кнопок UI
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restart());
    }

    // Запуск игры
    start() {
        if (this.gameState === 'menu' || this.gameState === 'gameOver') {
            this.gameState = 'playing';
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    // Пауза/продолжение игры
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }

    // Перезапуск игры - ИСПРАВЛЕННАЯ ВЕРСИЯ
    restart() {
        // Останавливаем текущий игровой цикл
        this.gameState = 'stopped';
        
        // Даем время для завершения текущего кадра анимации
        setTimeout(() => {
            // Сбрасываем уровень
            this.level = 1;
            
            // Создаем нового игрока вместо изменения существующего
            this.player = new Player(100, 300, 30, 50);
            
            // Сбрасываем состояние InputHandler
            this.input.reset();
            
            // Сбрасываем состояние игры
            this.setupLevel();
            this.gameState = 'playing';
            this.lastTime = performance.now();
            document.getElementById('gameOver').classList.add('hidden');
            
            // Запускаем игровой цикл ОДИН РАЗ
            this.gameLoop();
        }, 100);
    }

    // Основной метод обновления игры
    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        // Если уровень завершен, запускаем таймер перехода
        if (this.levelComplete) {
            this.levelTransitionTimer += deltaTime;
            if (this.levelTransitionTimer > 2000) { // 2 секунды задержки перед переходом
                this.nextLevel();
            }
            return;
        }

        // Обновляем игрока
        this.player.update(this.input, this.platforms, this.width, this.height);

        // Обновляем платформы
        this.platforms.forEach(platform => platform.update());

        // Обновляем врагов
        this.updateEnemies(deltaTime);

        // Проверяем сбор монет
        this.checkCoinCollection();

        // Проверяем столкновения с врагами
        this.checkEnemyCollisions();

        // Спауним новые монеты периодически
        this.coinSpawnTimer += deltaTime;
        if (this.coinSpawnTimer > 3000 && this.coins.length < 8) {
            this.spawnCoin();
            this.coinSpawnTimer = 0;
        }

        // Спауним новых врагов периодически на высоких уровнях
        if (this.level >= 2) {
            this.enemySpawnTimer += deltaTime;
            if (this.enemySpawnTimer > 5000 && this.enemies.length < Math.min(this.level, 4)) {
                this.spawnEnemy();
                this.enemySpawnTimer = 0;
            }
        }

        // Проверяем завершение уровня
        this.checkLevelCompletion();

        // Проверяем конец игры
        if (this.player.lives <= 0) {
            this.gameOver();
        }

        // Обновляем интерфейс
        this.updateUI();
    }

    // Метод для обновления врагов
    updateEnemies(deltaTime) {
        this.enemies.forEach(enemy => {
            // Движение врага по платформе
            enemy.x += enemy.speed * enemy.direction;
            
            // Проверяем границы платформы
            if (enemy.platform) {
                if (enemy.x <= enemy.platform.x || 
                    enemy.x + enemy.width >= enemy.platform.x + enemy.platform.width) {
                    enemy.direction *= -1; // Меняем направление
                }
            }
            
            // Ограничиваем врага в пределах экрана
            if (enemy.x < 0) enemy.x = 0;
            if (enemy.x + enemy.width > this.width) enemy.x = this.width - enemy.width;
        });
    }

    // Проверка столкновений с врагами
    checkEnemyCollisions() {
        this.enemies.forEach(enemy => {
            if (Collision.checkRectCollision(this.player, enemy)) {
                if (this.player.velocityY > 0 && this.player.y + this.player.height <= enemy.y + this.player.velocityY) {
                    // Игрок прыгнул на врага - уничтожаем врага
                    this.enemies = this.enemies.filter(e => e !== enemy);
                    this.player.addScore(100); // Бонус за врага
                    this.player.velocityY = -10; // Отскок
                } else {
                    // Игрок коснулся врага - получает урон
                    this.player.takeDamage();
                }
            }
        });
    }

    // Проверка сбора монет
    checkCoinCollection() {
        for (let i = this.coins.length - 1; i >= 0; i--) {
            if (Collision.checkCoinCollection(this.player, this.coins[i])) {
                this.player.addScore(50);
                this.coinsCollected++;
                this.coins.splice(i, 1);
            }
        }
    }

    // Проверка условий завершения уровня
    checkLevelCompletion() {
        // Уровень завершается когда собрано достаточно монет
        if (this.coinsCollected >= this.coinsRequired) {
            this.levelComplete = true;
        }
    }

    // Переход на следующий уровень
    nextLevel() {
        this.level++;
        
        // Сохраняем прогресс игрока
        const currentScore = this.player.score;
        const currentLives = this.player.lives;
        
        // Создаем нового игрока с сохраненными параметрами
        this.player = new Player(100, 300, 30, 50);
        this.player.score = currentScore;
        this.player.lives = currentLives;
        
        // Добавляем бонусную жизнь каждые 3 уровня
        if (this.level % 3 === 0) {
            this.player.lives++;
        }
        
        // Добавляем бонусные очки за переход на уровень
        this.player.addScore(100 * (this.level - 1));
        
        // Настраиваем новый уровень
        this.setupLevel();
        this.levelComplete = false;
        this.levelTransitionTimer = 0;
    }

    // Конец игры
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.player.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    // Обновление интерфейса
    updateUI() {
        document.getElementById('score').textContent = this.player.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lives').textContent = this.player.lives;
    }

    // Метод отрисовки игры
    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawGameElements(this.player, this.platforms, this.coins, this.enemies);
        
        // Оставляем только прогресс-бар (перемещен в другую сторону)
        this.renderer.drawLevelProgress(this.coinsCollected, this.coinsRequired);
        
        // Отображаем сообщение о завершении уровня
        if (this.levelComplete) {
            this.renderer.drawLevelComplete(this.level);
        }
        
        // Отображаем экран паузы
        if (this.gameState === 'paused') {
            this.renderer.drawPauseScreen();
        }
    }

    // Главный игровой цикл
    gameLoop(currentTime = 0) {
        
        if (this.gameState !== 'playing') {
            return;
        }

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        // Продолжаем цикл если игра активна
        if (this.gameState === 'playing') {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
}