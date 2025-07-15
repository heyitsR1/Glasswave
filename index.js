window.addEventListener('DOMContentLoaded', () => {
    const play_button = document.querySelector("#play_button");
    const pause_button = document.querySelector("#pause_button");
    const left_skip_button = document.querySelector("#left_skip_button");
    const right_skip_button = document.querySelector("#right_skip_button");
    const loop_button = document.querySelector("#loop_button");
    const shuffle_button = document.querySelector("#shuffle_button");
    const progress_slider = document.querySelector("#progress_slider");
    const audio = document.querySelector("audio");
    const album_art = document.querySelector("#album_art");
    const sidebar = document.getElementById("sidebar");
    const toggleSidebarBtn = document.getElementById("toggle_sidebar");
    const playlistContainer = document.getElementById("playlist_items");

    let isLooping = false;
    let isShuffling = false;
    let currentTrack = 0;

    album_art.style.animationPlayState = 'paused';
    play_button.style.display = "inline-block";
    pause_button.style.display = "none";

    const rawSongs = [
    "Bôa — Duvet",
    "The Marias — Sienna",
    "Yung Kai — Wildflower",
    "Ed Sheeran — Perfect",
    "Prateek Kuhad — Co2",
    "Taylor Swift — Love Story",
    "The Beatles — Here Comes the Sun",
    "The Rare Occasions — Notion",
    "Two Door Club — What You Know",
    "The Weeknd — Starboy",
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


    // Load first song
    audio.src = playlist[currentTrack].file;
    updateSongInfo(currentTrack);

    audio.addEventListener('ended', () => {
        if (isLooping) {
            // Restart the same track
            audio.currentTime = 0;
            audio.play();
        } else {
            if (isShuffling) {
                let nextTrack;
                do {
                    nextTrack = Math.floor(Math.random() * playlist.length);
                } while (nextTrack === currentTrack && playlist.length > 1);
                currentTrack = nextTrack;
            } else {
                currentTrack = (currentTrack + 1) % playlist.length;
            }
            audio.src = playlist[currentTrack].file;
            updateSongInfo(currentTrack);
            audio.play();
            updateActiveListItem();
        }
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progress_slider.value = progress || 0;
    });

    progress_slider.addEventListener('input', () => {
        const seek_time = (progress_slider.value / 100) * audio.duration;
        audio.currentTime = seek_time;
    });

    play_button.addEventListener('click', () => {
        audio.play();
        updateSongInfo(currentTrack);
        play_button.style.display = "none";
        pause_button.style.display = "inline-block";
    });

    pause_button.addEventListener('click', () => {
        audio.pause();
        pause_button.style.display = "none";
        play_button.style.display = "inline-block";
    });

    left_skip_button.addEventListener('click', () => {
        currentTrack = (currentTrack - 1 + playlist.length) % playlist.length;
        audio.src = playlist[currentTrack].file;
        audio.play();
        updateSongInfo(currentTrack);
        updateActiveListItem();
        play_button.style.display = "none";
        pause_button.style.display = "inline-block";
    });

    right_skip_button.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        audio.src = playlist[currentTrack].file;
        audio.play();
        updateSongInfo(currentTrack);
        updateActiveListItem();
        play_button.style.display = "none";
        pause_button.style.display = "inline-block";
    });

    function updateSongInfo(index) {
        document.getElementById('song_name').innerHTML = playlist[index].track;
        document.getElementById('artist_name').innerHTML = playlist[index].artist;
        document.getElementById('album_art').src = playlist[index].cover;
        updateBackground(index);
    }

    loop_button.addEventListener('click', function () {
        isLooping = !isLooping;
        loop_button.classList.toggle("active", isLooping);
    });

    shuffle_button.addEventListener('click', function () {
        isShuffling = !isShuffling;
        shuffle_button.classList.toggle("active", isShuffling);
    });

    audio.addEventListener('play', () => {
        album_art.style.animationPlayState = 'running';
    });

    audio.addEventListener('pause', () => {
        album_art.style.animationPlayState = 'paused';
    });

    // Populate Playlist
    playlist.forEach((track, index) => {
        const li = document.createElement("li");
        li.innerText = `${track.track} – ${track.artist}`;
        li.dataset.index = index;
        playlistContainer.appendChild(li);
    });

    // Sidebar toggle button
    toggleSidebarBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        toggleSidebarBtn.classList.toggle("open");
    });

    // Click to play from sidebar
    playlistContainer.addEventListener("click", (e) => {
        if (e.target.tagName === "LI") {
            const index = parseInt(e.target.dataset.index);
            currentTrack = index;
            audio.src = playlist[currentTrack].file;
            updateSongInfo(currentTrack);
            audio.play();
            play_button.style.display = "none";
            pause_button.style.display = "inline-block";
            updateActiveListItem();
        }
    });

    function updateActiveListItem() {
        document.querySelectorAll("#playlist_items li").forEach((item, i) => {
            item.classList.toggle("active", i === currentTrack);
        });
    }
        function updateBackground(index) {
        const encodedURL = encodeURI(playlist[index].cover);
        document.getElementById("background_overlay").style.backgroundImage = `url(${encodedURL})`;
        }


    // Call once on load
    updateActiveListItem();
});

