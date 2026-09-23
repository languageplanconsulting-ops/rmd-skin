// RMD site behaviour — no dependencies
// restart the fade whenever a panel's content is replaced
function softIn(el) {
  el.classList.remove('soft-in');
  void el.offsetWidth;
  el.classList.add('soft-in');
}

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

  // skin quiz: a few questions, then a routine you can order
  var quiz = document.querySelector('[data-quiz]');
  if (quiz) {
    var D = JSON.parse(document.getElementById('quiz-data').textContent);
    var body = quiz.querySelector('.q-body');
    var bar = quiz.querySelector('.q-bar span');
    var stack = [], state = {}, first = 'who';

    function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    function progress(done, total) { bar.style.width = Math.round(done / total * 100) + '%'; }

    function ask(id) {
      var s = D.steps[id];
      if (!s) return;
      progress(stack.length, stack.length + 2);
      var opts = s.opts.map(function (o, i) {
        return '<button class="q-opt" data-i="' + i + '"><i aria-hidden="true">' + o.emoji + '</i><span>' + esc(o.label) + '</span></button>';
      }).join('');
      body.innerHTML = '<div class="q-head"><small>ข้อ ' + (stack.length + 1) + '</small><h3>' + esc(s.q) + '</h3>' +
        '<p class="muted">' + esc(s.help) + '</p></div><div class="q-opts">' + opts + '</div>' +
        (stack.length ? '<button class="q-back">← ย้อนกลับ</button>' : '');
      softIn(body);
      body.querySelectorAll('.q-opt').forEach(function (b) {
        b.addEventListener('click', function () {
          var o = s.opts[+b.dataset.i];
          stack.push({ id: id, state: JSON.parse(JSON.stringify(state)) });
          Object.keys(o.set || {}).forEach(function (k) { state[k] = o.set[k]; });
          var next = o.next.replace(/\{(\w+)\}/g, function (_, k) { return state[k]; });
          if (next.indexOf('r:') === 0) show(next.slice(2)); else ask(next);
        });
      });
      var back = body.querySelector('.q-back');
      if (back) back.addEventListener('click', function () {
        var prev = stack.pop();
        state = prev.state;
        ask(prev.id);
      });
    }

    function show(key) {
      var r = D.results[key];
      if (!r) return ask(first);
      progress(1, 1);
      var steps = r.steps.map(function (s, i) {
        return '<div class="q-step"><img src="' + s.img + '" alt="" loading="lazy" width="76" height="76">' +
          '<div><small>' + esc(s.when) + '</small><b>' + esc(s.name) + '</b><span>' + esc(s.why) + '</span>' +
          '<a class="q-link" href="' + s.href + '">ดูรายละเอียด · ' + esc(s.price) + ' →</a></div></div>';
      }).join('');
      var phase = state.phase && D.phase[state.phase] ? '<p class="q-phase">⏱️ ' + esc(D.phase[state.phase]) + '</p>' : '';
      body.innerHTML =
        '<div class="q-result"><span class="eyebrow">✅ ผลลัพธ์ของคุณ</span>' +
        '<h3>' + esc(r.name) + '</h3><p class="q-say">' + esc(r.say) + '</p>' +
        '<a class="q-read" href="' + r.cond + '">📖 อ่านเรื่อง' + esc(r.condName) + 'แบบละเอียด →</a>' +
        '<h4>รูทีนที่เราแนะนำ</h4><div class="q-steps">' + steps + '</div>' + phase +
        '<p class="q-tip">💡 ' + esc(r.tip) + '</p>' +
        '<p class="q-see"><b>ควรพบแพทย์ถ้า</b> ' + esc(r.see) + '</p>' +
        (r.total ? '<p class="q-total">รวมทั้งรูทีน <b>' + esc(r.total) + '</b> <small>ทักไลน์สั่งได้ เก็บเงินปลายทาง ส่งฟรีเมื่อครบเซ็ต</small></p>' : '') +
        '<div class="q-ctas"><a class="btn btn-line" href="' + D.line + '" target="_blank" rel="noopener">ส่งรูทีนนี้ให้เราทางไลน์ ' + D.lineId + '</a>' +
        '<a class="btn btn-shopee" href="' + D.shop + '" target="_blank" rel="noopener">สั่งที่ Shopee</a></div>' +
        '<button class="q-restart">↺ เริ่มใหม่</button></div>';
      softIn(body);
      body.querySelector('.q-restart').addEventListener('click', function () {
        stack = []; state = {}; history.replaceState(null, '', location.pathname); ask(first);
      });
      history.replaceState(null, '', '#r=' + key);
    }

    var hash = (location.hash.match(/^#r=(\w+)$/) || [])[1];
    if (hash && D.results[hash]) show(hash); else ask(first);
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
      softIn(note);
      note.innerHTML = '<span class="hint">' + note.dataset.empty + ' 👆</span>';
      return;
    }
    b.setAttribute('aria-pressed', 'true');
    softIn(note);
    note.innerHTML = '<span class="tag">' + b.dataset.role + '</span><b>' + b.dataset.name + '</b><p>' + b.dataset.note + '</p>';
  });
})();
