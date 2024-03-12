import { type PlayerName } from './setting';

function getOpponentName(name: PlayerName): PlayerName {
	return name === 'left' ? 'right' : 'left';
}

function randomInteger(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { getOpponentName, randomInteger };
