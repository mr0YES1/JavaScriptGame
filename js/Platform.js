class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'normal', 'moving', 'bouncy'
        this.color = this.getColorByType();
        this.originalX = x;
        this.movingDirection = 1;
        this.movingSpeed = 1;
    }

    getColorByType() {
        switch (this.type) {
            case 'moving':
                return '#8B4513'; // Brown
            case 'bouncy':
                return '#FFD700'; // Gold
            default:
                return '#228B22'; // Forest Green
        }
    }

    update() {
        if (this.type === 'moving') {
            this.x += this.movingSpeed * this.movingDirection;
            
            // Reverse direction at boundaries
            if (this.x <= 50 || this.x + this.width >= 750) {
                this.movingDirection *= -1;
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add some details to platforms
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        if (this.type === 'bouncy') {
            // Draw spring pattern
            ctx.fillStyle = '#FFF';
            for (let i = 0; i < this.width; i += 15) {
                ctx.fillRect(this.x + i, this.y + 5, 8, 3);
            }
        }
    }
}