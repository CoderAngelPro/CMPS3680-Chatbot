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

async function typeText(element, text, delay = 50) {
  for (const char of text) {
    element.textContent += char;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById("Modal");
  const profile = document.getElementById("profile");
  const promptInput = document.getElementById('prompt-text');
  const form        = document.getElementById('prompt');
  const svgEL       = document.getElementById('bubble-content');
  const title       = document.getElementById('title');
  const helperTxt   = document.getElementById('prompt-helper');
  const content = document.getElementById('Modal-content');

  profile.addEventListener("click", () => {
    modal.style.display =
      modal.style.display === 'block' ? 'none' : 'block';
  });

  document.addEventListener('click', e => {
    if (!content.contains(e.target) && !profile.contains(e.target)) {
      modal.style.display = 'none';
    }
  });


  
  typeText(title,  "Hello, I'm FredBot.");
  setTimeout(() => typeText(helperTxt, "How can I help?"), 2000);

  const token = localStorage.token;                      
  const authH = token ? { Authorization:`Bearer ${token}` } : {};


  if (token) {
    document.getElementById('loginmsg').style.display = 'none';
    document.getElementById('loginimg').style.height = '0px';
    document.getElementById('loginBtn').style.display = 'none';
    fetch('/history', { headers: authH })
      .then(r => r.ok ? r.json() : [])
      .then(history => history.forEach(m => {
        addHistoryCard(m.prompt, m.reply);
      }))
      .catch(console.error);
  }
  if (!token) {
    document.getElementById('clearBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('Modal').style.top = '-100px';
  }


  async function handleSubmit (e) {
    e.preventDefault();
    chatBubble.style.visibility = 'visible';

    const prompt = promptInput.value.trim();
    promptInput.value = '';
    if (!prompt) { 
      svgEL.textContent = 'Please enter a prompt.'; 
      return; 
    }

    svgEL.textContent = 'Thinking…';

    try {
      const res = await fetch(`/generate?prompt=${encodeURIComponent(prompt)}`,
        { headers: authH }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Rate limit reached');
      }

      const { text: reply } = await res.json();
      svgEL.textContent = reply 
      addHistoryCard(prompt, reply);
    } catch (err) {
      svgEL.textContent = err.message;
      console.error('API Error:', err);
    }
  }

  form.addEventListener('submit', handleSubmit);
  promptInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      title.style.visibility = 'hidden';
      form.requestSubmit();
    }
  });
});

document.getElementById('sidebar-button').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
  
});

document.getElementById('close').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
});

/*document.getElementById('emote').addEventListener('click', () => {
    targetTranslateX = targetTranslateX === 0 ? -20 : 0;
    bloomGlow.style.transform = `translate(-50%, -50%) translateX(${targetTranslateX}vw)`;
}); */

// Daniel Add FredBot Emotes ASAP ^^^^


function addHistoryCard (prompt, reply) {
  const sidebar = document.getElementById('sidebar-container');
  if (!sidebar) 
  return;
  const card = document.createElement('div');
  card.className = 'history-card';
  card.innerHTML = `<strong>${prompt}</strong><br><span>${reply}</span>`;
  sidebar.prepend(card);
}

document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('token');
    location.reload();
  };

document.getElementById('clearBtn').onclick = async () => {
  if (!confirm('Erase your entire chat history?')) return;
  const token = localStorage.token;
  if (!token) return;                  

  const res = await fetch('/history', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.ok) {
    document.getElementById('sidebar-container').textContent = '';
    location.reload();
  } else {
    alert('Failed to clear history');
  }
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
          .catch(console.error);
};