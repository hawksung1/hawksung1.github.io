import { findProduct, resolveDependencies, groupByBuilding } from './chainResolver.js'
import { getAllProducts, getAllCrops, getCropDifficulty, isItem } from './dataManager.js'

/**
 * 가공품 생산에 필요한 모든 재료를 계산합니다.
 * @param {string} productName - 목표 가공품 이름
 * @param {number} quantity - 필요한 가공품 개수
 * @returns {Object} 계산 결과 객체
 */
export function calculateRequirements(productName, quantity) {
  return calculateMultipleRequirements([{ name: productName, quantity }])
}

/**
 * 여러 가공품 생산에 필요한 모든 재료를 종합 계산합니다.
 * @param {Array} productList - 가공품 목록 [{ name: string, quantity: number }, ...]
 * @returns {Object} 계산 결과 객체
 */
export function calculateMultipleRequirements(productList) {
  const products = getAllProducts()
  const errors = []
  
  // 모든 가공품의 의존성 체인 수집
  const allDependencyChains = []
  const targetProducts = []
  
  productList.forEach(({ name, quantity }) => {
    const product = findProduct(products, name)
    if (!product) {
      errors.push(`가공품 "${name}"을(를) 찾을 수 없습니다.`)
      return
    }
    
    targetProducts.push({ name, quantity, product })
    const chain = resolveDependencies(products, name)
    allDependencyChains.push(...chain)
  })
  
  if (errors.length > 0) {
    return {
      error: errors.join('\n'),
      crops: {},
      intermediateProducts: {},
      buildingGroups: {},
      targetProducts: []
    }
  }
  
  // 중복 제거된 의존성 체인
  const uniqueChains = []
  const seen = new Set()
  allDependencyChains.forEach(product => {
    if (!seen.has(product.name)) {
      seen.add(product.name)
      uniqueChains.push(product)
    }
  })
  
  // 필요한 작물, 아이템, 중간 가공품 계산
  const crops = {}
  const items = {}
  const intermediateProducts = {}
  const buildingGroups = groupByBuilding(uniqueChains)

  // 재귀적으로 재료 계산 및 난이도 계산
  function calculateIngredients(product, neededQuantity) {
    if (!product) return

    product.ingredients.forEach(ingredient => {
      // 타입이 명시되지 않은 경우 자동 판단
      let ingredientType = ingredient.type
      if (!ingredientType) {
        if (isItem(ingredient.name)) {
          ingredientType = 'item'
        } else if (findProduct(products, ingredient.name)) {
          ingredientType = 'product'
        } else {
          ingredientType = 'crop'
        }
      }

      if (ingredientType === 'crop') {
        // 작물인 경우
        const cropName = ingredient.name
        crops[cropName] = (crops[cropName] || 0) + (ingredient.count * neededQuantity)
      } else if (ingredientType === 'item') {
        // 아이템인 경우 (난이도 0)
        const itemName = ingredient.name
        items[itemName] = (items[itemName] || 0) + (ingredient.count * neededQuantity)
      } else if (ingredientType === 'product') {
        // 다른 가공품인 경우
        const ingredientProduct = findProduct(products, ingredient.name)
        if (ingredientProduct) {
          const neededProductQuantity = ingredient.count * neededQuantity
          
          // 중간 가공품 필요량 기록
          intermediateProducts[ingredient.name] = 
            (intermediateProducts[ingredient.name] || 0) + neededProductQuantity
          
          // 재귀적으로 해당 가공품의 재료 계산
          calculateIngredients(ingredientProduct, neededProductQuantity)
        }
      }
    })
  }

  // 가공품의 난이도를 계산합니다 (작물 난이도 합산)
  function calculateProductDifficulty(product) {
    if (!product) return 0
    
    let totalDifficulty = 0
    const visited = new Set()
    
    function calculateRecursive(prod) {
      if (!prod || visited.has(prod.name)) return 0
      visited.add(prod.name)
      
      let difficulty = 0
      prod.ingredients.forEach(ingredient => {
        let ingredientType = ingredient.type
        if (!ingredientType) {
          if (isItem(ingredient.name)) {
            ingredientType = 'item'
          } else if (findProduct(products, ingredient.name)) {
            ingredientType = 'product'
          } else {
            ingredientType = 'crop'
          }
        }

        if (ingredientType === 'crop') {
          // 작물 난이도 추가
          difficulty += getCropDifficulty(ingredient.name) * ingredient.count
        } else if (ingredientType === 'product') {
          // 가공품인 경우 재귀적으로 난이도 계산
          const ingredientProduct = findProduct(products, ingredient.name)
          if (ingredientProduct) {
            difficulty += calculateRecursive(ingredientProduct) * ingredient.count
          }
        }
        // 아이템은 난이도 0이므로 무시
      })
      
      return difficulty
    }
    
    return calculateRecursive(product)
  }

  // 각 목표 가공품의 재료 계산
  targetProducts.forEach(({ product, quantity }) => {
    calculateIngredients(product, quantity)
    // 최종 목표 가공품도 중간 가공품 목록에 추가
    intermediateProducts[product.name] = 
      (intermediateProducts[product.name] || 0) + quantity
  })

  // 각 가공품의 난이도 계산
  const productDifficulties = {}
  uniqueChains.forEach(product => {
    productDifficulties[product.name] = calculateProductDifficulty(product)
  })
  
  // 목표 가공품의 난이도도 계산
  targetProducts.forEach(({ product }) => {
    if (!productDifficulties[product.name]) {
      productDifficulties[product.name] = calculateProductDifficulty(product)
    }
  })

  return {
    targetProducts: targetProducts.map(({ name, quantity }) => ({ name, quantity })),
    crops: crops,
    items: items,
    intermediateProducts: intermediateProducts,
    buildingGroups: buildingGroups,
    dependencyChain: uniqueChains,
    productDifficulties: productDifficulties
  }
}

/**
 * 계산 결과를 사용자 친화적인 형식으로 변환합니다.
 * @param {Object} result - calculateRequirements 또는 calculateMultipleRequirements의 결과
 * @returns {Object} 포맷된 결과
 */
export function formatResult(result) {
  if (result.error) {
    return result
  }

  const formattedCrops = Object.entries(result.crops || {}).map(([name, count]) => ({
    name,
    count: Math.ceil(count),
    difficulty: getCropDifficulty(name)
  }))

  const formattedItems = Object.entries(result.items || {}).map(([name, count]) => ({
    name,
    count: Math.ceil(count),
    difficulty: 0 // 아이템은 항상 난이도 0
  }))

  const formattedProducts = Object.entries(result.intermediateProducts || {})
    .map(([name, count]) => {
      const product = findProduct(getAllProducts(), name)
      return {
        name,
        count: Math.ceil(count),
        difficulty: result.productDifficulties?.[name] || 0,
        purchasable: product?.purchasable || false,
        price: product?.price || null
      }
    })
    .sort((a, b) => {
      // 의존성 순서대로 정렬 (간단한 휴리스틱)
      const aIndex = result.dependencyChain.findIndex(p => p.name === a.name)
      const bIndex = result.dependencyChain.findIndex(p => p.name === b.name)
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
    })

  const formattedBuildings = Object.entries(result.buildingGroups || {}).map(([building, products]) => ({
    building,
    products: products.map(p => p.name)
  }))

  return {
    ...result,
    formattedCrops,
    formattedItems,
    formattedProducts,
    formattedBuildings
  }
}

