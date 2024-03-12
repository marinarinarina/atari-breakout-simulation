export const config = {
	field: {
		sideLength: 16,
	},
	colors: {
		left: '#F8AB2B',
		right: '#4D428B',
	} satisfies Record<PlayerName, string>,
} as const;
export const playerNames = ['left', 'right'] as const;
/*
 ** 충돌판정에 필요한 충돌 카테고리를 설정
 ** 게임 내 충돌판정 로직에 대한 자세한 내용은 리드미 참고
 */
export const COLLISION_CATEGORY = { wall: 0x0001, left: 0x0002, right: 0x0004 } as const;
export const totalBlocks = config.field.sideLength ** 2;

export type PlayerName = (typeof playerNames)[number];
export type Color = (typeof config)['colors'][PlayerName];
export type Score = Record<PlayerName, number>;
