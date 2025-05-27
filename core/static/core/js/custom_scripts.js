// Toast notifications
document.addEventListener('DOMContentLoaded', function () {
  const toasts = document.querySelectorAll('.toast');
  toasts.forEach(function (toastEl) {
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
  });
});

// Swiper instance
const swiper = new Swiper('.swiper', {
  slidesPerView: 'auto',
  spaceBetween: 30,
  centeredSlides: true,
  loop: true,
  autoplay: {
    delay: 2000,
    disableOnInteraction: false,
  },
});

// Chatbot toggle
const toggleBtn = document.getElementById('chatbotToggle');
const chatbotBox = document.getElementById('chatbotBox');

if (toggleBtn && chatbotBox) { // Add a check to ensure elements exist
  toggleBtn.addEventListener('click', () => {
    chatbotBox.style.display = chatbotBox.style.display === 'none' ? 'block' : 'none';
  });
}
