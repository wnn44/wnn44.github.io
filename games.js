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
    preview:     { type: 'video', src: 'previews/tetris.mp4' },
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
    preview:     { type: 'video', src: 'previews/2048.mp4' },
  },
  {
    id:          'neon-match3',
	title:       'NEON MATCH-3',
	description: 'Классическая головоломка «три в ряд» с неоновыми шариками, каскадными комбо и киберпанк-эстетикой.',
	url:         'neon-match3.html',
	icon:        '🔮',
	color:       '#00f0ff',
	tags:        ['головоломка', 'три-в-ряд'],
	preview:     { type: 'image', src: 'previews/neon-match3.mp4' }
  },

];
