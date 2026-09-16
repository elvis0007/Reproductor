// Playlist romántica de Rels B (reproducida desde YouTube)
const playlist = [
  { title: 'LOVE IT', videoId: '-n_gb-KV1j0' },
  { title: 'Lucy', videoId: 'XeQ-2bao1lQ' },
  { title: 'Cómo dormiste?', videoId: 'PSjeJrDI4a4' },
  { title: 'Pretty GIRL (a new star 1993)', videoId: 'BSi5Cpcm4mc' },
  { title: 'Media Pastiii', videoId: 'krGTKGAjm1E' },
  { title: 'A Mí', videoId: 'Q4Js9OEODHM' },
  { title: 'Sonríe', videoId: 'WQ6Q5nYZl_A' },
  { title: 'Por Dentro (ft. Kenia OS)', videoId: '1yhNARgC6I8' },
  { title: 'pa quererte', videoId: 'XQeBTVeWkDo' },
  { title: 'balearico', videoId: 'h-MA21yJ-7g' },
  { title: 'Un Rodeoooo', videoId: 'UN_gY08Xylg' },
  { title: 'LOCA', videoId: '2qsPTMwwEzU' },
  { title: 'Buenos Genes (ft. Dellafuente)', videoId: '7-pnUgGurMU' },
  { title: 'Ni 1 Complejo', videoId: 'paE0GdOJAsY' },
  { title: 'CLASE G', videoId: 'MKirfZeIrpo' },
  { title: 'Mi Amor (con Aitana)', videoId: 'TC6pGc895yY' },
  { title: 'Lejos de Ti', videoId: 'opr9Vewr3Oo' },
  { title: 'Si me muero', videoId: 'UMlHv-Z5rEI' },
  { title: 'Mi Luz (RVFV ft. Rels B)', videoId: 'uU2UAEHbpOw' },
  { title: 'Reina de Pikas', videoId: 'lC9cgTbMmlU' },
  { title: 'Vuelve Contigo', videoId: '1TI0qH2Kpvk' },
  { title: 'Mejor No Nos Vemos', videoId: 'Ghywp7i032A' },
  { title: 'yo pr1mero', videoId: 'UkXrBPuAWOc' },
  { title: 'Shorty Q Te Vaya Bnn', videoId: 'L_C1EB0qoPY' },
  { title: 'Lo Que Hay X Aquí', videoId: 'qWCup_EZSWE' },
  { title: 'Sin Mirar Las Señales', videoId: '4OT447-Eldg' },
  { title: 'Se Me Olvidó (con Gera MX)', videoId: 'NJjHBb6BvqI' },
  { title: 'La Última Canción', videoId: 'VukKOGBk5d8' },
  { title: 'Tu Vas Sin (fav)', videoId: 'LypslWGSvSI' },
  { title: 'UYUNI', videoId: 'JS6XoPJyYCI' },
];

let player;
let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;
let progressTimer = null;
let toastTimer = null;
let consecutiveErrors = 0;

const npTitle = document.getElementById('npTitle');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const seekBar = document.getElementById('seekBar');
const volumeBar = document.getElementById('volumeBar');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const playlistEl = document.getElementById('playlist');
const playlistCountEl = document.getElementById('playlistCount');
const fileWarningEl = document.getElementById('fileWarning');
const toastEl = document.getElementById('toast');

function thumbUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  if (playlistCountEl) {
    playlistCountEl.textContent = playlist.length + ' canciones';
  }
  playlist.forEach((track, index) => {
    const li = document.createElement('li');
    li.className = 'track' + (index === currentIndex ? ' playing' : '');
    li.innerHTML = `
      <img class="thumb" src="${thumbUrl(track.videoId)}" alt="${track.title}" loading="lazy">
      <div class="meta">
        <div class="track-title">${track.title}</div>
        <div class="track-artist">Rels B</div>
      </div>
      <div class="eq"><span></span><span></span><span></span></div>
    `;
    li.addEventListener('click', () => playTrack(index));
    playlistEl.appendChild(li);
  });
}

function highlightActiveTrack() {
  [...playlistEl.children].forEach((li, index) => {
    li.classList.toggle('playing', index === currentIndex);
  });
}

function playTrack(index) {
  currentIndex = index;
  npTitle.textContent = playlist[currentIndex].title;
  highlightActiveTrack();
  if (player && player.loadVideoById) {
    player.loadVideoById(playlist[currentIndex].videoId);
  }
}

function nextTrack() {
  if (isShuffle) {
    let next;
    do {
      next = Math.floor(Math.random() * playlist.length);
    } while (next === currentIndex && playlist.length > 1);
    playTrack(next);
  } else {
    playTrack((currentIndex + 1) % playlist.length);
  }
}

function prevTrack() {
  playTrack((currentIndex - 1 + playlist.length) % playlist.length);
}

function setPlayIcon(playing) {
  playBtn.innerHTML = playing ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>';
}

function togglePlay() {
  if (!player || !player.getPlayerState) return;
  const state = player.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function startProgressLoop() {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!player || !player.getDuration) return;
    const duration = player.getDuration();
    const current = player.getCurrentTime();
    if (duration > 0) {
      seekBar.max = duration;
      seekBar.value = current;
      currentTimeEl.textContent = formatTime(current);
      durationTimeEl.textContent = formatTime(duration);
    }
  }, 400);
}

function stopProgressLoop() {
  clearInterval(progressTimer);
}

// --- YouTube IFrame API ---
function loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('yt-player', {
    height: '100%',
    width: '100%',
    videoId: playlist[currentIndex].videoId,
    playerVars: {
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: window.location.origin || undefined,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
};

function onPlayerReady() {
  npTitle.textContent = playlist[currentIndex].title;
  player.setVolume(Number(volumeBar.value));
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    consecutiveErrors = 0;
    setPlayIcon(true);
    startProgressLoop();
  } else if (event.data === YT.PlayerState.PAUSED) {
    setPlayIcon(false);
    stopProgressLoop();
  } else if (event.data === YT.PlayerState.ENDED) {
    setPlayIcon(false);
    stopProgressLoop();
    if (isRepeat) {
      player.seekTo(0, true);
      player.playVideo();
    } else {
      nextTrack();
    }
  }
}

// Error codes: 2 = id inválido, 5 = error de reproductor HTML5,
// 100 = video no encontrado, 101/150 = el dueño no permite reproducirlo incrustado
function onPlayerError(event) {
  const track = playlist[currentIndex];
  console.warn('YouTube player error', event.data, 'en', track && track.title);
  consecutiveErrors += 1;

  if (consecutiveErrors >= playlist.length) {
    showToast('Ninguna canción se puede reproducir aquí ahora mismo. Revisa tu conexión.');
    return;
  }

  showToast(`"${track ? track.title : 'Esta canción'}" no se puede reproducir aquí. Pasando a la siguiente…`);
  setTimeout(nextTrack, 900);
}

function checkFileProtocol() {
  if (fileWarningEl && window.location.protocol === 'file:') {
    fileWarningEl.style.display = 'block';
  }
}

// --- Event listeners ---
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextTrack);
prevBtn.addEventListener('click', prevTrack);

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
});

seekBar.addEventListener('input', () => {
  if (player && player.seekTo) {
    player.seekTo(Number(seekBar.value), true);
  }
});

volumeBar.addEventListener('input', () => {
  if (player && player.setVolume) {
    player.setVolume(Number(volumeBar.value));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderPlaylist();
  checkFileProtocol();
  loadYouTubeAPI();
});
