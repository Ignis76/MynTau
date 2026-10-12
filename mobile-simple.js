(() => {
  const mobile = matchMedia('(max-width: 800px)');
  const extras = document.querySelector('.mobile-extras');
  const syncLayout = () => { extras.open = !mobile.matches; };
  syncLayout();
  mobile.addEventListener('change', syncLayout);
})();
