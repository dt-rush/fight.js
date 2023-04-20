function setContentHeight() {
  const contentElement = document.getElementById('content');
  contentElement.style.height = window.innerHeight + 'px';
}

window.addEventListener('resize', setContentHeight);
window.addEventListener('orientationchange', setContentHeight);
setContentHeight();
