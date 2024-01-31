import './style.css';
import { Engine, Render, Runner, Composite, Bodies } from 'matter-js';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const [width, height] = [canvas.offsetWidth, canvas.offsetHeight];

const engine = Engine.create();
engine.gravity.y = 0;
const world = engine.world;
const runner = Runner.create({ isFixed: true });
const render = Render.create({
	engine,
	canvas,
	options: {
		width: canvas.offsetWidth,
		height: canvas.offsetHeight,
		wireframes: false,
	},
});

Render.run(render);

Runner.run(runner, engine);

Composite.add(world, [
	Bodies.rectangle(-2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width + 2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width / 2, -2.5, width, 5, { isStatic: true }),
	Bodies.rectangle(width / 2, height + 2.5, width, 5, { isStatic: true }),
]);
