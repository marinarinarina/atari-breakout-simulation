import './style.css';
import {
	Engine,
	Render,
	Runner,
	Composite,
	Bodies,
	Events,
	Vector,
	Body,
	type IEventCollision,
	type Pair,
} from 'matter-js';
import { PlayerName, config } from './setting';
import { createField, type FieldBlock } from './components/Field';
import { createPlayer, type Player } from './components/Player';
import { gameManager } from './gameManager';
import { randomInteger } from './utils';

gameManager.initScore({
	left: config.field.sideLength ** 2 / 2,
	right: config.field.sideLength ** 2 / 2,
});

gameManager.handleScoreUpdate();

const speedInputs = document.querySelectorAll<HTMLInputElement>('.js-speed-input');
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
const field = createField(world, config.field.sideLength, width / config.field.sideLength);

Render.run(render);
Runner.run(runner, engine);
Composite.add(world, [
	Bodies.rectangle(-2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width + 2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width / 2, -2.5, width, 5, { isStatic: true }),
	Bodies.rectangle(width / 2, height + 2.5, width, 5, { isStatic: true }),
]);
Events.on(engine, 'collisionEnd', (event) => handleCollisionCaptures(event));

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

const bodyToPlayer = new Map<Body, Player>([
	[playerLeft.getBody(), playerLeft],
	[playerRight.getBody(), playerRight],
]);

speedInputs.forEach((inputElem) => {
	const playerName = inputElem.dataset.player as PlayerName;
	const player = playerName === 'left' ? playerLeft : playerRight;
	const axis = inputElem.dataset.axis as 'x' | 'y';
	const playerBody = player.getBody();

	inputElem.min = String(minSpeed);
	inputElem.max = String(maxSpeed);
	inputElem.value = String(playerBody.velocity[axis]);

	inputElem.addEventListener('input', () => {
		const speed = Number(inputElem.value);
		const velocity = Vector.clone(playerBody.velocity);
		velocity[axis] = speed;
		Body.setVelocity(playerBody, velocity);
	});
});

function handleCollisionCaptures(event: IEventCollision<Engine>) {
	const playerFieldPairs = getPlayerFieldBlockPairs(event.pairs);
	if (playerFieldPairs.length === 0) return;
	const { player, block } = playerFieldPairs[0];
	const playerName = player.getName();
	if (playerName === 'left') {
		gameManager.updateScore('+LEFT');
		gameManager.updateScore('-RIGHT');
	} else {
		gameManager.updateScore('-LEFT');
		gameManager.updateScore('+RIGHT');
	}
	gameManager.handleScoreUpdate();
	block.capture(player.getName());
}

function getPlayerFieldBlockPairs(pairs: Pair[]) {
	const playerFieldPairs: { player: Player; block: FieldBlock }[] = [];
	pairs.forEach(({ bodyA, bodyB }) => {
		let player: Player | undefined = undefined;
		let block: FieldBlock | undefined = undefined;
		for (const body of [bodyA, bodyB]) {
			if (bodyToPlayer.has(body)) {
				player = bodyToPlayer.get(body)!;
			} else if (field.getBodiesToBlock().has(body)) {
				block = field.getBodiesToBlock().get(body)!;
			}
		}
		if (block && player) {
			playerFieldPairs.push({ player, block });
		}
	});
	return playerFieldPairs;
}
