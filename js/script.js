const track = document.querySelector(".carousel-track");
const images = document.querySelectorAll(".carousel-track img");

const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

let index = 0;

function updateCarousel() {
  const width = images[0].clientWidth;
  track.style.transform = `translateX(-${index * width}px)`;
}

nextBtn.addEventListener("click", () => {
  if (index < images.length - 1) {
    index++;
  } else {
    index = 0;
  }
  updateCarousel();
});

prevBtn.addEventListener("click", () => {
  if (index > 0) {
    index--;
  } else {
    index = images.length - 1;
  }
  updateCarousel();
});

window.addEventListener("resize", updateCarousel);