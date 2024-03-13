# [atari-breakout-simulation](https://marinarinarina.github.io/atari-breakout-simulation/)

[canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)와 [Matter.js](https://github.com/liabru/matter-js)를 활용한 2인용 벽돌깨기 게임 시뮬레이션


## 기획

### 만들게 된 계기
![image](https://github.com/marinarinarina/atari-breakout-simulation/assets/119808319/7cec8fa1-9ab9-4cd8-ac82-a95493f8fa81)

레딧에서 어떤 유저가 자기 회사의 클라이언트가 위처럼 생긴 2인용 벽돌깨기 시뮬레이션을 만들어달라고 요청했는데

도대체 어떻게 만들어야 할지 모르겠다는 글이 올라왔다.

댓글을 읽어보니 캔버스 API와 물리엔진 라이브러리를 사용하라는 소리가 대부분이었다.

이 글을 읽었을 당시 나는 불과 몇 일 전까지 캔버스 API를 공부하기위해 간단한 [공튀기기 인터랙션](https://github.com/marinarinarina/canvasAPI-bounceBall)을 만들고 있었고

이제는 좀 더 복잡한 걸 만들어보고 싶었기에 저걸 똑같이 만들어보았다.


### 주요 동작 
플레이어는 자신들의 영역 내에서 자유롭게 움직일 수 있으며 상대 편 블록과 충돌하면 그 블록은 자신의 영역이 되고 점수를 1점 추가한다.

플레이어가 물체와 충돌했을 때의 상황은 4가지로 생각해볼 수 있다:
1. 플레이어가 게임 벽과 충돌했을 때
2. 플레이어와 플레이어가 충돌했을 때
3. 본인의 영역과 충돌했을 때
4. 상대의 영역과 충돌했을 때

3번 케이스는 신경쓰지 않아도 된다. 

1번과 2번 케이스인 경우 플레이어는 반대 방향으로 튕겨나가기만 하면 된다.

4번 케이스는 같은 색깔의 블록과 충돌했을 때와 같은 상황이다.

이때는 (1)반대 방향으로 튕겨나가고, (2) 충돌한 블록의 색상을 바꾸고, (3) 그 블록의 영역 정보를 바꾸고, (4) 플레이어의 점수값과 점수 표시 UI를 갱신해야 한다.

[]()

예를 들어 위처럼 왼쪽 플레이어가 오른쪽 영역에 해당하는 블록과 충돌했다면

블록의 색깔을 보라색으로 바꾸고, 그 블록의 영역 정보를 right에서 left로 바꾸고, 왼쪽 플레이어의 점수에 1을 더하고 오른쪽 플레이어의 점수에 1을 뺀다.

초기 점수는 양 측이 가지고 있는 블록의 개수이다. 예를 들어 영역을 구성하는 블록의 총 개수가 256개라면 왼쪽 플레이어와 오른쪽 플레이어의 초기 점수는 각각 128이다.


### 프로젝트 구조

[]()

프로젝트 구조를 설계하기 위해 먼저 객체 다이어그램을 그려봤다. 기획 단계에서 그린 거라서 실제 코드와는 약간 차이가 있지만, 큰 그림은 똑같다.

게임 내에 존재하는 물체는 움직이는 플레이어와, 플레이어가 움직이는 영역인 Field와 그 필드를 이루고 있는 가장 작은 단위인 FieldBlock으로 이루어져 있다.

그리고 게임월드(가장 상위 파일, main)에서 실제로 왼쪽 플레이어, 오른쪽 플레이어, 필드 오브젝트를 만들고 어떤 오브젝트가 서로 충돌했는지를 비교하고 해당하는 오브젝트의 값을 업데이트한다.

GameManager는 게임 시작과 동시에 점수를 기록하고 ui를 업데이트한다. 게임 외부(캔버스 바깥)에 존재하고, 게임 시작과 동시에 딱 한 번만 실행되기 때문에 모듈 패턴을 사용하였다.


### 사용 기술
- typescript(5.2.2)
- vite(5.0.8)
- matter-js(0.19.0)
- gh-pages(6.1.1)

matter.js는 자바스크립트용 웹 2D 물리엔진이다. 충돌 처리와 리지드바디는 물론 다양한 예제 코드까지 있었고

7년 전에 만들어졌지만 최근까지 업데이트를 한 걸로 봤을 때 게임 시뮬레이션을 위한 도구로 적합하다고 판단했다.

깃허브 페이지는 깃허브 액션으로 배포 자동화를 하기 위해 사용했다. 

vite에 [깃허브 액션을 사용해 정적 페이지를 배포하는 방법](https://vitejs.dev/guide/static-deploy#github-pages)이 있어서 매우 간단하게 설정했고

메인브랜치로 풀만 하면 배포가 자동으로 완료되니 앞으로도 배포할 때 깃허브 액션을 사용해야겠다.


## 개발

개발을 하면서 오브젝트 충돌 판정을 어떻게 구분하고 처리할지 고민을 많이 했다.

위에서 말한대로 충돌케이스 1,2번과 플레이어가 상대편 블록을 쳤을 때만 충돌처리를 해야 하는데 

Matter.js에서는 어떤 물체와의 충돌은 무시하고, 어떤 물체와의 충돌은 충돌 처리를 할 건지는 [Matter.Body의 collisionFilter](https://brm.io/matter-js/docs/classes/Body.html#properties) 안에 충돌 속성을 지정하면 된다고 한다.

충돌 속성값으로는 1~2^31 사이에 해당하는 비트필드를 넣어야 한다.

그래서 아래처럼 충돌판정에 필요한 충돌 카테고리를 지정하고,
```
// setting.ts
export const COLLISION_CATEGORY = { wall: 0x0001, left: 0x0002, right: 0x0004 } as const;
```

필드블록이 가지고 있는 충돌 카테고리를 왼쪽 영역 블록이면 'left'로, 오른쪽 영역 블록이면 'right'로 지정하기 위해

바디의 collisionFilter.category에 충돌 속성을 지정한다.
```
// components/Field.ts
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
  ...
}
```

플레이어는 상대편 필드블록, 벽, 상대 플레이어와 충돌해야 하기 때문에 collisionFilter.mask에 충돌하려는 카테고리를 지정한다.

(마스크를 지정하지 않으면 모든 바디와 추가한다. 필드블록은 움직이지 않기 때문에 마스크를 지정하지 않았다.)
```
// components/Player.ts
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
	...
}
```

이렇게 하면 플레이어 바디가 벽 바디, 상대편 필드블록 바디, 상대 플레이어 바디와 충돌했을 때만 충돌처리가 실행된다.

나는 여기서 한 가지 의문이 들었다. 왜 속성값으로 비트를 사용하고 마스크에 비트와이즈 연산을 하는지, 그래서 어떻게 충돌이 필터링 되는지...

그 이유는 Matter.js는 수많은 충돌 속성에 대한 정보를 표현하기 위해 비트마스크 알고리즘을 사용하기 때문이다.

물리엔진이라는 특성 상 엄청나게 많은 연산을 처리해야 하기 때문에 충돌 필터링에는 비트마스크를 써서 비용을 줄인 것 같았다. 

그렇다면 실제로는 어떻게 동작할까? 충돌 카테고리를 지정했을 때 맨 처음 상태는 아래와 같을 것이다.

[]()

왼쪽 플레이어는 `mask: right에 해당하는 카테고리 필터 속성 | wall에 해당하는 카테고리 필터 속성`을 가지므로 

100(0x0004)와 001(0x0001)에 비트와이즈 OR 연산을 수행하면 101이 된다. 

101은 4 + 0 + 1 으로 표현할 수 있고 이건 각각 right와 wall이다. 이런 식으로 비트 하나로 속성 정보를 알 수 있다.

그리고 만약 왼쪽 플레이어와 오른쪽 플레이어의 영역에 해당하는 블록이 충돌했다면,

왼쪽 플레이어 비트마스크 결과인 101과 오른쪽 플레이어 영역 카테고리 100에 대하여 AND 비트와이즈 연산을 수행하고 

각 자릿수가 1이면 여기에 해당하는 카테고리에 충돌이 발생했다는 것을 알 수 있다.

즉 101 & 100 = 100이고, 100 = 4 + 0 + 0으로 표현되는데 4는 right라서 왼쪽 플레이어는 오른쪽 영역 블록과 충돌했다고 알아낼 수 있는 것이다.

[]()


## 개발 후기

1. 다이어그램으로 전체적인 구조를 먼저 그려보고 나서 코딩을 하니까 코드 앞에서 멍때리는 시간이 줄어들었다.

2. 알고리즘을 공부했을 때 배웠던 비트마스크를 내가 쓰고 있는 라이브러리에서 다시 보게 되니 반가웠다.

3. Matter.js로 인터랙션이 많은 이벤트성 페이지를 만들면 재미있을 것 같다.



