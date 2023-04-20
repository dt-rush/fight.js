function setContentHeight() {
  const contentElement = document.getElementById('content');
  contentElement.style.height = window.innerHeight + 'px';
  window.scrollTo(0, 0);
}

window.addEventListener('resize', setContentHeight);
window.addEventListener('orientationchange', setContentHeight);
setContentHeight();
