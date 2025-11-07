/**
 * 체인 의존성을 해결하는 유틸리티
 * 가공품 간의 의존성 체인을 탐색하고 순서를 결정합니다.
 */

/**
 * 가공품 데이터에서 특정 가공품을 찾습니다.
 * @param {Array} products - 가공품 배열
 * @param {string} productName - 찾을 가공품 이름
 * @returns {Object|null} 가공품 객체 또는 null
 */
export function findProduct(products, productName) {
  return products.find(p => p.name === productName) || null
}

/**
 * 가공품의 모든 의존성을 재귀적으로 탐색합니다.
 * @param {Array} products - 가공품 배열
 * @param {string} productName - 시작 가공품 이름
 * @param {Set} visited - 방문한 가공품 추적 (순환 참조 방지)
 * @returns {Array} 의존성 체인 배열 (의존성 순서대로)
 */
export function resolveDependencies(products, productName, visited = new Set()) {
  const product = findProduct(products, productName)
  if (!product) {
    return []
  }

  // 순환 참조 방지
  if (visited.has(productName)) {
    return []
  }
  visited.add(productName)

  const dependencies = []
  
  // 재료를 순회하며 의존성 탐색
  product.ingredients.forEach(ingredient => {
    if (ingredient.type === 'product') {
      // 다른 가공품에 의존하는 경우, 재귀적으로 탐색
      const subDependencies = resolveDependencies(
        products, 
        ingredient.name, 
        new Set(visited)
      )
      dependencies.push(...subDependencies)
      
      // 현재 가공품도 의존성에 추가 (아직 없을 경우)
      if (!dependencies.some(d => d.name === ingredient.name)) {
        dependencies.push(findProduct(products, ingredient.name))
      }
    }
  })

  // 현재 가공품도 추가 (아직 없을 경우)
  if (!dependencies.some(d => d.name === productName)) {
    dependencies.push(product)
  }

  return dependencies
}

/**
 * 의존성 체인을 건물별로 그룹화합니다.
 * @param {Array} dependencyChain - 의존성 체인 배열
 * @returns {Object} 건물별로 그룹화된 가공품 객체
 */
export function groupByBuilding(dependencyChain) {
  const grouped = {}
  
  dependencyChain.forEach(product => {
    if (!grouped[product.building]) {
      grouped[product.building] = []
    }
    if (!grouped[product.building].some(p => p.name === product.name)) {
      grouped[product.building].push(product)
    }
  })
  
  return grouped
}

/**
 * 특정 작물이 필요한 모든 가공품을 찾습니다 (재귀적 역추적).
 * 직접적으로 작물을 사용하는 가공품과, 그 가공품을 사용하는 다른 가공품들도 포함합니다.
 * @param {Array} products - 가공품 배열
 * @param {string} cropName - 작물 이름
 * @param {Set} visited - 방문한 가공품 추적 (순환 참조 방지)
 * @returns {Array} 해당 작물을 사용하는 가공품 배열 (직접 및 간접)
 */
export function findProductsUsingCrop(products, cropName, visited = new Set()) {
  const result = []
  
  // 1단계: 직접적으로 작물을 사용하는 가공품 찾기
  const directProducts = products.filter(product => {
    return product.ingredients.some(
      ing => ing.type === 'crop' && ing.name === cropName
    )
  })
  
  // 직접 사용하는 가공품 추가
  directProducts.forEach(product => {
    if (!visited.has(product.name)) {
      visited.add(product.name)
      result.push(product)
    }
  })
  
  // 2단계: 직접 사용하는 가공품들을 사용하는 다른 가공품들 재귀적으로 찾기
  const findIndirectProducts = (productName, currentVisited) => {
    const indirectProducts = findProductsUsingProduct(products, productName, new Set(currentVisited))
    indirectProducts.forEach(product => {
      if (!currentVisited.has(product.name)) {
        currentVisited.add(product.name)
        result.push(product)
        // 재귀적으로 더 깊은 레벨의 의존성 찾기
        findIndirectProducts(product.name, currentVisited)
      }
    })
  }
  
  directProducts.forEach(directProduct => {
    findIndirectProducts(directProduct.name, new Set(visited))
  })
  
  return result
}

/**
 * 특정 가공품이 필요한 모든 가공품을 찾습니다 (역추적).
 * @param {Array} products - 가공품 배열
 * @param {string} productName - 가공품 이름
 * @param {Set} visited - 방문한 가공품 추적 (순환 참조 방지)
 * @returns {Array} 해당 가공품을 사용하는 가공품 배열
 */
export function findProductsUsingProduct(products, productName, visited = new Set()) {
  const result = []
  
  products.forEach(product => {
    // 이미 방문한 가공품은 건너뛰기
    if (visited.has(product.name)) {
      return
    }
    
    const usesProduct = product.ingredients.some(
      ing => ing.type === 'product' && ing.name === productName
    )
    if (usesProduct) {
      visited.add(product.name)
      result.push(product)
    }
  })
  
  return result
}

/**
 * 특정 가공품의 재료 정보를 반환합니다.
 * @param {Array} products - 가공품 배열
 * @param {string} productName - 가공품 이름
 * @returns {Object|null} 가공품 정보 또는 null
 */
export function getProductIngredients(products, productName) {
  return findProduct(products, productName)
}

