import { handleError } from './utils';

export type Score = { left: number; right: number };

export const gameManager = (function (leftScore: HTMLSpanElement, rightScore: HTMLSpanElement) {
	const _leftScore = leftScore;
	const _rightScore = rightScore;
	let _score: Score;

	const initScore = (score: Score) => {
		_score = score;
	};

	const updateScore = (action: '+LEFT' | '-LEFT' | '+RIGHT' | '-RIGHT') => {
		switch (action) {
			case '+LEFT':
				_score.left += 1;
				break;
			case '-LEFT':
				_score.left -= 1;
				break;
			case '+RIGHT':
				_score.right += 1;
				break;
			case '-RIGHT':
				_score.right -= 1;
				break;
			default: {
				return handleError(action);
			}
		}
	};

	const handleScoreUpdate = () => {
		_leftScore.innerText = String(_score.left);
		_rightScore.innerText = String(_score.right);
	};

	return { initScore, updateScore, handleScoreUpdate };
})(document.querySelector<HTMLSpanElement>('#leftScore')!, document.querySelector<HTMLSpanElement>('#rightScore')!);
