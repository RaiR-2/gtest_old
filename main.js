// main.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const initialScreen = document.getElementById('initialScreen');
const startButton = document.getElementById('startButton');

// Пути к директориям с ресурсами относительно `index.html`
const FRAMES_DIR = 'frames/';
const SOUNDS_DIR = 'sounds/';

const FRAME_RATE = 25; // Частота кадров из you_gay.xml
const MS_PER_FRAME = 1000 / FRAME_RATE;

let currentFrame = 1;
const totalFrames = 645;

const frames = [];
let imagesLoaded = 0;
let animationId = null;
let lastFrameTime = 0;
let isPlaying = false;

// Состояния анимации
const STATES = {
    INITIAL_SCREEN: 'initialScreen', // Начальный экран, ожидание клика на кнопку
    LOADING: 'loading',              // Загрузка ресурсов
    SEGMENT_1: 'segment1',           // Кадры 1-115, звук 27.mp3
    WAIT_115: 'wait115',             // Ожидание клика на кадре 115, звук 27.mp3
    SEGMENT_2: 'segment2',           // Кадры 116-125, звук 73.mp3
    WAIT_125: 'wait125',             // Ожидание клика на кадре 125, звук 73.mp3
    SEGMENT_3: 'segment3',           // Кадры 126-645, звук 75.mp3
    END: 'end'                       // Конец на кадре 645, ожидание клика для перезапуска
};
let currentState = STATES.INITIAL_SCREEN;

// Объекты Audio для звуков
const sounds = {
    '27': new Audio(SOUNDS_DIR + '27.mp3'),
    '73': new Audio(SOUNDS_DIR + '73.mp3'),
    '75': new Audio(SOUNDS_DIR + '75.mp3')
};

// Настраиваем зацикливание для фонового звука (73.mp3), хотя будем управлять вручную
if (sounds['73']) {
    sounds['73'].loop = true;
}

// Убедимся, что canvas изначально скрыт, пока не начнется анимация
canvas.style.display = 'none';

// Функция для предварительной загрузки всех изображений кадров
function loadImages() {
    currentState = STATES.LOADING;
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        img.src = FRAMES_DIR + i + '.png';
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalFrames) {
                console.log('Все кадры загружены!');
                if (frames[0]) {
                    canvas.width = frames[0].width;
                    canvas.height = frames[0].height;
                    drawFrame(); // Отображаем первый кадр на скрытом канвасе
                }
                // Переходим в состояние INITIAL_SCREEN, если уже не там
                if (currentState === STATES.LOADING) {
                    currentState = STATES.INITIAL_SCREEN;
                    console.log('Готово к запуску. Нажмите кнопку.');
                }
            }
        };
        frames.push(img);
    }
}

// Функция для отрисовки текущего кадра на холсте
function drawFrame() {
    if (frames[currentFrame - 1]) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frames[currentFrame - 1], 0, 0, canvas.width, canvas.height);
    }
}

// Основной цикл анимации
function animate(timestamp) {
    if (!isPlaying) {
        return;
    }

    if (!lastFrameTime) {
        lastFrameTime = timestamp;
    }

    const elapsed = timestamp - lastFrameTime;

    if (elapsed >= MS_PER_FRAME) {
        currentFrame++;

        // Логика перехода между сегментами
        if (currentState === STATES.SEGMENT_1 && currentFrame > 115) {
            currentFrame = 115;
            currentState = STATES.WAIT_115;
            stopAnimation(); // Останавливаем анимацию
            console.log('Пауза на кадре 115. Ожидание клика.');
            // Звук 27.mp3 должен продолжать играть в WAIT_115
        } else if (currentState === STATES.SEGMENT_2 && currentFrame > 125) {
            currentFrame = 125;
            currentState = STATES.WAIT_125;
            stopAnimation(); // Останавливаем анимацию
            console.log('Пауза на кадре 125. Ожидание клика.');
            // Звук 73.mp3 должен продолжать играть в WAIT_125
        } else if (currentState === STATES.SEGMENT_3 && currentFrame > totalFrames) {
            currentFrame = totalFrames;
            currentState = STATES.END;
            stopAnimation(); // Останавливаем анимацию
            // Звук 75.mp3 НЕ останавливаем, он должен доиграть.
            console.log('Анимация завершена. Звук 75.mp3 доигрывает. Кликните, чтобы повторить.');
        }

        drawFrame();
        lastFrameTime = timestamp - (elapsed % MS_PER_FRAME);
    }

    if (isPlaying) {
        animationId = requestAnimationFrame(animate);
    }
}

// Функции управления анимацией
function playAnimation() {
    if (!isPlaying) {
        isPlaying = true;
        animationId = requestAnimationFrame(animate);
    }
}

function stopAnimation() {
    isPlaying = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function stopAllSounds() {
    for (const key in sounds) {
        if (sounds.hasOwnProperty(key)) {
            sounds[key].pause();
            sounds[key].currentTime = 0;
        }
    }
}

// Функции для запуска сегментов
function startSegment1() {
    currentState = STATES.SEGMENT_1;
    currentFrame = 1;
    stopAllSounds(); // Останавливаем все, что могло играть (включая 75.mp3, если он еще играл)
    sounds['27'].play().catch(e => console.log("Ошибка воспроизведения звука 27:", e));
    playAnimation();
    console.log('Начинается сегмент 1 (кадры 1-115) со звуком 27.mp3');
}

function startSegment2() {
    currentState = STATES.SEGMENT_2;
    currentFrame = 116; // Начинаем с 116 кадра
    stopAllSounds(); // Останавливаем 27.mp3
    sounds['73'].play().catch(e => console.log("Ошибка воспроизведения звука 73:", e));
    playAnimation();
    console.log('Начинается сегмент 2 (кадры 116-125) со звуком 73.mp3');
}

function startSegment3() {
    currentState = STATES.SEGMENT_3;
    currentFrame = 126; // Начинаем с 126 кадра
    stopAllSounds(); // Останавливаем 73.mp3
    sounds['75'].play().catch(e => console.log("Ошибка воспроизведения звука 75:", e));
    playAnimation();
    console.log('Начинается сегмент 3 (кадры 126-645) со звуком 75.mp3');
}

// Обработчик клика по кнопке "Начать"
startButton.addEventListener('click', () => {
    if (currentState === STATES.INITIAL_SCREEN) {
        initialScreen.style.display = 'none'; // Скрываем начальный экран
        canvas.style.display = 'block'; // Показываем канвас
        startSegment1(); // Запускаем первый сегмент
    }
});

// Обработчик кликов по холсту (для переходов между паузами и перезапуска в конце)
canvas.addEventListener('click', () => {
    if (currentState === STATES.WAIT_115) {
        startSegment2();
    } else if (currentState === STATES.WAIT_125) {
        startSegment3();
    } else if (currentState === STATES.END) {
        startSegment1(); // Перезапускаем анимацию
    }
});

// Инициализация: загрузка изображений
loadImages();