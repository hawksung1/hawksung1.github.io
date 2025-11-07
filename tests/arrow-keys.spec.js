const { test, expect } = require('@playwright/test');

test.describe('방향키 네비게이션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 로드
    await page.goto('/');
    // 검색 결과가 나타날 때까지 대기
    await page.waitForSelector('.search-form', { timeout: 10000 });
  });

  test('좌우키로 검색 결과 네비게이션', async ({ page }) => {
    // 콘솔 메시지 수집
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });

    // 가공품 검색 (예: 빵)
    const searchInput = page.locator('.product-name-input').first();
    await searchInput.fill('빵');
    await page.waitForTimeout(300); // 자동완성 대기
    
    // 자동완성에서 선택하거나 Enter로 개수 필드로 이동
    await searchInput.press('Enter');
    await page.waitForTimeout(300);
    
    // 개수 입력
    const quantityInput = page.locator('.quantity-input').first();
    await quantityInput.fill('1');
    await page.waitForTimeout(300);
    
    // 검색 버튼 클릭
    const searchButton = page.locator('.search-btn');
    await searchButton.click();

    // 검색 결과가 나타날 때까지 대기
    await page.waitForSelector('.result-display', { timeout: 10000 });
    await page.waitForTimeout(1000); // 결과 렌더링 대기
    
    // 결과 항목이 있는지 확인
    const hasItems = await page.locator('.crop-item, .product-item').count();
    console.log('Found items:', hasItems);
    
    if (hasItems === 0) {
      // 결과가 없으면 스크린샷
      await page.screenshot({ path: 'test-results/no-items.png' });
      throw new Error('No items found in search results');
    }

    // 초기 선택 상태 확인 (선택된 항목이 없어야 함)
    const initialSelected = await page.locator('.crop-item.selected, .product-item.selected').count();
    console.log('Initial selected items:', initialSelected);

    // 첫 번째 항목 클릭하여 포커스 설정
    const firstItem = page.locator('.crop-item.clickable, .product-item.clickable').first();
    await firstItem.click();
    
    // 잠시 대기 (선택 상태 업데이트)
    await page.waitForTimeout(100);

    // 위쪽 화살표 키로 첫 항목 선택
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);

    // 좌우키 테스트
    console.log('Testing ArrowRight...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    // 선택된 항목 확인
    const selectedAfterRight = await page.locator('.crop-item.selected, .product-item.selected').count();
    console.log('Selected items after ArrowRight:', selectedAfterRight);

    // 콘솔 로그 확인
    const arrowRightLogs = consoleMessages.filter(msg => msg.includes('ArrowRight'));
    console.log('ArrowRight logs:', arrowRightLogs);

    // 좌키 테스트
    console.log('Testing ArrowLeft...');
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);

    // 선택된 항목 확인
    const selectedAfterLeft = await page.locator('.crop-item.selected, .product-item.selected').count();
    console.log('Selected items after ArrowLeft:', selectedAfterLeft);

    // 콘솔 로그 확인
    const arrowLeftLogs = consoleMessages.filter(msg => msg.includes('ArrowLeft'));
    console.log('ArrowLeft logs:', arrowLeftLogs);

    // 최소한 하나의 로그가 있어야 함
    expect(arrowRightLogs.length).toBeGreaterThan(0);
    expect(arrowLeftLogs.length).toBeGreaterThan(0);
  });

  test('Grid 열 개수 계산 확인', async ({ page }) => {
    // 콘솔 메시지 수집
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });

    // 가공품 검색
    const searchInput = page.locator('.product-name-input').first();
    await searchInput.fill('빵');
    await searchInput.press('Enter');
    
    const quantityInput = page.locator('.quantity-input').first();
    await quantityInput.fill('1');
    await quantityInput.press('Enter');

    // 검색 결과 대기
    await page.waitForSelector('.result-display', { timeout: 5000 });
    await page.waitForSelector('.crop-item, .product-item', { timeout: 5000 });
    await page.waitForTimeout(500); // Grid 계산 대기

    // Grid 열 개수 로그 확인
    const gridLogs = consoleMessages.filter(msg => msg.includes('Grid columns'));
    console.log('Grid columns logs:', gridLogs);

    // Grid 열 개수가 계산되었는지 확인
    expect(gridLogs.length).toBeGreaterThan(0);
  });
});

