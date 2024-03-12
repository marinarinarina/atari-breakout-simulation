import { Bodies, type Body, World, Vector } from 'matter-js';
import { config, COLLISION_CATEGORY, type PlayerName } from '../setting';
import { getOpponentName } from '../utils';

export type FieldBlock = ReturnType<typeof _generateFieldBlock>;

/*
 ** 블록들을 생성해서 게임 필드를 만든다.
 ** 게임 시작 시 필드의 왼쪽 부분에 해당하는 블록은 왼쪽 플레이어가 소유하고 있고,
 ** 오른쪽 부분에 해당하는 블록은 오른쪽 플레이어가 소유하고 있다.
 ** 충돌 이벤트 발생 시 이벤트 객체에는 충돌한 두 물체에 대한 바디 정보가 들어있는데,
 ** 필드에 존재하는 수많은 블록 중 충돌이 발생한 블록을 찾기위해
 ** 필드 생성시 필드에 존재하는 모든 바디와 블록 정보를 맵에 저장한다.
 */
export function createField(world: World, sideLength: number, blockSize: number) {
	const _bodiesToBlock = new Map<Body, FieldBlock>();
	const getBodiesToBlock = () => _bodiesToBlock;

	Array.from({ length: sideLength }, (_, col) =>
		Array.from({ length: sideLength }, (_, row) => {
			const owner = col < sideLength / 2 ? 'left' : 'right';
			const position = Vector.create(col * blockSize + blockSize / 2, row * blockSize + blockSize / 2);
			const block = _generateFieldBlock(world, position, owner, blockSize);
			_bodiesToBlock.set(block.getBody(), block);

			return block;
		})
	);

	return Object.freeze({ getBodiesToBlock });
}

/*
 ** 실제 게임 월드에 블록을 생성한다.
 ** capture(): 충돌 처리 시 해당 블록의 소유자, 색상, 충돌 카테고리를 바꾼다.
 */
function _generateFieldBlock(world: World, position: Vector, owner: PlayerName, size: number) {
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

	return Object.freeze({ getBody, getOwner, capture });
}
