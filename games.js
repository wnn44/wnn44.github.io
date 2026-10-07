'use strict';

/**
 * Реестр игр NEON ARCADE.
 *
 * Чтобы добавить новую игру:
 *   1. Создай HTML-файл игры (например snake.html)
 *   2. Добавь объект в массив ниже
 *   3. (Опционально) положи превью в previews/  (jpg, png, gif, mp4, webm)
 *
 * preview.type:  'image' | 'video'
 * preview.src:   путь к файлу относительно корня сайта
 */
window.GAMES = [
  {
    id:          'tetris',
    title:       'NEON TETRIS',
    description: 'Классический тетрис с SRS-вращением, T-spin, комбо и неоновой эстетикой.',
    url:         'tetris.html',
    icon:        '🟦',
    color:       '#00f0ff',
    accent:      '#26d9f2',
    tags:        ['аркада', 'классика'],
    preview:     { type: 'image', src: 'previews/tetris.jpg' },
  },
  {
    id:          '2048',
    title:       'NEON 2048',
    description: 'Соединяй числа, достигни 2048 и построй свой неоновый рекорд.',
    url:         '2048.html',
    icon:        '🟪',
    color:       '#a855ff',
    accent:      '#b45cff',
    tags:        ['головоломка'],
    preview:     { type: 'image', src: 'previews/2048.jpg' },
  },
];
