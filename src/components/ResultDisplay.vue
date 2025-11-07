<template>
  <div class="result-display" v-if="result">
    <div v-if="result.error" class="error-message">
      <p>{{ result.error }}</p>
    </div>
    
    <div v-else>
      <div class="result-header">
        <h2>계산 결과</h2>
        <div v-if="result.targetProducts && result.targetProducts.length > 0" class="target-products-list">
          <p class="target-info-label">목표 가공품:</p>
          <div class="target-items">
            <span 
              v-for="(target, index) in result.targetProducts" 
              :key="index"
              class="target-item"
            >
              <strong>{{ target.name }}</strong> {{ target.quantity }}개
              <span v-if="index < result.targetProducts.length - 1">, </span>
            </span>
          </div>
        </div>
        <p v-else class="target-info">
          <strong>{{ result.targetProduct }}</strong> {{ result.targetQuantity }}개 생산 필요
        </p>
      </div>

      <div class="result-section">
        <h3>필요한 작물</h3>
        <div v-if="result.formattedCrops && result.formattedCrops.length > 0" class="crops-list">
          <div
            v-for="(crop, idx) in result.formattedCrops"
            :key="crop.name"
            class="crop-item clickable"
            :class="{ 'selected': selectedIndex === getItemIndex('crop', idx) }"
            :style="getDifficultyStyle(crop.difficulty)"
            @click="showCropDetails(crop.name)"
            :ref="el => { if (el) setItemRef('crop', idx, el) }"
            :title="'클릭하여 ' + crop.name + '이(가) 필요한 가공품 보기 (난이도: ' + crop.difficulty + ')'"
          >
            <span class="crop-name">{{ crop.name }}</span>
            <span class="crop-count">{{ crop.count }}개</span>
            <span class="difficulty-badge" :style="getDifficultyBadgeStyle(crop.difficulty)">
              난이도 {{ crop.difficulty }}
            </span>
          </div>
        </div>
        <p v-else class="no-data">필요한 작물이 없습니다.</p>
      </div>

      <div class="result-section">
        <h3>필요한 아이템</h3>
        <div v-if="result.formattedItems && result.formattedItems.length > 0" class="items-list">
          <div
            v-for="item in result.formattedItems"
            :key="item.name"
            class="item-item"
            :style="getDifficultyStyle(0)"
          >
            <span class="item-name">{{ item.name }}</span>
            <span class="item-count">{{ item.count }}개</span>
            <span class="difficulty-badge" :style="getDifficultyBadgeStyle(0)">
              난이도 0
            </span>
          </div>
        </div>
        <p v-else class="no-data">필요한 아이템이 없습니다.</p>
      </div>

      <div class="result-section">
        <h3>필요한 가공품</h3>
        <div v-if="result.formattedProducts && result.formattedProducts.length > 0" class="products-list">
          <div
            v-for="(product, idx) in result.formattedProducts"
            :key="product.name"
            class="product-item clickable"
            :class="{ 'selected': selectedIndex === getItemIndex('product', idx) }"
            :style="getDifficultyStyle(product.difficulty)"
            @click="showProductDetails(product.name)"
            :ref="el => { if (el) setItemRef('product', idx, el) }"
            :title="'클릭하여 ' + product.name + '의 재료 보기 (난이도: ' + product.difficulty + (product.purchasable && product.price ? ', 구매가: ' + product.price + 'P' : '') + ')'"
          >
            <div class="product-header">
              <span class="product-name">{{ product.name }}</span>
              <span class="product-count">{{ product.count }}개</span>
            </div>
            <div class="product-footer">
              <span class="difficulty-badge" :style="getDifficultyBadgeStyle(product.difficulty)">
                난이도 {{ product.difficulty }}
              </span>
              <span v-if="product.purchasable && product.price" class="purchase-badge">
                구매 {{ product.price }}P
              </span>
            </div>
          </div>
        </div>
        <p v-else class="no-data">필요한 가공품이 없습니다.</p>
      </div>

      <div class="result-section">
        <h3>건물별 가공품</h3>
        <div v-if="result.formattedBuildings && result.formattedBuildings.length > 0" class="buildings-list">
          <div
            v-for="building in result.formattedBuildings"
            :key="building.building"
            class="building-item"
          >
            <div class="building-name">{{ building.building }}</div>
            <div class="building-products">
              <span
                v-for="(product, index) in building.products"
                :key="product"
                class="building-product-tag"
              >
                {{ product }}<span v-if="index < building.products.length - 1">, </span>
              </span>
            </div>
          </div>
        </div>
        <p v-else class="no-data">건물 정보가 없습니다.</p>
      </div>

      <RecipeChain :dependencyChain="result.dependencyChain" />
    </div>

    <!-- 상세 정보 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="modalType === 'crop'">
            <p class="modal-description">{{ selectedItem }}이(가) 필요한 가공품:</p>
            <div v-if="relatedProducts.length > 0" class="related-products">
              <div
                v-for="product in relatedProducts"
                :key="product.name"
                class="related-product-item"
              >
                <span class="product-building">{{ product.building }}</span>
                <span class="product-name">{{ product.name }}</span>
              </div>
            </div>
            <p v-else class="no-related">이 작물을 사용하는 가공품이 없습니다.</p>
          </div>
          <div v-else-if="modalType === 'product'">
            <p class="modal-description">{{ selectedItem }}의 재료:</p>
            <div v-if="productIngredients" class="ingredients-list">
              <div
                v-for="(ingredient, index) in productIngredients.ingredients"
                :key="index"
                class="ingredient-item"
              >
                <span class="ingredient-type">{{ ingredient.type === 'crop' ? '작물' : '가공품' }}</span>
                <span class="ingredient-name">{{ ingredient.name }}</span>
                <span class="ingredient-count">{{ ingredient.count }}개</span>
              </div>
            </div>
            <div v-else class="no-related">재료 정보를 찾을 수 없습니다.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RecipeChain from './RecipeChain.vue'
import { findProductsUsingCrop, findProductsUsingProduct, getProductIngredients } from '../utils/chainResolver.js'
import { getAllProducts } from '../utils/dataManager.js'

export default {
  name: 'ResultDisplay',
  components: {
    RecipeChain
  },
  props: {
    result: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showModal: false,
      modalType: null, // 'crop' or 'product'
      selectedItem: '',
      modalTitle: '',
      relatedProducts: [],
      productIngredients: null,
      selectedIndex: -1, // 현재 선택된 항목 인덱스
      itemRefs: {}, // 각 항목의 DOM refs
      gridColumns: 0 // grid 열 개수 (동적으로 계산)
    }
  },
  methods: {
    // 난이도에 따른 배경색 스타일 생성 (파스텔 톤, 난이도 높을수록 진한색)
    getDifficultyStyle(difficulty) {
      // 난이도 범위를 0-100으로 정규화 (최대 난이도 100 가정)
      const maxDifficulty = 100
      const normalized = Math.min(difficulty / maxDifficulty, 1)
      
      // 파스텔 톤 색상 (연한 녹색 계열)
      // 난이도 0: 매우 연한 파스텔
      // 난이도 높을수록: 점차 진한 녹색
      const baseR = 232
      const baseG = 245
      const baseB = 233
      
      // 난이도가 높을수록 더 진한 색상
      const r = Math.floor(baseR - (normalized * 50))
      const g = Math.floor(baseG - (normalized * 40))
      const b = Math.floor(baseB - (normalized * 30))
      
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`,
        borderLeftColor: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`
      }
    },
    // 난이도 배지 스타일
    getDifficultyBadgeStyle(difficulty) {
      const maxDifficulty = 100
      const normalized = Math.min(difficulty / maxDifficulty, 1)
      
      // 배지는 더 진한 색상 (녹색 테마)
      const baseR = 102
      const baseG = 187
      const baseB = 106
      
      const r = Math.floor(baseR - (normalized * 30))
      const g = Math.floor(baseG - (normalized * 50))
      const b = Math.floor(baseB - (normalized * 30))
      
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`
      }
    },
    showCropDetails(cropName) {
      // 계산 결과에 포함된 가공품만 필터링
      const allProducts = getAllProducts()
      const resultProducts = this.result.dependencyChain || []
      const resultProductNames = new Set(resultProducts.map(p => p.name))
      
      // 계산 결과에 포함된 가공품 중에서만 찾기
      const related = findProductsUsingCrop(allProducts, cropName)
        .filter(product => resultProductNames.has(product.name))
      
      this.modalType = 'crop'
      this.selectedItem = cropName
      this.modalTitle = `${cropName}이(가) 필요한 가공품`
      this.relatedProducts = related
      this.showModal = true
    },
    showProductDetails(productName) {
      const products = getAllProducts()
      const ingredients = getProductIngredients(products, productName)
      
      this.modalType = 'product'
      this.selectedItem = productName
      this.modalTitle = `${productName}의 재료`
      this.productIngredients = ingredients
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.modalType = null
      this.selectedItem = ''
      this.relatedProducts = []
      this.productIngredients = null
    },
    // 항목 인덱스 계산 (섹션별로 오프셋 적용)
    getItemIndex(section, localIndex) {
      let offset = 0
      if (section === 'crop') {
        offset = 0
      } else if (section === 'product') {
        offset = (this.result.formattedCrops || []).length
      }
      return offset + localIndex
    },
    // 항목 ref 설정
    setItemRef(section, localIndex, el) {
      const index = this.getItemIndex(section, localIndex)
      this.itemRefs[index] = el
    },
    // 모든 클릭 가능한 항목 리스트 가져오기
    getAllClickableItems() {
      const items = []
      if (this.result.formattedCrops) {
        this.result.formattedCrops.forEach((crop, idx) => {
          items.push({
            type: 'crop',
            index: idx,
            name: crop.name,
            globalIndex: this.getItemIndex('crop', idx)
          })
        })
      }
      if (this.result.formattedProducts) {
        this.result.formattedProducts.forEach((product, idx) => {
          items.push({
            type: 'product',
            index: idx,
            name: product.name,
            globalIndex: this.getItemIndex('product', idx)
          })
        })
      }
      return items
    },
    // Grid 열 개수 계산 (동기적으로 즉시 계산)
    calculateGridColumns() {
      const firstList = document.querySelector('.crops-list, .products-list')
      if (firstList) {
        const style = window.getComputedStyle(firstList)
        const gridTemplateColumns = style.gridTemplateColumns
        
        if (gridTemplateColumns && gridTemplateColumns !== 'none') {
          // Grid 템플릿에서 열 개수 추출
          const columns = gridTemplateColumns.split(' ').filter(col => col.trim() !== '').length
          if (columns > 0) {
            this.gridColumns = columns
            console.log('Grid columns from template:', this.gridColumns)
            return
          }
        }
        
        // Grid 템플릿이 없거나 계산 실패 시 실제 자식 요소로 계산
        const firstItem = firstList.querySelector('.crop-item, .product-item')
        if (firstItem) {
          const itemWidth = firstItem.offsetWidth
          const gap = parseInt(style.gap) || 10
          const containerWidth = firstList.offsetWidth
          if (itemWidth > 0) {
            const calculated = Math.floor((containerWidth + gap) / (itemWidth + gap))
            this.gridColumns = Math.max(calculated, 1)
            console.log('Grid columns from items:', this.gridColumns, { itemWidth, gap, containerWidth })
            return
          }
        }
        
        // 최종 기본값: 화면 크기에 따라 추정
        const width = firstList.offsetWidth
        this.gridColumns = Math.max(Math.floor(width / 220), 1) // minmax(200px, 1fr) 기준
        console.log('Grid columns estimated:', this.gridColumns, { width })
      } else {
        // 리스트가 없으면 기본값
        this.gridColumns = 3
        console.log('Grid columns default:', this.gridColumns)
      }
    },
    // 방향키 핸들러
    handleKeydown(event) {
      // 디버깅: 모든 키 이벤트 로그
      if (event.key.startsWith('Arrow')) {
        console.log('Arrow key pressed:', event.key, {
          showModal: this.showModal,
          selectedIndex: this.selectedIndex,
          gridColumns: this.gridColumns
        })
      }
      
      // 모달이 열려있으면 무시
      if (this.showModal) {
        console.log('Modal is open, ignoring key')
        return
      }
      
      // 입력 필드에 포커스가 있으면 무시
      const activeElement = document.activeElement
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      )) {
        console.log('Input field focused, ignoring key')
        return
      }

      const items = this.getAllClickableItems()
      if (items.length === 0) {
        console.log('No clickable items')
        return
      }

      // Grid 열 개수가 0이면 재계산
      if (this.gridColumns <= 0) {
        this.calculateGridColumns()
        // 재계산 후에도 0이면 기본값 사용
        if (this.gridColumns <= 0) {
          this.gridColumns = 3
        }
        console.log('Grid columns recalculated:', this.gridColumns)
      }

      let newIndex = this.selectedIndex

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          event.stopPropagation()
          if (this.selectedIndex < 0) {
            newIndex = 0
          } else {
            newIndex = Math.min(this.selectedIndex + this.gridColumns, items.length - 1)
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          event.stopPropagation()
          if (this.selectedIndex < 0) {
            newIndex = items.length - 1
          } else {
            newIndex = Math.max(this.selectedIndex - this.gridColumns, 0)
          }
          break
        case 'ArrowRight':
          event.preventDefault()
          event.stopPropagation()
          console.log('ArrowRight - before:', {
            selectedIndex: this.selectedIndex,
            gridColumns: this.gridColumns,
            itemsLength: items.length
          })
          if (this.selectedIndex < 0) {
            newIndex = 0
          } else {
            // Grid 레이아웃에서 같은 행 내에서 오른쪽으로 이동
            const currentRow = Math.floor(this.selectedIndex / this.gridColumns)
            const currentCol = this.selectedIndex % this.gridColumns
            const nextCol = currentCol + 1
            
            console.log('ArrowRight - calc:', {
              currentRow,
              currentCol,
              nextCol,
              gridColumns: this.gridColumns
            })
            
            if (nextCol < this.gridColumns) {
              // 같은 행 내에서 다음 열로 이동
              newIndex = currentRow * this.gridColumns + nextCol
              if (newIndex >= items.length) {
                // 행의 끝에 도달했으면 다음 행의 첫 항목으로
                newIndex = Math.min((currentRow + 1) * this.gridColumns, items.length - 1)
              }
            } else {
              // 행의 끝이면 다음 행의 첫 항목으로
              newIndex = Math.min((currentRow + 1) * this.gridColumns, items.length - 1)
            }
          }
          console.log('ArrowRight - after:', { newIndex })
          break
        case 'ArrowLeft':
          event.preventDefault()
          event.stopPropagation()
          console.log('ArrowLeft - before:', {
            selectedIndex: this.selectedIndex,
            gridColumns: this.gridColumns,
            itemsLength: items.length
          })
          if (this.selectedIndex < 0) {
            newIndex = items.length - 1
          } else {
            // Grid 레이아웃에서 같은 행 내에서 왼쪽으로 이동
            const currentRow = Math.floor(this.selectedIndex / this.gridColumns)
            const currentCol = this.selectedIndex % this.gridColumns
            const prevCol = currentCol - 1
            
            console.log('ArrowLeft - calc:', {
              currentRow,
              currentCol,
              prevCol,
              gridColumns: this.gridColumns
            })
            
            if (prevCol >= 0) {
              // 같은 행 내에서 이전 열로 이동
              newIndex = currentRow * this.gridColumns + prevCol
            } else {
              // 행의 시작이면 이전 행의 마지막 항목으로
              if (currentRow > 0) {
                const prevRow = currentRow - 1
                const prevRowLastCol = Math.min(this.gridColumns - 1, (items.length - 1) % this.gridColumns)
                newIndex = prevRow * this.gridColumns + prevRowLastCol
              } else {
                // 첫 번째 행이면 마지막 행의 마지막 항목으로
                const lastRow = Math.floor((items.length - 1) / this.gridColumns)
                const lastCol = (items.length - 1) % this.gridColumns
                newIndex = lastRow * this.gridColumns + lastCol
              }
            }
          }
          console.log('ArrowLeft - after:', { newIndex })
          break
        case 'Enter':
          if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
            event.preventDefault()
            event.stopPropagation()
            const item = items[this.selectedIndex]
            if (item.type === 'crop') {
              this.showCropDetails(item.name)
            } else if (item.type === 'product') {
              this.showProductDetails(item.name)
            }
          }
          return
        default:
          return
      }

      if (newIndex !== this.selectedIndex) {
        this.selectedIndex = newIndex
        this.scrollToSelected()
      }
    },
    // 선택된 항목으로 스크롤
    scrollToSelected() {
      this.$nextTick(() => {
        const element = this.itemRefs[this.selectedIndex]
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          })
        }
      })
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeydown)
    // DOM이 렌더링된 후 계산
    this.$nextTick(() => {
      this.calculateGridColumns()
    })
    // 화면 크기 변경 시 grid 열 개수 재계산
    window.addEventListener('resize', this.calculateGridColumns)
    console.log('ResultDisplay mounted, event listener added')
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeydown)
    window.removeEventListener('resize', this.calculateGridColumns)
  },
  watch: {
    result() {
      // 결과가 변경되면 선택 초기화
      this.selectedIndex = -1
      this.itemRefs = {}
      this.$nextTick(() => {
        this.calculateGridColumns()
      })
    }
  }
}
</script>

<style scoped>
.result-display {
  margin-top: 20px;
}

.error-message {
  padding: 20px;
  background: #fee;
  border: 2px solid #fcc;
  border-radius: 6px;
  color: #c33;
}

.result-header {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.result-header h2 {
  color: #333;
  margin-bottom: 10px;
}

.target-info {
  font-size: 1.1em;
  color: #555;
}

.target-products-list {
  margin-top: 10px;
}

.target-info-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.target-items {
  font-size: 1.1em;
  color: #555;
  line-height: 1.8;
}

.target-item {
  display: inline;
}

.result-section {
  margin-bottom: 30px;
}

.result-section h3 {
  color: #66BB6A;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.crops-list,
.items-list,
.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.crop-item,
.item-item,
.product-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  border-left: 4px solid #66BB6A;
  transition: all 0.2s ease;
  position: relative;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.crop-item.clickable,
.product-item.clickable {
  cursor: pointer;
}

.crop-item.clickable:hover,
.product-item.clickable:hover {
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(102, 187, 106, 0.2);
  filter: brightness(0.95);
}

.crop-item.selected,
.product-item.selected {
  outline: 3px solid #66BB6A;
  outline-offset: 2px;
  transform: translateX(3px);
  box-shadow: 0 4px 12px rgba(102, 187, 106, 0.4);
  z-index: 10;
  position: relative;
}

.crop-name,
.product-name {
  font-weight: 600;
  color: #333;
}

.crop-count,
.item-count,
.product-count {
  color: #66BB6A;
  font-weight: 600;
}

.difficulty-badge {
  font-size: 0.75em;
  padding: 2px 8px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  white-space: nowrap;
}

.purchase-badge {
  font-size: 0.75em;
  padding: 2px 8px;
  border-radius: 12px;
  background: #66BB6A;
  color: white;
  font-weight: 600;
  white-space: nowrap;
}

.buildings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.building-item {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #66BB6A;
}

.building-name {
  font-weight: 600;
  color: #558B2F;
  margin-bottom: 8px;
  font-size: 1.1em;
}

.building-products {
  color: #666;
}

.building-product-tag {
  display: inline;
}

.no-data {
  color: #999;
  font-style: italic;
  padding: 10px;
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #66BB6A;
  font-size: 1.3em;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-description {
  font-weight: 600;
  color: #555;
  margin-bottom: 15px;
  font-size: 1.1em;
}

.related-products {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-product-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #66BB6A;
}

.product-building {
  background: #66BB6A;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
}

.product-name {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #66BB6A;
}

.ingredient-type {
  background: #66BB6A;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.ingredient-name {
  font-weight: 600;
  color: #333;
  flex: 1;
}

.ingredient-count {
  color: #66BB6A;
  font-weight: 600;
}

.no-related {
  color: #999;
  font-style: italic;
  padding: 20px;
  text-align: center;
}
</style>

