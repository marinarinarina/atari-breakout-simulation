import { Bodies, Body, World, type Vector } from 'matter-js';
import { config, COLLISION_CATEGORY, type PlayerName } from '../setting';
import { getOpponentName } from '../utils';

export type Player = ReturnType<typeof createPlayer>;

/*
 ** 게임 월드에 플레이어를 생성한다.
 ** 상대편 블록과 플레이어가 충돌했을 때 그 플레이어의 이름을 가져와서 점수를 업데이트 하기위해
 ** 충돌한 플레이어의 이름을 가져오는 함수를 반환한다.
 ** (플레이어-벽, 플레이어-플레이어가 충돌했을 때는 기본적인 충돌처리만 적용한다.)
 */
export function createPlayer(world: World, position: Vector, velocity: Vector, size: number, name: PlayerName) {
	let _body: Body;
	let _name = name;

	// 물체와 닿으면 반대방향으로 튕겨나가는 기본적인 충돌 처리를 위해 inertia와 restitution에 기본값을 준다.
	_body = Bodies.rectangle(position.x + size / 2, position.y + size / 2, size, size, {
		frictionAir: 0,
		frictionStatic: 0,
		friction: 0,
		inertia: Infinity,
		restitution: 1,
		collisionFilter: { mask: COLLISION_CATEGORY[getOpponentName(_name)] | COLLISION_CATEGORY.wall },
		render: { fillStyle: config.colors[_name] },
	});
	Body.setVelocity(_body, velocity);
	World.add(world, _body);

	const getBody = () => _body;
	const getName = () => _name;

	return Object.freeze({
		getBody,
		getName,
	});
}
