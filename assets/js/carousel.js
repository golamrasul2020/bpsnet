/* Hero Carousel — Ken Burns effect + accessibility helpers */
document.addEventListener('DOMContentLoaded', function () {
  const hero = document.getElementById('heroCarousel');
  if (!hero) return;

  const activateZoom = (item) => {
    hero.querySelectorAll('.hero-slide img').forEach((img) => img.classList.remove('kb-zoom'));
    const img = item.querySelector('.hero-slide img');
    if (img) requestAnimationFrame(() => img.classList.add('kb-zoom'));
  };

  activateZoom(hero.querySelector('.carousel-item.active'));

  hero.addEventListener('slide.bs.carousel', (e) => activateZoom(e.relatedTarget));

  // Pause carousel on hover (extra safety besides data-bs-pause)
  const bsCarousel = bootstrap.Carousel.getOrCreateInstance(hero, { interval: 6000, ride: 'carousel' });
  hero.addEventListener('mouseenter', () => bsCarousel.pause());
  hero.addEventListener('mouseleave', () => bsCarousel.cycle());
});