import './style.css';
import { Engine, Render, Runner, Composite, Bodies, Events, Vector, Body, type IEventCollision } from 'matter-js';
import { createField, type FieldBlock } from './components/Field';
import { createPlayer } from './components/Player';
import { config, playerNames, type PlayerName } from './setting';
import { randomInteger } from './utils';

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

const field = createField(world, config.field.sideLength, width / config.field.sideLength);

Events.on(engine, 'collisionEnd', (event) => handleCollisionCaptures(event));

Composite.add(world, [
	Bodies.rectangle(-2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width + 2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width / 2, -2.5, width, 5, { isStatic: true }),
	Bodies.rectangle(width / 2, height + 2.5, width, 5, { isStatic: true }),
]);

const blockPxSize = width / config.field.sideLength;
const [minSpeed, maxSpeed] = [0, Math.floor(blockPxSize / 2)];

const playerLeft = createPlayer(
	world,
	Vector.create(blockPxSize, randomInteger(blockPxSize, height - blockPxSize * 3)),
	Vector.create(randomInteger(maxSpeed / 4, maxSpeed / 3), randomInteger(maxSpeed / 4, maxSpeed / 3)),
	blockPxSize,
	'left'
);

const playerRight = createPlayer(
	world,
	Vector.create(width - blockPxSize * 3, randomInteger(blockPxSize, height - blockPxSize * 3)),
	Vector.create(randomInteger(maxSpeed / 4, maxSpeed / 3), randomInteger(maxSpeed / 4, maxSpeed / 3)),
	blockPxSize,
	'right'
);

function handleCollisionCaptures(event: IEventCollision<Engine>) {
	console.log(event.pairs);
}
