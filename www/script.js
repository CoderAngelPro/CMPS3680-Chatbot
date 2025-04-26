const cube = document.getElementById("cube");
const bloomGlow = document.getElementById("bloom-glow");
const chatBubble = document.getElementById("chat-bubble");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;
let targetTranslateX = 0;
let currentTranslateX = 0;


document.addEventListener("mousemove", (e) => {
  const viewportOffset = currentTranslateX / 100
    const x = (e.clientX / window.innerWidth - (0.5 + viewportOffset));
    const y = (e.clientY / window.innerHeight - 0.5);
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.1;
    
    targetX = y * -180;
    targetY = x * 180;
});

function animate() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.1;
    const idleWiggleZ = Math.sin(Date.now() * 0.002) * 5;
    const idleWiggleX = Math.sin(Date.now() * 0.002) * 0.5;
    const idleWiggleY = Math.sin(Date.now() * 0.002) * 1;

    
    cube.style.transform = `
        translate3d(calc(-50% + ${currentTranslateX}vw), -50%, 0)
        rotateX(${currentX - idleWiggleX}deg)
        rotateY(${currentY + idleWiggleY}deg)
        rotateZ(${idleWiggleZ}deg)
    `;

    bloomGlow.style.transform = `translate3d(calc(-50% + ${currentTranslateX}vw), -50%, 0)`;

    const cubeRect = cube.getBoundingClientRect();
    
    const xOffset = 75;
    const yOffset = -150;

    chatBubble.style.transform = `translate(-50%, -50%)`;

    chatBubble.style.left = `${cubeRect.right + xOffset}px`;
    chatBubble.style.top = `${cubeRect.top + yOffset}px`;

    glitchEffect();
    requestAnimationFrame(animate);
}


const img = document.querySelector(".face.front img");
let glitchTimer = 0;
let glitchDuration = 0;

function glitchEffect() {
    if (glitchTimer <= 0) {
        if (Math.random() < 0.02) { 
            glitchTimer = Math.floor(Math.random() * 10) + 5; 
            glitchDuration = glitchTimer;
        } else {
            img.style.transform = "translate(0, 0)";
            img.style.filter = "blur(0px)";
            return;
        }
    }

    const shakeX = (Math.random() - 0.5) * 4;
    const shakeY = (Math.random() - 0.5) * 4;
    const blur = Math.random() < 0.5 ? "1px" : "0.5px";

    img.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
    img.style.filter = `blur(${blur})`;

    glitchTimer--;
}

animate();

document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('prompt');
  const submitButton = document.getElementById('submit');
  const svgEL = document.getElementById('bubble-content');

  const handleSubmit = async () => {
      chatBubble.style.visibility = 'visible';

      const prompt = promptInput.value;
      promptInput.value = '';

      if (!prompt) {
          svgEL.textContent = 'Please enter a prompt.';
          return;
      }

      svgEL.textContent = 'Thinking...';
      
      try {
          const response = await fetch(`/generate?prompt=${encodeURIComponent(prompt)}`);
          
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Request failed');
          }

          const data = await response.json();
          const outputText = data.text?.message?.content?.[0]?.text;
          svgEL.textContent = outputText || "Sorry, I couldn't generate a response.";

      } catch (error) {
          svgEL.textContent = error.message;
          console.error('API Error:', error);
      }
  };


  submitButton.addEventListener('click', handleSubmit);
  promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
          promptInput.value = '';
      }
  });
});

document.getElementById('sidebar-button').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
});

document.getElementById('move-button').addEventListener('click', () => {
    targetTranslateX = targetTranslateX === 0 ? -20 : 0;
    bloomGlow.style.transform = `translate(-50%, -50%) translateX(${targetTranslateX}vw)`;
});