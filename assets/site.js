// RMD site behaviour — no dependencies
(function () {
  var header = document.querySelector('header.site');
  var menu = document.querySelector('.menu-btn');
  if (menu) menu.addEventListener('click', function () {
    var open = header.classList.toggle('open');
    menu.setAttribute('aria-expanded', open);
  });

  // product gallery
  var main = document.querySelector('.gallery .main img');
  document.querySelectorAll('.thumbs button').forEach(function (b) {
    b.addEventListener('click', function () {
      main.src = b.dataset.src;
      main.alt = b.querySelector('img').alt;
      document.querySelectorAll('.thumbs button').forEach(function (x) { x.setAttribute('aria-current', x === b); });
    });
  });

  // skin finder
  var finder = document.querySelector('[data-finder]');
  if (finder) {
    var data = JSON.parse(document.getElementById('finder-data').textContent);
    var out = finder.querySelector('.routine');
    var note = finder.querySelector('.finder-note');
    var chips = finder.querySelectorAll('.chip');
    function show(key) {
      var r = data[key];
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.key === key); });
      out.innerHTML = r.steps.map(function (s) {
        return '<a class="step" href="' + s.href + '"><img src="' + s.img + '" alt="" loading="lazy" width="76" height="76">' +
          '<div><small>' + s.when + '</small><b>' + s.name + '</b><span>' + s.why + '</span></div></a>';
      }).join('');
      note.textContent = r.note;
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { show(c.dataset.key); }); });
    show(chips[0].dataset.key);
  }

  // sticky buy bar appears once the main buy button scrolls away
  var sticky = document.querySelector('.sticky-buy');
  var anchor = document.querySelector('.pdp-ctas');
  if (sticky && anchor && 'IntersectionObserver' in window) {
    document.body.classList.add('has-sticky');
    new IntersectionObserver(function (e) {
      sticky.classList.toggle('show', !e[0].isIntersecting && e[0].boundingClientRect.top < 0);
    }).observe(anchor);
  }

  // gentle reveal
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();

// full ingredient list: tap an ingredient, read what it does
(function () {
  var wrap = document.querySelector('.inci-chips');
  var note = document.querySelector('.inci-note');
  if (!wrap || !note) return;
  wrap.addEventListener('click', function (e) {
    var b = e.target.closest('.chip-ing');
    if (!b) return;
    var open = b.getAttribute('aria-pressed') === 'true';
    wrap.querySelectorAll('.chip-ing').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
    if (open) {
      note.innerHTML = '<span class="hint">' + note.dataset.empty + ' 👆</span>';
      return;
    }
    b.setAttribute('aria-pressed', 'true');
    note.innerHTML = '<span class="tag">' + b.dataset.role + '</span><b>' + b.dataset.name + '</b><p>' + b.dataset.note + '</p>';
  });
})();
