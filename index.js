window.addEventListener('DOMContentLoaded', () => {
    const elements = {
        playButton: document.querySelector("#play_button"),
        pauseButton: document.querySelector("#pause_button"),
        leftSkipButton: document.querySelector("#left_skip_button"),
        rightSkipButton: document.querySelector("#right_skip_button"),
        loopButton: document.querySelector("#loop_button"),
        shuffleButton: document.querySelector("#shuffle_button"),
        progressSlider: document.querySelector("#progress_slider"),
        audio: document.querySelector("audio"),
        albumArt: document.querySelector("#album_art"),
        sidebar: document.getElementById("sidebar"),
        toggleSidebarBtn: document.getElementById("toggle_sidebar"),
        playlistContainer: document.getElementById("playlist_items"),
        songName: document.getElementById('song_name'),
        artistName: document.getElementById('artist_name'),
        backgroundOverlay: document.getElementById("background_overlay")
    };

    let playerState = {
        isLooping: false,
        isShuffling: false,
        currentTrack: 0,
        isPlaying: false
    };

    const MOBILE_BREAKPOINT = 488;

    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    const rawSongs = [
        "Yung Kai — Wildflower",
        "Bôa — Duvet",
        "The Marias — Sienna",
        "Ed Sheeran — Perfect",
        "Prateek Kuhad — Co2",
        "Taylor Swift — Love Story",
        "The Beatles — Here Comes the Sun",
        "The Rare Occasions — Notion",
        "Two Door Club — What You Know",
        "The Weeknd — Starboy",
        "Jptrockerz — Basanta",
    ];

    const playlist = rawSongs.map(name => {
        const [artist, track] = name.split(" — ");
        return {
            file: `playlist/${name}.mp3`,
            cover: `cover/${track}.jpeg`,
            artist,
            track
        };
    });

    function initializePlayer() {
        elements.albumArt.style.animationPlayState = 'paused';
        setPlayPauseButtonState(false);
        
        // Load first song
        elements.audio.src = playlist[playerState.currentTrack].file;
        updateSongInfo(playerState.currentTrack);
        populatePlaylist();
        updateActiveListItem();
    }

    function setPlayPauseButtonState(isPlaying) {
        playerState.isPlaying = isPlaying;
        elements.playButton.style.display = isPlaying ? "none" : "inline-block";
        elements.pauseButton.style.display = isPlaying ? "inline-block" : "none";
    }

    function updateSongInfo(index) {
        const track = playlist[index];
        elements.songName.innerHTML = track.track;
        elements.artistName.innerHTML = track.artist;
        elements.albumArt.src = track.cover;
        updateBackground(index);
    }

    function updateBackground(index) {
        const encodedURL = encodeURI(playlist[index].cover);
        elements.backgroundOverlay.style.backgroundImage = `url(${encodedURL})`;
    }

    function updateActiveListItem() {
        document.querySelectorAll("#playlist_items li").forEach((item, i) => {
            item.classList.toggle("active", i === playerState.currentTrack);
        });
    }

    function populatePlaylist() {
        elements.playlistContainer.innerHTML = '';

        playlist.forEach((track, index) => {
            const li = document.createElement("li");
            li.innerText = `${track.track} – ${track.artist}`;
            li.dataset.index = index;
            elements.playlistContainer.appendChild(li);
        });
    }

    function closeSidebar() {
        elements.sidebar.classList.remove("open");
        elements.toggleSidebarBtn.classList.remove("open");
    }

    function playTrack() {
        elements.audio.play();
        updateSongInfo(playerState.currentTrack);
        setPlayPauseButtonState(true);
    }

    function pauseTrack() {
        elements.audio.pause();
        setPlayPauseButtonState(false);
    }

    function skipTrack(direction) {
        if (direction === 'next') {
            if (playerState.isShuffling) {
                playerState.currentTrack = getRandomTrack();
            } else {
                playerState.currentTrack = (playerState.currentTrack + 1) % playlist.length;
            }
        } else if (direction === 'prev') {
            playerState.currentTrack = (playerState.currentTrack - 1 + playlist.length) % playlist.length;
        }
        
        elements.audio.src = playlist[playerState.currentTrack].file;
        playTrack();
        updateActiveListItem();
    }

    function getRandomTrack() {
        if (playlist.length <= 1) return 0;
        
        let nextTrack;
        do {
            nextTrack = Math.floor(Math.random() * playlist.length);
        } while (nextTrack === playerState.currentTrack);
        
        return nextTrack;
    }

    function playTrackByIndex(index) {
        playerState.currentTrack = index;
        elements.audio.src = playlist[playerState.currentTrack].file;
        updateSongInfo(playerState.currentTrack);
        playTrack();
        updateActiveListItem();
        
        if (isMobile()) {
            closeSidebar();
        }
    }

    // Event Listeners
    function setupEventListeners() {

        // Play/Pause 
        elements.playButton.addEventListener('click', playTrack);
        elements.pauseButton.addEventListener('click', pauseTrack);

        // Skip 
        elements.leftSkipButton.addEventListener('click', () => skipTrack('prev'));
        elements.rightSkipButton.addEventListener('click', () => skipTrack('next'));

        // Loop 
        elements.loopButton.addEventListener('click', () => {
            playerState.isLooping = !playerState.isLooping;
            elements.loopButton.classList.toggle("active", playerState.isLooping);
        });

        // Shuffle 
        elements.shuffleButton.addEventListener('click', () => {
            playerState.isShuffling = !playerState.isShuffling;
            elements.shuffleButton.classList.toggle("active", playerState.isShuffling);
        });

        // Slider
        elements.progressSlider.addEventListener('input', () => {
            const seekTime = (elements.progressSlider.value / 100) * elements.audio.duration;
            elements.audio.currentTime = seekTime;
        });


        elements.audio.addEventListener('ended', () => {
            if (playerState.isLooping) {
                elements.audio.currentTime = 0;
                elements.audio.play();
            } else {
                skipTrack('next');
            }
        });

        elements.audio.addEventListener('timeupdate', () => {
            const progress = (elements.audio.currentTime / elements.audio.duration) * 100;
            elements.progressSlider.value = progress || 0;
        });

        elements.audio.addEventListener('play', () => {
            elements.albumArt.style.animationPlayState = 'running';
        });

        elements.audio.addEventListener('pause', () => {
            elements.albumArt.style.animationPlayState = 'paused';
        });

        
        elements.toggleSidebarBtn.addEventListener("click", () => {
            elements.sidebar.classList.toggle("open");
            elements.toggleSidebarBtn.classList.toggle("open");
        });

        
        elements.playlistContainer.addEventListener("click", (e) => {
            if (e.target.tagName === "LI") {
                const index = parseInt(e.target.dataset.index);
                playTrackByIndex(index);
            }
        });

        
        document.addEventListener('click', (e) => {
            if (!elements.sidebar.contains(e.target) && 
                !elements.toggleSidebarBtn.contains(e.target) && 
                elements.sidebar.classList.contains('open')) {
                    closeSidebar();
            }
        });

    }
        const timeElements = {
        currentTime: document.getElementById('current_time'),
        totalTime: document.getElementById('total_time')
        };

        // Utility function to format time
        function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        elements.audio.addEventListener('timeupdate', () => {
        const progress = (elements.audio.currentTime / elements.audio.duration) * 100;
        elements.progressSlider.value = progress || 0;
        
        timeElements.currentTime.textContent = formatTime(elements.audio.currentTime);
        timeElements.totalTime.textContent = formatTime(elements.audio.duration);
        });

        elements.audio.addEventListener('loadedmetadata', () => {
        timeElements.totalTime.textContent = formatTime(elements.audio.duration);
        timeElements.currentTime.textContent = formatTime(0);
        });

    // Initialize everything
    initializePlayer();
    setupEventListeners();
});