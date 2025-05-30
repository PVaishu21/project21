document.addEventListener('DOMContentLoaded', function() {
    // Clock elements
    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');
    const digitalTimeDisplay = document.querySelector('.digital-time');

    // Canvas elements for sparkles
    const canvas = document.getElementById('sparkle-canvas');
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    const particles = [];
    const numParticles = 200; // Increased number of sparkles
    const colors = ['#FFFF00', '#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00FFFF', '#00FF7F', '#8A2BE2']; // Brighter, more vibrant color palette for sparkles

    // Set initial canvas size
    canvas.width = width;
    canvas.height = height;

    // Particle class for creating and animating sparkles
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 3 + 1; // Slightly larger sparkles
            this.speedX = (Math.random() - 0.5) * 0.7; // Faster horizontal movement
            this.speedY = (Math.random() - 0.5) * 0.7; // Faster vertical movement
            this.color = colors[Math.floor(Math.random() * colors.length)]; // Random color from palette
            this.alpha = Math.random() * 0.9 + 0.1; // Random transparency, generally brighter
            this.life = 0; // Particle life counter
            this.maxLife = Math.random() * 100 + 50; // Random max life
        }

        // Update particle position
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life++;

            // Fade out as it ages
            this.alpha = 1 - (this.life / this.maxLife);

            // Recycle particle if it goes off-screen or dies
            if (this.x < 0 || this.x > width || this.y < 0 || this.y > height || this.life >= this.maxLife) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.7;
                this.speedY = (Math.random() - 0.5) * 0.7;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.9 + 0.1;
                this.life = 0;
                this.maxLife = Math.random() * 100 + 50;
            }
        }

        // Draw particle on canvas
        draw() {
            ctx.save(); // Save current context state
            ctx.globalAlpha = this.alpha; // Apply transparency
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore(); // Restore context state
        }
    }

    // Initialize particles
    function initParticles() {
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    // Animate sparkles
    function animateSparkles() {
        ctx.clearRect(0, 0, width, height); // Clear canvas
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animateSparkles); // Loop animation
    }

    // Function to set clock hand positions AND update digital time
    // Function to set clock hand positions AND update digital time
// Function to set clock hand positions AND update digital time
function setClock() {
    const now = new Date(); // Get current time

    const milliseconds = now.getMilliseconds();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
    const dayOfMonth = now.getDate();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();

    // Calculate degrees for each hand
    // No +90 offset needed if the hands' default (0deg) orientation is upwards (12 o'clock)
    const secondsDegrees = ((seconds + milliseconds / 1000) / 60) * 360;
    const minutesDegrees = ((minutes + seconds / 60) / 60) * 360;
    // The hour hand calculation for analog clocks is usually:
    // (hours % 12) * 30 degrees (for whole hours)
    // + (minutes / 60) * 30 degrees (for minutes' effect on hour hand)
    const hoursDegrees = ((hours % 12 + minutes / 60) / 12) * 360;

    // Apply rotations to hands
    // Note: The rotation needs to be from 0 (top) clockwise.
    // If 0deg is pointing up, then for 4:13 PM:
    // Hour: should be past 4. (4/12)*360 = 120 deg. (13/60)*30 = 6.5 deg. Total 126.5 deg.
    // Minute: 13 mins is (13/60)*360 = 78 deg.
    // Second: 42 seconds is (42/60)*360 = 252 deg.

    // Let's re-verify the base rotation for CSS 'rotate'.
    // If 0deg in CSS is 'right', and the hands are pointing up, then you need to rotate them 'back' 90 degrees conceptually,
    // so that the 12 o'clock position in the clock matches the 0-degree angle for your calculations.
    // Or, more simply, if 0deg on the clock is at the top (12), and you want to rotate it clockwise:
    // Clock 12 (top) = 0deg, 3 = 90deg, 6 = 180deg, 9 = 270deg (or -90deg)
    // If your hands are already pointing 'up' at 0 CSS degrees, then the calculations are fine as (value/max) * 360.
    // The previous +90 was likely added because the developer assumed CSS 0deg is 'right' and wanted to shift it to 'up'.
    // BUT the CSS `transform-origin: bottom` and `height` making the hand grow upwards means 0deg already IS 'up'.

    // So the correction is to **remove the +90 degree offset** from all calculations.

    secondHand.style.transform = `translateX(-50%) rotate(${secondsDegrees}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minutesDegrees}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hoursDegrees}deg)`;

    // --- Update digital time display ---
    const formatUnit = (unit) => unit < 10 ? '0' + unit : unit; // Helper to add leading zero
    const formatMilliseconds = (ms) => {
        if (ms < 10) return '00' + ms;
        if (ms < 100) return '0' + ms;
        return ms;
    };

    const currentHours12 = hours % 12 || 12; // Convert 24-hour to 12-hour format, handle 0 as 12
    const ampm = hours >= 12 ? 'PM' : 'AM';

    const currentTimeString = `
        ${formatUnit(currentHours12)}:${formatUnit(minutes)}:${formatUnit(seconds)}.${formatMilliseconds(milliseconds)} ${ampm}<br>
        ${dayOfWeek}, ${dayOfMonth} ${month} ${year}
    `;
    digitalTimeDisplay.innerHTML = currentTimeString;
}
    // Adjust canvas size on window resize
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // Re-initialize particles to spread them correctly across new canvas size
        particles.length = 0; // Clear existing particles
        initParticles();
    }

    // Event listeners and initial calls
    window.addEventListener('resize', resizeCanvas); // Listen for window resize
    initParticles(); // Create initial sparkles
    animateSparkles(); // Start sparkle animation
    setInterval(setClock, 10); // Update clock every 10 milliseconds for smooth second hand and digital milliseconds
    setClock(); // Set clock immediately on load
});