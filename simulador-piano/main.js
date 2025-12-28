const pianoKeys = document.querySelectorAll(".piano-keys .key");
const volumeSlider = document.querySelector(".volume-slider input");
const keysCheck = document.querySelector(".keys-check input");

let mappedKeys = [];
let volume = 0.5;

const playTune = (key) => {
    // Criar novo elemento audio para permitir sobreposição de notas
    const audio = new Audio(`./src/tunes/${key}.wav`);
    audio.volume = volume;
    audio.play();

    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    clickedKey.classList.add("active");
    
    setTimeout(() => {
        clickedKey.classList.remove("active");
    }, 150);
};

// Mapear teclas do piano
pianoKeys.forEach(key => {
    const keyNote = key.dataset.key;
    key.addEventListener("click", () => playTune(keyNote));
    
    // Adicionar apenas se não estiver já no array (evitar duplicatas)
    if (!mappedKeys.includes(keyNote)) {
        mappedKeys.push(keyNote);
    }
});

// Teclado físico
document.addEventListener("keydown", (event) => {
    // Converter para minúsculas para melhor compatibilidade
    const keyPressed = event.key.toLowerCase();
    
    if (mappedKeys.includes(keyPressed)) {
        playTune(keyPressed);
    }
});

const showHideKeys = () => {
    pianoKeys.forEach(key => key.classList.toggle("hide"));
};

const handleVolume = (event) => {
    volume = event.target.value;
    // Salvar preferência de volume
    localStorage.setItem('piano-volume', volume);
};

// Carregar preferências salvas
window.addEventListener('load', () => {
    const savedVolume = localStorage.getItem('piano-volume');
    if (savedVolume) {
        volume = parseFloat(savedVolume);
        volumeSlider.value = volume;
    }
    
    // Atualizar ano no footer
    year.textContent = new Date().getFullYear();
});

volumeSlider.addEventListener("input", handleVolume);
keysCheck.addEventListener("change", showHideKeys);

// Footer
const year = document.querySelector("#year");