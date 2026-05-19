const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

// Ensure canvas matches screen dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const frameCount = 226;
// Format is ezgif-frame-001.jpg
const currentFrame = index => (
  `ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
);

const images = [];
const amulSequence = {
  frame: 0
};

let loadedImages = 0;

// Preload images
for (let i = 1; i <= frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
  
  img.onload = () => {
    loadedImages++;
    if (loadedImages === frameCount) {
        init();
    }
  };
}

function init() {
    // Hide loader
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);

    canvas.classList.add('loaded');
    
    // Draw first frame
    renderImage(images[0]);
}

// Draw image centered and contained in the canvas to preserve quality
function renderImage(img) {
    if (!img) return;
    
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;

    // Use "cover" logic to fill the screen
    if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    }

    // Prevent subpixel rendering tearing
    drawWidth = Math.floor(drawWidth);
    drawHeight = Math.floor(drawHeight);
    offsetX = Math.floor(offsetX);
    offsetY = Math.floor(offsetY);

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Enable high quality smoothing
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

let animationCompleted = false;

// Scroll animation calculation
window.addEventListener('scroll', () => {  
  if (animationCompleted) return;

  const wrapper = document.querySelector('.animation-wrapper');
  const scrollTop = document.documentElement.scrollTop;
  const maxScrollTop = wrapper.offsetHeight - window.innerHeight;
  let scrollFraction = maxScrollTop === 0 ? 0 : scrollTop / maxScrollTop;
  scrollFraction = Math.max(0, Math.min(1, scrollFraction));
  
  const frameIndex = Math.min(
    frameCount - 1,
    Math.ceil(scrollFraction * frameCount)
  );
  
  requestAnimationFrame(() => renderImage(images[frameIndex]));

  // Fade out text as scroll starts
  const overlay = document.querySelector('.overlay-content');
  if(overlay) {
    overlay.style.opacity = Math.max(0, 1 - (scrollFraction * 4));
    overlay.style.transform = `translate(-50%, calc(-50% - ${scrollFraction * 100}px))`;
  }

  if (scrollFraction >= 1) {
      animationCompleted = true;
      const heightToRemove = wrapper.offsetHeight - window.innerHeight;
      wrapper.style.height = '100vh';
      window.scrollBy(0, -heightToRemove);
  }
});

// Resize canvas and re-render frame when window resizes
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if (animationCompleted) {
        renderImage(images[frameCount - 1]);
        return;
    }

    const wrapper = document.querySelector('.animation-wrapper');
    const scrollTop = document.documentElement.scrollTop;
    const maxScrollTop = wrapper.offsetHeight - window.innerHeight;
    let scrollFraction = maxScrollTop === 0 ? 0 : scrollTop / maxScrollTop;
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
    
    const frameIndex = Math.min(
        frameCount - 1,
        Math.ceil(scrollFraction * frameCount)
    );
    if(images[frameIndex]) {
      renderImage(images[frameIndex]);
    }
});
