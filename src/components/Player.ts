import { Bodies, Body, World, type Vector } from 'matter-js';
import { config, type PlayerName, COLLISION_CATEGORY } from '../setting';
import { getOpponentName } from '../utils';

export type Player = ReturnType<typeof createPlayer>;

export function createPlayer(world: World, position: Vector, velocity: Vector, size: number, name: PlayerName) {
	let _body: Body;
	let _name = name;

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

	return { getBody, getName };
}
