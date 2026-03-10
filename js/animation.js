/**
 * PHERA Logo Animation Canvas Player
 * Plays 202 sequential image frames for 5 seconds matching the truck loading animation.
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Animation configuration
    const totalFrames = 202;
    const duration = 5000; // 5 seconds
    const fps = totalFrames / (duration / 1000);
    const frameInterval = 1000 / fps;
    const images = [];

    let framesLoaded = 0;
    let currentFrame = 0;
    let playing = false;
    let lastTime = 0;

    // Responsive Canvas
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Redraw current frame if available
        if (images[currentFrame] && framesLoaded === totalFrames) {
            drawFrame(currentFrame);
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Preload images
    const baseDir = 'assets/animation/';
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        const frameIdx = i.toString().padStart(3, '0');
        img.src = `${baseDir}ezgif-frame-${frameIdx}.jpg`;

        img.onload = () => {
            framesLoaded++;
            if (framesLoaded === totalFrames) {
                // All images loaded, wait a split second to let page finish rendering, then start
                setTimeout(() => {
                    requestAnimationFrame(animationLoop);
                }, 500);
            }
        };
        img.onerror = () => {
            console.error(`Failed to load frame ${frameIdx}`);
            framesLoaded++; // increment anyway to not block
        };

        images.push(img);
    }

    function drawFrame(idx) {
        if (!images[idx] || !images[idx].complete) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate dimensions to maintain aspect ratio (Object-fit: contain simulation)
        const imgRatio = images[idx].width / images[idx].height;
        const canvasRatio = canvas.width / canvas.height;

        let drawWidth, drawHeight, x, y;

        if (canvasRatio > imgRatio) {
            drawHeight = canvas.height;
            drawWidth = images[idx].width * (canvas.height / images[idx].height);
            x = (canvas.width - drawWidth) / 2;
            y = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = images[idx].height * (canvas.width / images[idx].width);
            x = 0;
            y = (canvas.height - drawHeight) / 2;
        }

        ctx.drawImage(images[idx], x, y, drawWidth, drawHeight);
    }

    function animationLoop(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;

        if (delta > frameInterval) {
            drawFrame(currentFrame);
            currentFrame++;
            lastTime = timestamp;
        }

        // Stop logic
        if (currentFrame < totalFrames) {
            requestAnimationFrame(animationLoop);
        } else {
            // Draw last frame guaranteed
            drawFrame(totalFrames - 1);
        }
    }
});
