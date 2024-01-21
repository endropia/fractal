// Получаем элемент canvas и его контекст для рисования
const canvas = document.getElementById('mandelbrotCanvas');
const ctx = canvas.getContext('2d');

// Функция для отрисовки фрактала Мандельброта
function drawMandelbrot() {
    // Получаем значения параметров из формы
    const realStart = parseFloat(document.getElementById('realStart').value);
    const realEnd = parseFloat(document.getElementById('realEnd').value);
    const imagStart = parseFloat(document.getElementById('imagStart').value);
    const imagEnd = parseFloat(document.getElementById('imagEnd').value);
    const maxIter = parseInt(document.getElementById('maxIter').value);
    const centerColor = hexToRgb(document.getElementById('centerColor').value);

    // Очищаем холст перед каждой отрисовкой
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Проходим по каждому пикселю на холсте
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Вычисляем соответствующие значения в комплексной плоскости
            const real = realStart + (x / canvas.width) * (realEnd - realStart);
            const imag = imagStart + (y / canvas.height) * (imagEnd - imagStart);

            let zx = real;
            let zy = imag;
            let iter = 0;

            // Итеративно проверяем, принадлежит ли точка множеству Мандельброта
            while (iter < maxIter) {
                const zx2 = zx * zx;
                const zy2 = zy * zy;

                if (zx2 + zy2 > 4) {
                    break;
                }

                // Обновляем координаты для следующей итерации
                const nextZx = zx2 - zy2 + real;
                const nextZy = 2 * zx * zy + imag;

                zx = nextZx;
                zy = nextZy;
                iter++;
            }

            // Вычисляем индекс пикселя на холсте
            const pixelIndex = (y * canvas.width + x) * 4;

            // Если точка осталась в пределах множества Мандельброта, присваиваем цвет центра
            if (iter === maxIter) {
                ctx.fillStyle = `rgb(${centerColor.r}, ${centerColor.g}, ${centerColor.b})`;
                ctx.fillRect(x, y, 1, 1);
            } else {
                // Если точка ушла в бесконечность, используем цвет из цветной палитры зависящий от centerColor
                const color = getColor(iter, maxIter, centerColor);
                ctx.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

// Функция для скачивания изображения
function downloadImage() {
    const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const link = document.createElement('a');
    link.href = image;
    link.download = 'mandelbrot_fractal.png';
    link.click();
}

// Функция для получения цвета в зависимости от числа итераций и centerColor
function getColor(iter, maxIter, centerColor) {
    const hue = (iter / maxIter) * 360;
    const rgb = hslToRgb(hue / 360, 1, 0.5);
    
    // Применяем цвет центра как базовый
    const baseColor = {
        r: centerColor.r / 255,
        g: centerColor.g / 255,
        b: centerColor.b / 255
    };

    // Комбинируем базовый цвет с цветом из цветной палитры
    const finalColor = {
        r: Math.round(baseColor.r * rgb[0]),
        g: Math.round(baseColor.g * rgb[1]),
        b: Math.round(baseColor.b * rgb[2])
    };

    return finalColor;
}

// Функция для преобразования HSL-цвета в RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Функция для преобразования HEX-цвета в объект RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}
