/* Hiệu ứng âm thanh ngắn, tổng hợp tại chỗ; không cần tải tệp âm thanh. */
(function () {
  'use strict';
  var Audio = window.AudioContext || window.webkitAudioContext;
  var toggle = document.getElementById('sound-toggle');
  if (!Audio || !toggle) return;
  var enabled = true, context, master, paper, ready = Promise.resolve();
  var lastClick = -Infinity, lastPaper = -Infinity;
  var scrollIntent = 0, previousY = window.scrollY, distance = 0, direction = 0;
  try { enabled = localStorage.getItem('loi-bac-sounds') !== 'off'; } catch (error) {}

  function updateControl() {
    toggle.hidden = false;
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.title = enabled ? 'Tắt âm thanh khi cuộn và bấm nút' : 'Bật âm thanh khi cuộn và bấm nút';
    toggle.querySelector('.sound-state').textContent = enabled ? 'Bật' : 'Tắt';
  }
  function activate() {
    if (!enabled) return;
    try {
      if (!context) {
        context = new Audio();
        master = context.createGain();
        master.gain.value = 0.28;
        master.connect(context.destination);
        paper = context.createBuffer(1, Math.ceil(context.sampleRate * 0.23), context.sampleRate);
        var data = paper.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (context.state === 'suspended') ready = context.resume().catch(function () {});
    } catch (error) {
      enabled = false;
      updateControl();
    }
  }
  function dispose(source, nodes) {
    source.onended = function () {
      source.disconnect();
      nodes.forEach(function (node) { node.disconnect(); });
    };
  }
  function tap(kind) {
    var now = context.currentTime;
    var oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(kind === 'choice' ? 640 : 820, now);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'choice' ? 380 : 470, now + 0.07);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.16, now + 0.006);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.105);
    oscillator.connect(envelope); envelope.connect(master);
    oscillator.start(now); oscillator.stop(now + 0.12);
    dispose(oscillator, [envelope]);
  }
  function rustle() {
    var now = context.currentTime;
    var source = context.createBufferSource(), filter = context.createBiquadFilter(), envelope = context.createGain();
    source.buffer = paper;
    source.playbackRate.value = 0.95 + Math.random() * 0.1;
    filter.type = 'bandpass'; filter.frequency.value = 1700; filter.Q.value = 0.55;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.14, now + 0.035);
    envelope.gain.linearRampToValueAtTime(0.05, now + 0.09);
    envelope.gain.linearRampToValueAtTime(0.11, now + 0.13);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    source.connect(filter); filter.connect(envelope); envelope.connect(master);
    source.start(now); source.stop(now + 0.24);
    dispose(source, [filter, envelope]);
  }
  function play(kind) {
    ready.then(function () {
      if (!enabled || !context || context.state !== 'running' || document.hidden) return;
      var now = performance.now();
      if (kind === 'paper') {
        if (now - lastPaper < 550) return;
        lastPaper = now; rustle();
      } else {
        if (now - lastClick < 65) return;
        lastClick = now; tap(kind);
      }
    });
  }
  // Chỉ mở AudioContext trong thao tác thật của người xem.
  document.addEventListener('pointerup', function (event) { if (event.isTrusted) activate(); }, {passive:true});
  document.addEventListener('touchend', function (event) { if (event.isTrusted) activate(); }, {passive:true});
  document.addEventListener('click', function (event) {
    if (!event.isTrusted) return;
    var control = event.target.closest('button, a[href], input[type="button"], input[type="submit"]');
    if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true') return;
    scrollIntent = 0; distance = 0;
    if (control === toggle) return;
    activate();
    // Hai thao tác này còn được dùng qua phím tắt của trò chơi.
    if (!control.matches('.choice, #next')) play('click');
  }, true);
  document.addEventListener('exhibit-sound', function (event) { scrollIntent = 0; distance = 0; play(event.detail); });
  document.addEventListener('keydown', function (event) {
    if (!event.isTrusted || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    activate();
    var focused = document.activeElement;
    if (focused && focused.closest('button,a,input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) scrollIntent = performance.now() + 800;
  }, true);
  document.addEventListener('wheel', function (event) {
    if (event.isTrusted && !event.ctrlKey && Math.abs(event.deltaY) > Math.abs(event.deltaX)) scrollIntent = performance.now() + 650;
  }, {passive:true});
  document.addEventListener('touchmove', function (event) {
    if (event.isTrusted) scrollIntent = performance.now() + 800;
  }, {passive:true});
  window.addEventListener('scroll', function () {
    var delta = window.scrollY - previousY;
    previousY = window.scrollY;
    if (!enabled || !context || performance.now() > scrollIntent) { distance = 0; return; }
    var nextDirection = Math.sign(delta);
    if (nextDirection && nextDirection !== direction) distance = 0;
    if (nextDirection) direction = nextDirection;
    distance += Math.abs(delta);
    if (distance >= 130) { distance = 0; play('paper'); }
  }, {passive:true});
  document.addEventListener('exhibit-view', function () { scrollIntent = 0; distance = 0; previousY = window.scrollY; });
  toggle.addEventListener('click', function () {
    enabled = !enabled;
    try { localStorage.setItem('loi-bac-sounds', enabled ? 'on' : 'off'); } catch (error) {}
    updateControl();
    if (enabled) activate();
    if (master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(enabled ? 0.28 : 0, context.currentTime, 0.012);
    }
    if (enabled) play('click');
  });
  document.addEventListener('visibilitychange', function () {
    scrollIntent = 0; distance = 0;
    if (!context) return;
    if (document.hidden) context.suspend().catch(function () {});
    else if (enabled) activate();
  });
  updateControl();
})();
