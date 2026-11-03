/* R&R Grandeur Properties — page behaviour: header state, nav highlight,
   scroll reveals, the process timeline and the two forms. Form endpoints
   come from the CMS (Site settings → Forms) via data attributes, so nothing
   here needs editing. No third-party scripts. */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;
  if (reduced || !canObserve) document.documentElement.classList.add('no-motion');

  /* Header: transparent over the hero, solid navy once the page moves. */
  function header() {
    const head = document.querySelector('[data-head]');
    if (!head || head.classList.contains('is-fixed-solid')) return;
    const paint = () => head.classList.toggle('is-solid', window.scrollY > 24);
    window.addEventListener('scroll', paint, { passive: true });
    paint();
  }

  /* The section crossing a line just under the header lights its nav link. */
  function navHighlight() {
    const links = Array.from(document.querySelectorAll('.navlink'));
    const pairs = links
      .map((a) => ({ a, sec: document.getElementById((a.getAttribute('href') || '').split('#')[1] || '') }))
      .filter((p) => p.sec);
    if (!pairs.length) return;
    const paint = () => {
      const line = 110;
      let hit = null;
      pairs.forEach((p) => {
        const b = p.sec.getBoundingClientRect();
        if (b.top <= line && b.bottom > line) hit = p;
      });
      links.forEach((a) => a.classList.toggle('is-here', !!hit && a === hit.a));
    };
    window.addEventListener('scroll', paint, { passive: true });
    paint();
  }

  /* Scroll reveals that can never leave a section blank. Nothing is hidden
     at load, so screenshots, print and slow devices see the whole page.
     On the first scroll, only items still below the fold are marked; each
     is unmarked as it arrives. */
  function reveals() {
    if (reduced || !canObserve) return;
    const items = [];
    document.querySelectorAll('[data-reveal]').forEach((el) => items.push([el, 0]));
    document.querySelectorAll('[data-reveal-group]').forEach((g) =>
      Array.from(g.children).forEach((c, i) => items.push([c, Math.min(i, 5) * 80])));
    if (!items.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.remove('pre');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    const arm = () => {
      window.removeEventListener('scroll', arm);
      const fold = window.innerHeight;
      items.forEach(([el, d]) => {
        if (el.getBoundingClientRect().top < fold) return;
        el.style.setProperty('--d', d + 'ms');
        el.classList.add('rev', 'pre');
        io.observe(el);
      });
    };
    window.addEventListener('scroll', arm, { passive: true });
  }

  /* Process timeline: the gold rail draws in once, when the steps arrive. */
  function timeline() {
    const tl = document.querySelector('[data-tl]');
    if (!tl || reduced || !canObserve) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { tl.classList.add('is-lit'); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(tl);
  }

  /* Posts to a Formspree-compatible endpoint and expects a 2xx JSON reply.
     Until an endpoint is set the form says so rather than pretending to
     send: silently dropping a seller's deal is the one unacceptable outcome. */
  const send = (endpoint, data) => fetch(endpoint, {
    method: 'POST', body: data, headers: { Accept: 'application/json' },
  }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });

  const sayer = (el) => (msg, ok) => {
    el.textContent = msg;
    el.classList.add('is-shown');
    el.classList.toggle('is-ok', ok);
    el.classList.toggle('is-bad', !ok);
  };

  /* Case studies: tabs show one case at a time. Without script every case
     stays visible, stacked. */
  function cases() {
    const tabs = Array.from(document.querySelectorAll('[data-case-tab]'));
    if (tabs.length < 2) return;
    const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    const list = tabs[0].parentElement;
    list.setAttribute('role', 'tablist');
    list.hidden = false;
    const show = (i, focus) => {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) {
        tabs[i].focus();
        tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    };
    tabs.forEach((t, i) => {
      t.setAttribute('role', 'tab');
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', t.id);
      panels[i].tabIndex = 0;
      t.addEventListener('click', () => show(i));
      t.addEventListener('keydown', (e) => {
        const n = tabs.length;
        const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: n - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault();
        show((to + n) % n, true);
      });
    });
    show(0);
    list.parentElement.setAttribute('data-cases-ready', '');
  }

  function notifyForm() {
    const form = document.querySelector('[data-notify-form]');
    if (!form) return;
    const say = sayer(form.querySelector('[data-notify-status]'));
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
        .then(() => { say('Thank you. We will email you when the marketplace opens.', true); form.reset(); })
        .catch(() => say('That did not send. Please try again.', false));
    });
  }

  /* "1250000" → "$1,250,000" when the visitor leaves the field. */
  function currency(input) {
    if (!input) return;
    const fmt = () => {
      const digits = input.value.replace(/[^\d.]/g, '').split('.')[0];
      input.value = digits ? '$' + Number(digits).toLocaleString('en-US') : '';
    };
    input.addEventListener('blur', fmt);
    fmt();
  }

  function dealForm() {
    const form = document.querySelector('[data-deal-form]');
    if (!form) return;
    const say = sayer(form.querySelector('[data-status]'));
    const sent = document.querySelector('[data-sent]');
    const button = form.querySelector('[data-submit]');
    const label = button ? button.innerHTML : '';
    const fallback = form.dataset.fallback;
    currency(form.querySelector('[data-currency]'));

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
      try {
        await send(endpoint, data);
        if (sent) {
          form.hidden = true;
          sent.hidden = false;
          sent.focus();
        } else {
          say('Thank you. Your submission has reached us.', true);
        }
      } catch (err) {
        if (button) { button.disabled = false; button.innerHTML = label; }
        say('That did not send. Please check your connection and try again'
          + (fallback ? ', or email ' + fallback + ' directly.' : '.'), false);
      }
    });
  }

  header();
  navHighlight();
  reveals();
  timeline();
  cases();
  notifyForm();
  dealForm();
})();
