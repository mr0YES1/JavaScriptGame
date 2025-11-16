class InputHandler {
    constructor() {
        this.keys = {};
        this.isInitialized = false; // Флаг для отслеживания инициализации
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Защита от повторной инициализации
        if (this.isInitialized) {
            return;
        }
        
        // Обработчик нажатия клавиш
        const keyDownHandler = (event) => {
            // Предотвращаем повторную обработку той же клавиши
            if (!this.keys[event.key]) {
                this.keys[event.key] = true;
            }
            
            // Предотвращаем прокрутку страницы при нажатии пробела или стрелок
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
            }
        };

        // Обработчик отпускания клавиш
        const keyUpHandler = (event) => {
            this.keys[event.key] = false;
            
            // Предотвращаем прокрутку страницы при нажатии пробела или стрелок
            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
            }
        };

        // Добавляем обработчики
        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);

        // Сохраняем ссылки на обработчики для возможного удаления
        this.keyDownHandler = keyDownHandler;
        this.keyUpHandler = keyUpHandler;

        // Touch controls for mobile
        this.setupTouchControls();
        
        this.isInitialized = true;
    }

    setupTouchControls() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const jumpBtn = document.getElementById('jumpBtn');

        // Функции для обработки касаний
        const handleTouchStart = (key) => {
            return () => {
                this.keys[key] = true;
            };
        };

        const handleTouchEnd = (key) => {
            return () => {
                this.keys[key] = false;
            };
        };

        // Добавляем обработчики для кнопок управления
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', handleTouchStart('ArrowLeft'), { passive: true });
            leftBtn.addEventListener('touchend', handleTouchEnd('ArrowLeft'), { passive: true });
            leftBtn.addEventListener('touchcancel', handleTouchEnd('ArrowLeft'), { passive: true });
        }

        if (rightBtn) {
            rightBtn.addEventListener('touchstart', handleTouchStart('ArrowRight'), { passive: true });
            rightBtn.addEventListener('touchend', handleTouchEnd('ArrowRight'), { passive: true });
            rightBtn.addEventListener('touchcancel', handleTouchEnd('ArrowRight'), { passive: true });
        }

        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', handleTouchStart(' '), { passive: true });
            jumpBtn.addEventListener('touchend', handleTouchEnd(' '), { passive: true });
            jumpBtn.addEventListener('touchcancel', handleTouchEnd(' '), { passive: true });
        }
    }

    // Проверка нажатия конкретной клавиши
    isKeyPressed(key) {
        return this.keys[key] || false;
    }

    // Получение направления горизонтального движения
    getHorizontalMovement() {
        let direction = 0;
        
        // Проверяем клавиши движения влево
        if (this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a') || this.isKeyPressed('A')) {
            direction -= 1;
        }
        
        // Проверяем клавиши движения вправо
        if (this.isKeyPressed('ArrowRight') || this.isKeyPressed('d') || this.isKeyPressed('D')) {
            direction += 1;
        }
        
        return direction;
    }

    // Проверка нажатия клавиши прыжка
    isJumpPressed() {
        return this.isKeyPressed(' ') || 
               this.isKeyPressed('w') || 
               this.isKeyPressed('W') || 
               this.isKeyPressed('ArrowUp');
    }

    // Метод для сброса состояния всех клавиш (вызывать при рестарте)
    reset() {
        // Сбрасываем все клавиши в false
        for (let key in this.keys) {
            this.keys[key] = false;
        }
    }

    // Метод для очистки всех обработчиков событий (опционально)
    cleanup() {
        if (this.keyDownHandler && this.keyUpHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
            document.removeEventListener('keyup', this.keyUpHandler);
        }
        this.isInitialized = false;
    }
}