import productsData from '../data/products.json'
import cropsData from '../data/crops.json'

const STORAGE_KEY = 'realfarm_custom_products'
const CROPS_STORAGE_KEY = 'realfarm_custom_crops'

// 아이템 목록 (난이도 0)
const ITEMS = ['응고제', '소금', '발효액', '이스트', '달걀', '우유', '뽕잎']

/**
 * localStorage에서 사용자가 추가한 가공품을 가져옵니다.
 */
export function getCustomProducts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to load custom products:', e)
    return []
  }
}

/**
 * 사용자가 추가한 가공품을 localStorage에 저장합니다.
 */
export function saveCustomProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    return true
  } catch (e) {
    console.error('Failed to save custom products:', e)
    return false
  }
}

/**
 * 기본 가공품과 사용자가 추가한 가공품을 병합합니다.
 */
export function getAllProducts() {
  const defaultProducts = productsData.products || []
  const customProducts = getCustomProducts()
  
  // 기본 가공품과 사용자 가공품 병합 (사용자 가공품이 우선)
  const productMap = new Map()
  
  // 기본 가공품 먼저 추가
  defaultProducts.forEach(product => {
    productMap.set(product.id, { ...product, isCustom: false })
  })
  
  // 사용자 가공품 추가 (같은 id가 있으면 덮어쓰기)
  customProducts.forEach(product => {
    productMap.set(product.id, { ...product, isCustom: true })
  })
  
  return Array.from(productMap.values())
}

/**
 * 새 가공품을 추가합니다.
 */
export function addProduct(product) {
  const customProducts = getCustomProducts()
  
  // ID 중복 확인
  if (customProducts.some(p => p.id === product.id)) {
    return { success: false, error: '이미 존재하는 ID입니다.' }
  }
  
  // 이름 중복 확인 (기본 데이터 포함)
  const allProducts = getAllProducts()
  if (allProducts.some(p => p.name === product.name && p.id !== product.id)) {
    return { success: false, error: '이미 존재하는 가공품 이름입니다.' }
  }
  
  customProducts.push(product)
  const saved = saveCustomProducts(customProducts)
  
  if (saved) {
    return { success: true }
  } else {
    return { success: false, error: '저장에 실패했습니다.' }
  }
}

/**
 * 사용자가 추가한 가공품을 수정합니다.
 */
export function updateProduct(productId, updatedProduct) {
  const customProducts = getCustomProducts()
  const index = customProducts.findIndex(p => p.id === productId)
  
  if (index === -1) {
    return { success: false, error: '가공품을 찾을 수 없습니다.' }
  }
  
  // 이름 중복 확인 (자기 자신 제외)
  const allProducts = getAllProducts()
  if (allProducts.some(p => p.name === updatedProduct.name && p.id !== productId)) {
    return { success: false, error: '이미 존재하는 가공품 이름입니다.' }
  }
  
  customProducts[index] = { ...updatedProduct, id: productId }
  const saved = saveCustomProducts(customProducts)
  
  if (saved) {
    return { success: true }
  } else {
    return { success: false, error: '수정에 실패했습니다.' }
  }
}

/**
 * 사용자가 추가한 가공품을 삭제합니다.
 */
export function deleteProduct(productId) {
  const customProducts = getCustomProducts()
  const filtered = customProducts.filter(p => p.id !== productId)
  
  if (filtered.length === customProducts.length) {
    return { success: false, error: '가공품을 찾을 수 없습니다.' }
  }
  
  const saved = saveCustomProducts(filtered)
  
  if (saved) {
    return { success: true }
  } else {
    return { success: false, error: '삭제에 실패했습니다.' }
  }
}

/**
 * 특정 가공품을 가져옵니다.
 */
export function getProduct(productId) {
  const allProducts = getAllProducts()
  return allProducts.find(p => p.id === productId) || null
}

/**
 * 사용자가 추가한 가공품 목록을 가져옵니다.
 */
export function getCustomProductsList() {
  return getCustomProducts()
}

/**
 * 작물 데이터를 가져옵니다.
 */
export function getAllCrops() {
  const defaultCrops = cropsData.crops || []
  const customCrops = getCustomCrops()
  
  const cropMap = new Map()
  
  // 기본 작물 먼저 추가
  defaultCrops.forEach(crop => {
    cropMap.set(crop.name, { ...crop, isCustom: false })
  })
  
  // 사용자 작물 추가 (같은 이름이 있으면 덮어쓰기)
  customCrops.forEach(crop => {
    cropMap.set(crop.name, { ...crop, isCustom: true })
  })
  
  return Array.from(cropMap.values())
}

/**
 * localStorage에서 사용자가 추가/수정한 작물을 가져옵니다.
 */
export function getCustomCrops() {
  try {
    const stored = localStorage.getItem(CROPS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('Failed to load custom crops:', e)
    return []
  }
}

/**
 * 사용자가 추가/수정한 작물을 localStorage에 저장합니다.
 */
export function saveCustomCrops(crops) {
  try {
    localStorage.setItem(CROPS_STORAGE_KEY, JSON.stringify(crops))
    return true
  } catch (e) {
    console.error('Failed to save custom crops:', e)
    return false
  }
}

/**
 * 특정 작물의 난이도를 가져옵니다.
 */
export function getCropDifficulty(cropName) {
  const crops = getAllCrops()
  const crop = crops.find(c => c.name === cropName)
  return crop ? (crop.difficulty || 0) : 0
}

/**
 * 아이템인지 확인합니다.
 */
export function isItem(name) {
  return ITEMS.includes(name)
}

/**
 * 작물인지 확인합니다.
 */
export function isCrop(name) {
  const crops = getAllCrops()
  return crops.some(c => c.name === name)
}

/**
 * 가공품 데이터를 JSON 파일로 내보냅니다 (다운로드).
 */
export function exportProductsToFile() {
  try {
    const customProducts = getCustomProducts()
    const dataStr = JSON.stringify(customProducts, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `realfarm-products-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return { success: true }
  } catch (e) {
    console.error('Failed to export products:', e)
    return { success: false, error: '내보내기에 실패했습니다.' }
  }
}

/**
 * JSON 파일에서 가공품 데이터를 가져옵니다 (가져오기).
 * @param {File} file - 업로드된 JSON 파일
 * @returns {Promise<Object>} 결과 객체
 */
export function importProductsFromFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result)
        
        // 배열인지 확인
        if (!Array.isArray(imported)) {
          resolve({ success: false, error: '잘못된 파일 형식입니다. 배열이어야 합니다.' })
          return
        }
        
        // 각 항목이 올바른 형식인지 검증
        const validProducts = imported.filter(product => {
          return product.id && 
                 product.name && 
                 product.building && 
                 Array.isArray(product.ingredients)
        })
        
        if (validProducts.length === 0) {
          resolve({ success: false, error: '유효한 가공품 데이터가 없습니다.' })
          return
        }
        
        // 기존 데이터와 병합 (중복 ID는 덮어쓰기)
        const existing = getCustomProducts()
        const productMap = new Map()
        
        // 기존 데이터 먼저 추가
        existing.forEach(p => productMap.set(p.id, p))
        
        // 가져온 데이터 추가 (중복 시 덮어쓰기)
        validProducts.forEach(p => productMap.set(p.id, p))
        
        const merged = Array.from(productMap.values())
        const saved = saveCustomProducts(merged)
        
        if (saved) {
          resolve({ 
            success: true, 
            imported: validProducts.length,
            total: merged.length
          })
        } else {
          resolve({ success: false, error: '저장에 실패했습니다.' })
        }
      } catch (e) {
        console.error('Failed to import products:', e)
        resolve({ success: false, error: '파일을 읽는 중 오류가 발생했습니다.' })
      }
    }
    
    reader.onerror = () => {
      resolve({ success: false, error: '파일을 읽는 중 오류가 발생했습니다.' })
    }
    
    reader.readAsText(file)
  })
}
