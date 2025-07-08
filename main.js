// main.js
console.log('main.js загружен.'); // Отладочное сообщение

const video = document.getElementById('animationVideo');
console.log('Элемент video найден:', video); // Отладочное сообщение
const initialScreen = document.getElementById('initialScreen');
const startButton = document.getElementById('startButton');

const FRAME_RATE = 25; // Частота кадров видео
const MS_PER_FRAME = 1000 / FRAME_RATE;
const TOTAL_FRAMES = 645; // Общее количество кадров видео

let isPlaying = false; // Флаг состояния воспроизведения
let animationInterval = null; // ID для setInterval

// Состояния анимации
const STATES = {
    INITIAL_SCREEN: 'initialScreen', // Начальный экран, ожидание клика на кнопку
    SEGMENT_1: 'segment1',           // Кадры 1-115, звук 27.mp3
    WAIT_115: 'wait115',             // Ожидание клика на кадре 115, звук 27.mp3
    SEGMENT_2: 'segment2',           // Кадры 116-125, звук 73.mp3
    WAIT_125: 'wait125',             // Ожидание клика на кадре 125, звук 73.mp3
    SEGMENT_3: 'segment3',           // Кадры 126-645, звук 75.mp3
    END: 'end'                       // Конец на кадре 645, ожидание клика для перезапуска
};
let currentState = STATES.INITIAL_SCREEN;

// Объекты Audio для звуков. Пути относительны main.js
const sounds = {
    '27': new Audio('sounds/27.mp3'),
    '73': new Audio('sounds/73.mp3'),
    '75': new Audio('sounds/75.mp3')
};

// Настраиваем зацикливание для фонового звука (73.mp3)
if (sounds['73']) {
    sounds['73'].loop = true;
}

// Убедимся, что видео изначально скрыто, пока не начнется анимация
video.style.display = 'none';

// Добавляем слушателя событий для видео, чтобы отслеживать его состояние
video.addEventListener('loadedmetadata', () => {
    console.log('Видео: Метаданные загружены. Продолжительность:', video.duration, 'сек.');
});

video.addEventListener('canplaythrough', () => {
    console.log('Видео: Готово к воспроизведению до конца.');
});

video.addEventListener('play', () => {
    console.log('Видео: Начало воспроизведения.');
});

video.addEventListener('pause', () => {
    console.log('Видео: Пауза.');
});

video.addEventListener('ended', () => {
    console.log('Видео: Воспроизведение завершено.');
});

video.addEventListener('error', (e) => {
    console.error('Ошибка видео:', e);
});

// Функция для установки видео на нужный кадр
function setVideoToFrame(frameNumber) {
    const targetTime = (frameNumber - 1) / FRAME_RATE;
    console.log(`Устанавливаем видео на кадр ${frameNumber} (время: ${targetTime} сек).`);
    video.currentTime = targetTime;
}

// Отслеживает текущее время видео и переключает состояния анимации
function updateAnimationState() {
    if (!isPlaying) return;

    let currentLogicalFrame = Math.floor(video.currentTime * FRAME_RATE) + 1;
    // console.log(`Текущий логический кадр: ${currentLogicalFrame}, Текущее состояние: ${currentState}`); // Отладочное сообщение

    if (currentState === STATES.SEGMENT_1 && currentLogicalFrame >= 115) {
        setVideoToFrame(115);
        stopAnimation();
        currentState = STATES.WAIT_115;
        console.log('Пауза на кадре 115. Ожидание клика.');
    } else if (currentState === STATES.SEGMENT_2 && currentLogicalFrame >= 125) {
        setVideoToFrame(125);
        stopAnimation();
        currentState = STATES.WAIT_125;
        console.log('Пауза на кадре 125. Ожидание клика.');
    } else if (currentState === STATES.SEGMENT_3 && currentLogicalFrame >= TOTAL_FRAMES) {
        setVideoToFrame(TOTAL_FRAMES);
        stopAnimation();
        currentState = STATES.END;
        console.log('Анимация завершена. Звук 75.mp3 доигрывает. Кликните, чтобы повторить.');
    }
}

// Функции управления воспроизведением видео
function playAnimation() {
    if (!isPlaying) {
        isPlaying = true;
        console.log('Попытка запустить видео. Текущее время видео:', video.currentTime);
        // УДАЛЕН video.load() - это была причина перезапуска видео с начала
        video.play().then(() => {
            console.log('Запрос на воспроизведение видео успешен.');
            animationInterval = setInterval(updateAnimationState, MS_PER_FRAME / 2);
        }).catch(e => {
            console.error("Ошибка воспроизведения видео:", e);
            isPlaying = false;
        });
    }
}

function stopAnimation() {
    isPlaying = false;
    video.pause();
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    console.log('Анимация остановлена.');
}

function stopAllSounds() {
    console.log('Останавливаем все звуки.');
    for (const key in sounds) {
        if (sounds.hasOwnProperty(key)) {
            sounds[key].pause();
            sounds[key].currentTime = 0;
            console.log(`Звук ${key}.mp3 остановлен и перемотан.`);
        }
    }
}

// Функции для запуска сегментов
function startSegment1() {
    currentState = STATES.SEGMENT_1;
    stopAllSounds();
    sounds['27'].play().catch(e => console.error("Ошибка воспроизведения звука 27:", e));
    setVideoToFrame(1);
    playAnimation();
    console.log('Начинается сегмент 1 (кадры 1-115) со звуком 27.mp3');
}

function startSegment2() {
    currentState = STATES.SEGMENT_2;
    stopAllSounds();
    sounds['73'].play().catch(e => console.error("Ошибка воспроизведения звука 73:", e));
    setVideoToFrame(116);
    playAnimation();
    console.log('Начинается сегмент 2 (кадры 116-125) со звуком 73.mp3');
}

function startSegment3() {
    currentState = STATES.SEGMENT_3;
    stopAllSounds();
    sounds['75'].play().catch(e => console.error("Ошибка воспроизведения звука 75:", e));
    setVideoToFrame(126);
    playAnimation();
    console.log('Начинается сегмент 3 (кадры 126-645) со звуком 75.mp3');
}

// Обработчик клика по кнопке "Начать"
startButton.addEventListener('click', () => {
    console.log('Клик по кнопке "Начать". Текущее состояние:', currentState);
    if (currentState === STATES.INITIAL_SCREEN) {
        initialScreen.style.display = 'none';
        video.style.display = 'block';
        video.muted = false; // Размутируем видео (это важно для того, чтобы браузеры разрешили play())
        startSegment1();
    }
});

// Обработчик кликов по видео (для переходов между паузами и перезапуска в конце)
video.addEventListener('click', () => {
    console.log('Клик по видео. Текущее состояние:', currentState);
    if (currentState === STATES.WAIT_115) {
        startSegment2();
    } else if (currentState === STATES.WAIT_125) {
        startSegment3();
    } else if (currentState === STATES.END) {
        startSegment1(); // Перезапускаем анимацию
    }
});

// Инициализация
// Нет необходимости в loadImages(), так как видеоэлемент сам управляет загрузкой.