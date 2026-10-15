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
    id:          'kant-3d',
    title:       'KANT',
    description: 'Старая, забытая всеми игра.',
    url:         'kant/kant.html',
    icon:        '🟦',
    color:       '#00f0ff',
    accent:      '#26d9f2',
    tags:        ['логическая'],
    preview:     { type: 'video', src: 'previews/kant.mp4' },
  },
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
	  id:          'pheenix',
	  title:       'NEON PHEENIX',
	  description: 'Классический фиксированный шутер: уничтожьте пять волн космических птиц и материнский корабль.',
	  url:         'pheenix.html',
	  icon:        '🔥',
	  color:       '#00f0ff',
	  tags:        ['shooter', 'arcade', 'retro', 'fixed'],
	  preview:     { type: 'video', src: 'previews/pheenix.mp4' }
  },
  {
    id:          'neon-match3',
	title:       'NEON MATCH-3',
	description: 'Классическая головоломка «три в ряд» с неоновыми шариками, каскадными комбо и киберпанк-эстетикой.',
	url:         'neon-match3.html',
	icon:        '🔮',
	color:       '#00f0ff',
	tags:        ['головоломка', 'три-в-ряд'],
	preview:     { type: 'video', src: 'previews/neon-match3.mp4' }
  },
  {
    id:          'bubble_strike',
    title:       'NEON BUBBLE STRIKE',
    description: 'Классический шутер шариков: сбивай группы из 3+ одинаковых неоновых пузырей, чтобы очистить поле.',
    url:         'bubble_strike.html',
    icon:        '🫧',
    color:       '#00f0ff',
    tags:        ['аркада', 'классика'],
    preview:     { type: 'video', src: 'previews/bubble_strike.mp4' }
  },
  {
	id:          'neon-shooter',
	title:       'NEON SHOOTER',
	description: 'Неоновый тир — сбивайте светящиеся шары, собирайте серии и устанавливайте мировые рекорды!',
	url:         'neon-shooter.html',
	icon:        '🎯',
	color:       '#00f0ff',
	tags:        ['шутер', 'аркада'],
	preview:     { type: 'video', src: 'previews/neon-shooter.mp4' }
  },
  {
	id:          'ether-blocks',
	title:       'NEON ETHER BLOCKS',
	description: 'Тетрис нового поколения с фазой перекладывания, комбо-системой и неоновой эстетикой',
	url:         'ether-blocks.html',
	icon:        '🧊',	
	color:       '#00f0ff',
	tags:        ['puzzle', 'arcade', 'tetris'],
	preview:     { type: 'video', src: 'previews/ether-blocks.mp4' }
  },
  {
    id:          'neon-lines',
	title:       'NEON LINES',
	description: 'Классическая головоломка «пять в ряд» с неоновыми шариками.',
	url:         'neon-lines.html',
	icon:        '🔮',
	color:       '#00f0ff',
	tags:        ['головоломка', 'пять-в-ряд'],
	preview:     { type: 'video', src: 'previews/neon-lines.mp4' }
  },
  {
	id:          'gravity-breaker',
	title:       'ГРАВИТОН',
	description: 'Собери сумму очков до окончания выстрелов, не дай слоям кирпичей пересечь красную линию — гравитация в помощь.',
	url:         'gravity-breaker.html',
	icon:        '💥',
	color:       '#00f0ff',
	tags:        ['аркада', 'физика', 'головоломка'],
	preview:     { type: 'video', src: 'previews/gravity-breaker.mp4' }
 },
];
