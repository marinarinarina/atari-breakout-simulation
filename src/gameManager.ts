import { type Score, type PlayerName } from './setting';

/*
 ** 게임매니저는 게임 시작과 동시에 점수를 기록하고 ui를 업데이트한다.
 ** 게임 시작과 동시에 딱 한 번만 실행되기 때문에 모듈 패턴을 사용했다.
 */
export const gameManager = (function (leftScore: HTMLSpanElement, rightScore: HTMLSpanElement) {
	const _leftScore = leftScore;
	const _rightScore = rightScore;
	let _score: Score;

	const initScore = (score: Score) => {
		_score = score;
	};

	const updateScore = (winner: PlayerName) => {
		if (winner === 'left') {
			_score.left += 1;
			_score.right -= 1;
		} else if (winner === 'right') {
			_score.right += 1;
			_score.left -= 1;
		}
	};

	const updateScoreUI = () => {
		_leftScore.innerText = String(_score.left);
		_rightScore.innerText = String(_score.right);
	};

	return Object.freeze({ initScore, updateScore, updateScoreUI });
})(document.querySelector<HTMLSpanElement>('#leftScore')!, document.querySelector<HTMLSpanElement>('#rightScore')!);
