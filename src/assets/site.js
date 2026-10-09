/* R&R Grandeur Properties — page behaviour.
   Carried over from the v5 design: nav highlight, approach timeline, GSAP
   reveals, and the two forms. Endpoints come from the CMS (Site settings →
   Forms) via data attributes, so nothing here needs editing. */
(() => {
  'use strict';

  const GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
  const ST = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const loadScript = (src) => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => res();
    s.onerror = rej;
    document.head.appendChild(s);
  });

  /* Posts a form to a Formspree-compatible endpoint and expects a 2xx JSON
     reply. Until an endpoint is set the form says so rather than pretending
     to send: silently dropping a seller's deal is the one unacceptable outcome. */
  const send = (endpoint, data) => fetch(endpoint, {
    method: 'POST', body: data, headers: { Accept: 'application/json' },
  }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });

  function notifyForm() {
    const form = document.querySelector('[data-notify-form]');
    if (!form) return;
    const st = form.querySelector('[data-notify-status]');
    const say = (msg, ok) => {
      st.textContent = msg;
      st.classList.add('is-shown');
      st.classList.toggle('is-ok', ok);
      st.classList.toggle('is-bad', !ok);
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const endpoint = form.dataset.endpoint;
      const fallback = form.dataset.fallback;
      if (!endpoint) {
        say('The list is not connected yet, so nothing was saved.' + (fallback ? ' Please email ' + fallback + ' to be added.' : ''), false);
        return;
      }
      const data = new FormData(form);
      data.set('_subject', 'Marketplace waitlist');
      data.set('form', 'Marketplace waitlist');
      send(endpoint, data)
        .then(() => { say('Thank you — we will email you when the marketplace opens.', true); form.reset(); })
        .catch(() => say('That did not send — please try again.', false));
    });
  }

  function dealForm() {
    const form = document.querySelector('[data-deal-form]');
    if (!form) return;
    const status = form.querySelector('[data-status]');
    const button = form.querySelector('[data-submit]');
    const label = button ? button.innerHTML : '';
    const fallback = form.dataset.fallback;
    const say = (msg, ok) => {
      status.textContent = msg;
      status.classList.add('is-shown');
      status.classList.toggle('is-ok', ok);
      status.classList.toggle('is-bad', !ok);
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      const g = (k) => (data.get(k) || '').toString().trim();
      const name = [g('first'), g('last')].filter(Boolean).join(' ');
      data.set('_subject', 'Opportunity submission — ' + (name || 'R&R Grandeur'));
      data.set('_replyto', g('email'));
      data.set('form', 'Opportunity submission');

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        say('This form is not connected to a mail service yet, so nothing was sent.'
          + (fallback ? ' Please email ' + fallback + ' directly.' : ''), false);
        return;
      }

      if (button) { button.disabled = true; button.textContent = 'Sending…'; }
      say('Sending…', true);

      try {
        await send(endpoint, data);
        form.classList.add('is-sent');
        say(form.dataset.success || 'Thank you — your submission has reached us.', true);
      } catch (err) {
        if (button) { button.disabled = false; button.innerHTML = label; }
        say('That did not send — please check your connection and try again'
          + (fallback ? ', or email ' + fallback + ' directly.' : '.'), false);
      }
    });
  }

  /* The section crossing a line just under the header wins, so the label
     matches what is on screen; the last section lights once the page bottoms out. */
  function navHighlight() {
    const links = Array.from(document.querySelectorAll('.navlink'));
    const pairs = links
      .map((a) => ({ a, sec: document.querySelector(a.getAttribute('href')) }))
      .filter((p) => p.sec);
    if (!pairs.length) return;

    const paint = () => {
      const line = 120;
      let hit = null;
      pairs.forEach((p) => {
        const b = p.sec.getBoundingClientRect();
        if (b.top <= line && b.bottom > line) hit = p;
      });
      if (!hit && window.innerHeight + window.scrollY >= document.body.scrollHeight - 8) {
        hit = pairs.filter((p) => p.sec.getBoundingClientRect().top < line).pop() || null;
      }
      links.forEach((a) => a.classList.toggle('is-here', !!hit && a === hit.a));
    };

    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint, { passive: true });
    paint();
  }

  /* Approach timeline. The drawn line eases toward the active step rather
     than tracking the scrollbar; hover or focus previews a stage, a click
     pins it until the section leaves the viewport. */
  function approachTimeline() {
    const tl = document.querySelector('[data-tl]');
    if (!tl) return;
    const steps = Array.from(tl.querySelectorAll('[data-tl-step]'));
    const fill = tl.querySelector('[data-tl-fill]');
    if (!steps.length) return;

    let index = -1, target = 0, eased = 0, locked = false;

    const paint = () => {
      if (fill) fill.style.height = (eased * 100).toFixed(2) + '%';
    };

    const show = (i, preview) => {
      if (i === index && preview !== true) return;
      index = i;
      steps.forEach((st, n) => {
        st.classList.toggle('is-on', n === i);
        st.classList.toggle('is-past', n < i);
      });
      target = steps.length > 1 ? i / (steps.length - 1) : 1;
      paint();
    };

    const onScroll = () => {
      if (locked) {
        const box = tl.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) locked = false;
        return;
      }
      const mark = window.innerHeight * 0.66;
      let i = -1;
      steps.forEach((st, n) => { if (st.getBoundingClientRect().top < mark) i = n; });
      if (i >= 0) show(i);
    };

    const tick = () => {
      eased += (target - eased) * 0.085;
      if (Math.abs(target - eased) < 0.0004) eased = target;
      paint();
      requestAnimationFrame(tick);
    };

    steps.forEach((step, i) => {
      step.addEventListener('mouseenter', () => { if (!reduced) show(i, true); });
      step.addEventListener('focus', () => show(i, true));
      step.addEventListener('click', () => { locked = true; show(i); });
      step.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        steps[(i + d + steps.length) % steps.length].focus();
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    show(0);
    onScroll();
    if (reduced) { eased = 1; paint(); } else { eased = target; paint(); requestAnimationFrame(tick); }
  }

  function animate() {
    const gsap = window.gsap;
    if (!gsap) return;
    gsap.registerPlugin(window.ScrollTrigger);
    const q = (s) => Array.from(document.querySelectorAll(s));
    const hero = (n) => document.querySelector('[data-hero="' + n + '"]');
    const tl = gsap.timeline({ delay: 0.15 });
    if (hero(1)) tl.from(hero(1), { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' });
    if (hero(2)) tl.from(hero(2), { opacity: 0, y: 44, duration: 1, ease: 'power2.out' }, '-=0.35');
    if (hero(4)) tl.from(hero(4), { opacity: 0, y: 24, duration: 0.8, ease: 'power2.out' }, '-=0.6');
    if (hero(5)) tl.from(hero(5), { opacity: 0, y: 24, duration: 0.8, ease: 'power2.out' }, '-=0.6');

    const reveal = (el, delay) => {
      gsap.set(el, { opacity: 0, y: 28 });
      gsap.to(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        opacity: 1, y: 0, duration: 0.8, delay: delay || 0, ease: 'power2.out',
      });
    };
    q('[data-reveal]').forEach((el) => reveal(el));
    q('[data-reveal-group]').forEach((g) => Array.from(g.children).forEach((c, i) => reveal(c, i * 0.07)));
    window.ScrollTrigger.refresh();
  }

  notifyForm();
  dealForm();
  navHighlight();
  approachTimeline();
  if (!reduced) loadScript(GSAP).then(() => loadScript(ST)).then(animate).catch(() => {});
})();
