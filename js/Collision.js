class Collision {
    static checkRectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    static resolvePlayerPlatformCollision(player, platform) {
        // Check if player is above platform and moving downward
        if (player.velocityY > 0 && 
            player.y + player.height <= platform.y + player.velocityY &&
            player.y + player.height >= platform.y &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.isJumping = false;
            return 'top';
        }

        // Check if player hits platform from below
        if (player.velocityY < 0 &&
            player.y >= platform.y + platform.height + player.velocityY &&
            player.y <= platform.y + platform.height &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width) {
            
            player.y = platform.y + platform.height;
            player.velocityY = 0;
            return 'bottom';
        }

        // Check side collisions
        if (player.velocityX !== 0) {
            // Left side collision
            if (player.velocityX > 0 &&
                player.x + player.width <= platform.x + player.velocityX &&
                player.x + player.width >= platform.x &&
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height) {
                
                player.x = platform.x - player.width;
                return 'left';
            }

            // Right side collision
            if (player.velocityX < 0 &&
                player.x >= platform.x + platform.width + player.velocityX &&
                player.x <= platform.x + platform.width &&
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height) {
                
                player.x = platform.x + platform.width;
                return 'right';
            }
        }

        return null;
    }

    static checkCoinCollection(player, coin) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const coinCenterX = coin.x + coin.size / 2;
        const coinCenterY = coin.y + coin.size / 2;

        const distance = Math.sqrt(
            Math.pow(playerCenterX - coinCenterX, 2) + 
            Math.pow(playerCenterY - coinCenterY, 2)
        );

        return distance < (player.width / 2 + coin.size / 2);
    }
}