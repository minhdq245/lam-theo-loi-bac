/* Tiếng lật trang thu âm cho nút; tiếng giấy nhẹ tổng hợp cho thao tác cuộn. */
(function () {
  'use strict';
  var Audio = window.AudioContext || window.webkitAudioContext;
  var toggle = document.getElementById('sound-toggle');
  if (!Audio || !toggle) return;
  var enabled = true, context, master, paper, turnBuffer, turnVoice, turnScale = 1;
  var ready = Promise.resolve(), sampleReady = Promise.resolve();
  var pageTurn = {
    local:'assets/audio/page-turn.mp3',
    title:'Lật trang giấy · Page Turn (1)',
    source:'https://freesound.org/people/OwlStorm/sounds/151220/',
    artist:'Ashe Kirk / Owlish Media (OwlStorm)',
    license:'https://creativecommons.org/publicdomain/zero/1.0/'
  };
  // Tải trước mẫu nhỏ; AudioContext vẫn chỉ mở sau tương tác.
  var sampleBytes = fetch(pageTurn.local).then(function (response) {
    if (!response.ok) throw new Error('Audio unavailable');
    return response.arrayBuffer();
  }).catch(function () { return null; });
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
        sampleReady = sampleBytes.then(function (bytes) {
          return bytes ? context.decodeAudioData(bytes) : null;
        }).then(function (buffer) {
          turnBuffer = buffer;
          if (!buffer) return;
          var peak = 0;
          for (var channel = 0; channel < buffer.numberOfChannels; channel++) {
            var samples = buffer.getChannelData(channel);
            for (var n = 0; n < samples.length; n++) peak = Math.max(peak, Math.abs(samples[n]));
          }
          // Mẫu thu khá nhỏ: cân mức để nghe rõ ở cùng âm lượng hiệu ứng hiện có.
          turnScale = Math.min(10, 0.4 / Math.max(0.001, peak));
        }).catch(function () {});
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
  function turnPage(kind) {
    if (!turnBuffer) { rustle(); return; }
    var now = context.currentTime;
    // Làm nhỏ tiếng trước khi có thao tác nhanh kế tiếp, tránh nhiều trang chồng tiếng.
    if (turnVoice) {
      turnVoice.envelope.gain.cancelScheduledValues(now);
      turnVoice.envelope.gain.setTargetAtTime(0, now, 0.012);
      turnVoice.source.stop(now + 0.04);
    }
    var source = context.createBufferSource(), envelope = context.createGain();
    source.buffer = turnBuffer;
    var level = (kind === 'choice' ? 0.42 : 0.5) * turnScale;
    var duration = turnBuffer.duration;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(level, now + 0.008);
    envelope.gain.setValueAtTime(level, now + Math.max(0.008, duration - 0.025));
    envelope.gain.linearRampToValueAtTime(0, now + duration);
    source.connect(envelope); envelope.connect(master);
    turnVoice = {source:source, envelope:envelope};
    source.onended = function () {
      source.disconnect(); envelope.disconnect();
      if (turnVoice && turnVoice.source === source) turnVoice = null;
    };
    source.start(now);
  }
  function waitForSample() {
    if (turnBuffer) return Promise.resolve();
    return new Promise(function (resolve) {
      var timeout = setTimeout(resolve, 180);
      sampleReady.then(function () { clearTimeout(timeout); resolve(); });
    });
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
        if (now - lastClick < 100) return;
        lastClick = now;
        waitForSample().then(function () {
          if (enabled && context.state === 'running' && !document.hidden) turnPage(kind);
        });
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
  var sourceList = document.getElementById('sources-list');
  if (sourceList) {
    var credit = document.createElement('li'), link = document.createElement('a'), text = document.createElement('small'), license = document.createElement('a');
    link.textContent = pageTurn.title; link.href = pageTurn.source; link.target = '_blank'; link.rel = 'noopener noreferrer';
    text.textContent = 'Thu âm: ' + pageTurn.artist + ' · Freesound · ';
    license.textContent = 'CC0 1.0'; license.href = pageTurn.license; license.target = '_blank'; license.rel = 'noopener noreferrer';
    text.appendChild(license); credit.append(link, text); sourceList.appendChild(credit);
  }
  updateControl();
})();
