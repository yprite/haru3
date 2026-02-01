# 테스트 가이드

## 테스트 통계

```
Test Suites: 7 passed
Tests:       113 passed
Time:        ~1s
```

## 테스트 실행 방법

```bash
# 전체 테스트
npm test

# Watch 모드 (변경 감지)
npm run test:watch

# 특정 파일만
npm test ReviewScreen

# 커버리지 리포트
npm run test:coverage
```

---

## 테스트 커버리지

### 100% 커버리지
- ✅ `src/utils/srs.ts` - SRS 로직
- ✅ `src/utils/date.ts` - 날짜 유틸리티
- ✅ `src/components/brain-science/*` - 뇌과학 컴포넌트

### 화면 테스트
- ✅ `app/(tabs)/review.tsx` - 복습 화면

---

## 회귀 테스트 (Regression Tests)

### 복습 화면 버그 방지

**문제:** reviewQueue가 비었는데도 "복습 대기" 상태가 계속 표시됨

**테스트 커버리지:**
```typescript
// ✅ 테스트 1: 빈 큐일 때
it('does NOT show "복습 대기" title', () => {
  // reviewQueue: []
  expect(screen.queryByText('복습 대기')).toBeNull();
});

// ✅ 테스트 2: 큐에 항목이 있을 때
it('does NOT show "복습 완료!" message', () => {
  // reviewQueue: ['sentence-1', 'sentence-2']
  expect(screen.queryByText('복습 완료!')).toBeNull();
});

// ✅ 테스트 3: 상태 전환
it('should update from has items to empty when all reviews completed', () => {
  // reviewQueue: ['sentence-1'] → []
  expect(screen.getByText('복습 완료!')).toBeTruthy();
});
```

**잡아내는 버그:**
- ✅ reviewQueue가 비었는데 "복습 대기" 표시
- ✅ 항목이 있는데 "복습 완료!" 표시
- ✅ 상태 전환 시 UI 미업데이트

---

## 유닛 테스트 (Unit Tests)

### SRS 로직 (41 tests)

**테스트 범위:**
- ✅ `updateSRSStage()` - 모든 단계 전환 (20 tests)
- ✅ `calculateNextReview()` - 다음 복습 날짜 계산 (3 tests)
- ✅ `isDueForReview()` - 복습 만료 확인 (4 tests)
- ✅ `getDaysUntilReview()` - 남은 일수 계산 (4 tests)
- ✅ `getStageLabel()` - 단계 라벨 (5 tests)
- ✅ `getStageColor()` - 단계 색상 (5 tests)

**잡아내는 버그:**
```typescript
// ✅ forgot는 항상 stage 0으로 초기화
updateSRSStage(3, 'forgot') === 0

// ✅ hard는 1 감소 (최소 0)
updateSRSStage(0, 'hard') === 0

// ✅ good는 1 증가 (최대 4)
updateSRSStage(4, 'good') === 4

// ✅ easy는 2 증가 (최대 4)
updateSRSStage(3, 'easy') === 4
```

### 날짜 유틸리티 (18 tests)

**테스트 범위:**
- ✅ `formatDate()` - 한국어 날짜 형식
- ✅ `addDays()` - 날짜 더하기/빼기
- ✅ `daysBetween()` - 날짜 차이 계산
- ✅ `isToday()` - 오늘 날짜 확인

**잡아내는 버그:**
```typescript
// ✅ 월 경계 처리
addDays('2026-02-28', 1) === '2026-03-01'

// ✅ 절대값 계산
daysBetween('2026-02-01', '2026-01-31') === 1
daysBetween('2026-01-31', '2026-02-01') === 1
```

---

## 컴포넌트 테스트 (Component Tests)

### DailyGoalTracker (9 tests)

**잡아내는 버그:**
- ✅ 목표 3/3 완료 시 축하 메시지 표시
- ✅ 남은 문장 수 정확히 계산
- ✅ 커스텀 목표 (3, 5, 10) 지원

### SRSProgressVisual (12 tests)

**잡아내는 버그:**
- ✅ 현재 단계 정확히 표시
- ✅ 5단계 라벨 정확성
- ✅ showLabels prop 동작

### BrainScienceBanner (11 tests)

**잡아내는 버그:**
- ✅ 4가지 타입 (spacing, chunking, testing, forgetting) 렌더링
- ✅ 접기/펼치기 토글 동작
- ✅ collapsed prop 초기 상태

### ForgettingCurveCard (9 tests)

**잡아내는 버그:**
- ✅ 기억률 계산 (최소 20%, 최대 95%)
- ✅ reviewCount > 0일 때만 힌트 표시
- ✅ 막대 그래프 라벨 정확성

---

## E2E 테스트 (Maestro)

### 설정

```bash
# Maestro 설치
brew install maestro

# E2E 테스트 실행
npm run e2e
```

### 테스트 플로우

| 플로우 | 파일 | 테스트 내용 |
|--------|------|-------------|
| 홈 화면 | `home-screen.yaml` | 타이틀, 목표 트래커, 통계 |
| 네비게이션 | `navigation.yaml` | 탭 전환, 뒤로가기 |
| 통계 화면 | `stats-screen.yaml` | 캘린더, 인사이트 |
| 복습 화면 | `review-screen.yaml` | 빈 상태 / 대기 상태 |
| 학습 플로우 | `learning-flow.yaml` | 전체 학습 프로세스 |

---

## CI/CD 통합

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:ci
```

---

## 테스트 작성 가이드

### 새 컴포넌트 테스트

```typescript
import { render, screen } from '../test-utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByText('Title')).toBeTruthy();
  });

  it('handles user interaction', () => {
    render(<MyComponent />);
    fireEvent.press(screen.getByText('Button'));
    expect(screen.getByText('Success')).toBeTruthy();
  });
});
```

### 유틸리티 함수 테스트

```typescript
import { myFunction } from './myUtils';

describe('myFunction', () => {
  it('returns correct value', () => {
    expect(myFunction(1, 2)).toBe(3);
  });

  it('handles edge cases', () => {
    expect(myFunction(0, 0)).toBe(0);
  });
});
```

---

## 다음 단계

### 추가 테스트가 필요한 영역

- [ ] `useLesson` hook 테스트
- [ ] `useProgressStore` 통합 테스트
- [ ] 학습 플로우 E2E 테스트
- [ ] 에러 처리 테스트
- [ ] AsyncStorage 통합 테스트

### 커버리지 목표

- 현재: ~10% (핵심 유틸리티는 100%)
- 목표: 70% 전체 코드 커버리지
