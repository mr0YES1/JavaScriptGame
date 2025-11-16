class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpForce = -15;
        this.gravity = 0.8;
        this.isJumping = false;
        this.facing = 'right'; // 'left' or 'right'
        this.color = '#FF6B6B';
        this.lives = 3;
        this.score = 0;
        this.invulnerable = false;
        this.invulnerableTimer = 0;
    }

    update(input, platforms, gameWidth, gameHeight) {
        // Horizontal movement
        const direction = input.getHorizontalMovement();
        this.velocityX = direction * this.speed;
        
        // Update facing direction
        if (direction > 0) this.facing = 'right';
        if (direction < 0) this.facing = 'left';

        // Apply gravity
        this.velocityY += this.gravity;

        // Jumping
        if (input.isJumpPressed() && !this.isJumping) {
            this.velocityY = this.jumpForce;
            this.isJumping = true;
        }

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Boundary checking
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > gameWidth) this.x = gameWidth - this.width;

        // Check if player fell off the screen
        if (this.y > gameHeight) {
            this.takeDamage();
            this.respawn(gameWidth, gameHeight);
        }

        // Handle collisions with platforms
        this.handlePlatformCollisions(platforms);

        // Update invulnerability timer
        if (this.invulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.invulnerable = false;
            }
        }
    }

    handlePlatformCollisions(platforms) {
        for (const platform of platforms) {
            const collision = Collision.resolvePlayerPlatformCollision(this, platform);
            
            if (collision === 'top' && platform.type === 'bouncy') {
                // Extra bounce from bouncy platforms
                this.velocityY = this.jumpForce * 1.5;
                this.isJumping = true;
            }
        }
    }

    takeDamage() {
        if (!this.invulnerable) {
            this.lives--;
            this.invulnerable = true;
            this.invulnerableTimer = 60; // 1 second at 60fps
        }
    }

    respawn(gameWidth, gameHeight) {
        this.x = gameWidth / 2 - this.width / 2;
        this.y = gameHeight / 2;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
    }

    addScore(points) {
        this.score += points;
    }

    draw(ctx) {
        // Draw player with invulnerability flashing effect
        if (this.invulnerable && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw eyes
        ctx.fillStyle = '#FFF';
        const eyeOffset = this.facing === 'right' ? 10 : 5;
        ctx.fillRect(this.x + eyeOffset, this.y + 8, 6, 6);

        // Draw mouth
        ctx.fillRect(this.x + 8, this.y + 20, 12, 3);

        ctx.globalAlpha = 1.0;
    }
}