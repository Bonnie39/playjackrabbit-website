/* ── Custom video player ──────────────────────── */
(function () {
  const wrap        = document.querySelector('.video-wrap');
  const video       = document.getElementById('player');
  const bigPlay     = document.getElementById('big-play');
  const controls    = document.getElementById('controls');
  const btnPlay     = document.getElementById('btn-play');
  const iconPlay    = btnPlay.querySelector('.icon-play');
  const iconPause   = btnPlay.querySelector('.icon-pause');
  const btnMute     = document.getElementById('btn-mute');
  const iconVol     = btnMute.querySelector('.icon-vol');
  const iconMute    = btnMute.querySelector('.icon-mute');
  const btnFs       = document.getElementById('btn-fs');
  const iconFs      = btnFs.querySelector('.icon-fs');
  const iconExitFs  = btnFs.querySelector('.icon-exit-fs');
  const progressWrap = document.getElementById('progress-wrap');
  const progressFill = document.getElementById('progress-fill');
  const progressThumb = document.getElementById('progress-thumb');
  const timeDisplay = document.getElementById('time-display');
  const volumeSlider = document.getElementById('volume');

  let started = false;
  let hideTimer = null;

  // ── Helpers ──────────────────────────────────

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function updatePlayIcons() {
    const paused = video.paused;
    iconPlay.style.display  = paused  ? '' : 'none';
    iconPause.style.display = !paused ? '' : 'none';
    wrap.classList.toggle('paused', paused);
    bigPlay.classList.toggle('hidden', !paused);
  }

  function updateProgress() {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    progressFill.style.width = pct + '%';
    progressThumb.style.left = pct + '%';
    timeDisplay.textContent  = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
  }

  function updateMuteIcons() {
    iconVol.style.display  = video.muted ? 'none' : '';
    iconMute.style.display = video.muted ? ''     : 'none';
  }

  // ── Play / Pause ──────────────────────────────

  function togglePlay() {
    if (video.paused) {
      video.play();
      started = true;
    } else {
      video.pause();
    }
  }

  wrap.addEventListener('click', (e) => {
    // Don't fire if clicking a control button
    if (e.target.closest('.controls')) return;
    togglePlay();
  });

  btnPlay.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePlay();
  });

  video.addEventListener('play',  updatePlayIcons);
  video.addEventListener('pause', updatePlayIcons);
  video.addEventListener('ended', () => {
    started = false;
    video.currentTime = 0;
    updatePlayIcons();
    updateProgress();
  });

  // ── Progress ──────────────────────────────────

  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', updateProgress);

  function seekTo(e) {
    const rect = progressWrap.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * video.duration;
  }

  let seeking = false;
  progressWrap.addEventListener('mousedown', (e) => { seeking = true; seekTo(e); });
  document.addEventListener('mousemove',     (e) => { if (seeking) seekTo(e); });
  document.addEventListener('mouseup',       ()  => { seeking = false; });

  // Touch seek
  progressWrap.addEventListener('touchstart', (e) => seekTo(e.touches[0]), { passive: true });
  progressWrap.addEventListener('touchmove',  (e) => seekTo(e.touches[0]), { passive: true });

  // ── Volume ────────────────────────────────────

  volumeSlider.addEventListener('input', (e) => {
    video.volume = parseFloat(e.target.value);
    video.muted  = video.volume === 0;
    updateMuteIcons();
  });

  btnMute.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) {
      video.volume = 0.5;
      volumeSlider.value = 0.5;
    }
    updateMuteIcons();
  });

  // ── Fullscreen ────────────────────────────────

  btnFs.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      wrap.requestFullscreen?.() || wrap.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || document.webkitExitFullscreen?.();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    iconFs.style.display     = isFs ? 'none' : '';
    iconExitFs.style.display = isFs ? ''     : 'none';
  });

  // ── Keyboard shortcuts ────────────────────────

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch (e.code) {
      case 'Space': case 'KeyK':
        e.preventDefault(); togglePlay(); break;
      case 'KeyM':
        video.muted = !video.muted; updateMuteIcons(); break;
      case 'ArrowRight':
        video.currentTime = Math.min(video.duration, video.currentTime + 5); break;
      case 'ArrowLeft':
        video.currentTime = Math.max(0, video.currentTime - 5); break;
      case 'ArrowUp':
        video.volume = Math.min(1, video.volume + 0.1);
        volumeSlider.value = video.volume; updateMuteIcons(); break;
      case 'ArrowDown':
        video.volume = Math.max(0, video.volume - 0.1);
        volumeSlider.value = video.volume; updateMuteIcons(); break;
      case 'KeyF':
        btnFs.click(); break;
    }
  });

  // ── Init state ────────────────────────────────
  updatePlayIcons();
  updateMuteIcons();
})();