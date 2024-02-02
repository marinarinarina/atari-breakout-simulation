import { Bodies, type Body, World, Vector } from 'matter-js';
import { config, COLLISION_CATEGORY, type PlayerName } from '../setting';
import { getOpponentName } from '../utils';

export type FieldBlock = ReturnType<typeof generateFieldBlock>;

export function createField(world: World, sideLength: number, blockSize: number) {
	const _bodiesToBlock = new Map<Body, FieldBlock>();
	const getBodiesToBlock = () => _bodiesToBlock;

	Array.from({ length: sideLength }, (_, col) =>
		Array.from({ length: sideLength }, (_, row) => {
			const owner = col < sideLength / 2 ? 'left' : 'right';
			const position = Vector.create(col * blockSize + blockSize / 2, row * blockSize + blockSize / 2);
			const block = generateFieldBlock(world, position, owner, blockSize);
			_bodiesToBlock.set(block.getBody(), block);

			return block;
		})
	);

	return { getBodiesToBlock };
}

function generateFieldBlock(world: World, position: Vector, owner: PlayerName, size: number) {
	let _owner = owner;
	let _body: Body;

	_body = Bodies.rectangle(position.x, position.y, size + 1, size + 1, {
		isStatic: true,
		collisionFilter: { category: COLLISION_CATEGORY[_owner] },
		render: {
			fillStyle: config.colors[getOpponentName(_owner)],
		},
	});

	World.add(world, _body);

	const getBody = () => _body;
	const getOwner = () => _owner;
	const capture = (newOwner: PlayerName) => {
		_owner = newOwner;
		_body.render.fillStyle = config.colors[getOpponentName(newOwner)];
		_body.collisionFilter.category = COLLISION_CATEGORY[newOwner];
	};

	return { getBody, getOwner, capture };
}
