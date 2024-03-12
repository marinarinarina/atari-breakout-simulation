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
import { PlayerName, config, totalBlocks } from './setting';
import { createField, type FieldBlock } from './components/Field';
import { createPlayer, type Player } from './components/Player';
import { gameManager } from './gameManager';
import { randomInteger } from './utils';

// 두 플레이어는 초기 점수로 전체 블록 개수의 절반씩 나눠 가진다.
gameManager.initScore({
	left: totalBlocks / 2,
	right: totalBlocks / 2,
});
gameManager.updateScoreUI();

// 유저가 설정한 속력을 플레이어의 속력으로 업데이트 하기 위해서
const speedInputs = document.querySelectorAll<HTMLInputElement>('.js-speed-input');
// canvas에 물리엔진을 적용하기 위해서
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!;
const [width, height] = [canvas.offsetWidth, canvas.offsetHeight];

// 캔버스에 물리엔진을 적용하는 보일러플레이트
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
/*
 ** 게임 내 오브젝트에 물리연산(충돌, 관성, 마찰력, 가속도 등)을 적용하기 위해서 바디를 생성한다.
 ** 여기서는 벽과 플레이어가 충돌하면 플레이어가 반대 방향으로 튕겨나가게 만들기 위해 직사각형 모양의 얇은 벽 바디를 월드에 추가했다.
 ** 바디를 가지는 모든 오브젝트는 월드 위에서 표현된다.
 */
Composite.add(world, [
	Bodies.rectangle(-2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width + 2.5, height / 2, 5, height, { isStatic: true }),
	Bodies.rectangle(width / 2, -2.5, width, 5, { isStatic: true }),
	Bodies.rectangle(width / 2, height + 2.5, width, 5, { isStatic: true }),
]);

// 물체가 서로 충돌했을 때 갱신되어야 할 값을 변경하기 위해 충돌이 끝난 시점에 핸들러 함수를 호출한다.
Events.on(engine, 'collisionEnd', (event) => handleCollisionCaptures(event));

// 플레이어의 크기를 블록 1칸 크기로 설정하기 위해 블록 1개에 해당하는 픽셀사이즈를 구한다.
const blockPxSize = width / config.field.sideLength;
const [minSpeed, maxSpeed] = [0, Math.floor(blockPxSize / 2)];

// 월드에 필드, 왼쪽 플레이어, 오른쪽 플레이어를 생성한다.
const field = createField(world, config.field.sideLength, width / config.field.sideLength);

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

// 충돌 이벤트 발생 시 이벤트 객체가 가지고 있는 바디가 플레이어인지 확인하기 위한 맵
const bodyToPlayer = new Map<Body, Player>([
	[playerLeft.getBody(), playerLeft],
	[playerRight.getBody(), playerRight],
]);

// 유저가 설정한 속력으로 플레이어의 속력과 가속도를 업데이트
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

// 충돌한 플레이어와 블록을 가져와서 해당하는 플레이어의 점수와 블록 상태를 업데이트
function handleCollisionCaptures(event: IEventCollision<Engine>) {
	const playerFieldPairs = getPlayerFieldBlockPairs(event.pairs);
	if (playerFieldPairs.length === 0) return;
	const { player, block } = playerFieldPairs[0];
	const playerName = player.getName();
	gameManager.updateScore(playerName);
	gameManager.updateScoreUI();
	block.capture(player.getName());
}

/*
 ** 충돌 이벤트 발생 시 이벤트 객체에는 충돌한 두 물체에 대한 바디 쌍(bodyA, bodyB)리스트가 들어있다.
 ** 두 바디 쌍이 플레이어와 필드인 것만 필터링한다.
 */
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
