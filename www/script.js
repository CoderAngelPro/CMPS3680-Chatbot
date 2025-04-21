const cube = document.getElementById("cube");
const bloomGlow = document.getElementById("bloom-glow");

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
    
    targetX = y * -180;
    targetY = x * 180;
});

function animate() {
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    currentTranslateX += (targetTranslateX - currentTranslateX) * 0.1;

    const idleWiggleZ = Math.sin(Date.now() * 0.002) * 5;
    const idleWiggleX = Math.sin(Date.now() * 0.002) * .5;
    const idleWiggleY = Math.sin(Date.now() * 0.002) * 1;
    
    cube.style.transform = `
        translate(-50%, -50%) /* Center the cube */
        translateX(${currentTranslateX}vw) /* Our new translation */
        rotateX(${currentX - idleWiggleX}deg) 
        rotateY(${currentY + idleWiggleY}deg) 
        rotateZ(${idleWiggleZ}deg) /* Z-rotation for subtle wobble */
    `;

    bloomGlow.style.transform = `translate(-50%, -50%) translateX(${currentTranslateX}vw)`;

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
    const output = document.getElementById('output');
  
    submitButton.addEventListener('click', async () => {
      const prompt = promptInput.value;

      if (!prompt) {
        output.textContent = 'Please enter a prompt.';
        return;
      }
      
      try {
        const response = await fetch(`/generate?prompt=${encodeURIComponent(prompt)}`);
        if (!response.ok){
          throw new Error('You have been rate limited. Please try again later.');
        }
        
        const data = await response.json();

        const outputText = data.text?.message?.content?.[0]?.text;

        output.textContent = outputText;
        
      } catch (error) {
        console.error('Error fetching generate data:', error);
      }
    });
  });


  document.getElementById('submit').addEventListener('click', () => {
    document.getElementById('greeting').style.transform = 'translateX(-20vw';
    targetTranslateX = targetTranslateX === 0 ? -20 : 0;
});

document.getElementById('sidebar-button').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
});


