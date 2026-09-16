function initFloatingHearts(containerId) {
  const container = document.getElementById(containerId || 'heartsBg');
  if (!container) return;
  const symbols = ['♥', '❤', '💕'];
  setInterval(() => {
    const heart = document.createElement('span');
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.fontSize = (0.8 + Math.random() * 1.4) + 'rem';
    heart.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    const duration = 8 + Math.random() * 8;
    heart.style.animationDuration = duration + 's';
    container.appendChild(heart);
    setTimeout(() => heart.remove(), duration * 1000);
  }, 900);
}

document.addEventListener('DOMContentLoaded', () => initFloatingHearts());
