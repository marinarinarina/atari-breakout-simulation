import { type PlayerName } from './setting';

function getOpponentName(name: PlayerName): PlayerName {
	return name === 'left' ? 'right' : 'left';
}

function randomInteger(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleError(value: never) {
	throw new Error('An error has occurred: ' + value);
}

export { getOpponentName, randomInteger, handleError };
