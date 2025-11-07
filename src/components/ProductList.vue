<template>
  <div class="product-list">
    <div class="list-header">
      <h2>가공품 목록</h2>
      <div class="header-actions">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="가공품 이름, 건물, 재료로 검색..."
            class="search-input"
          />
        </div>
        <button @click="showAddForm = true" class="add-btn">
          + 가공품 추가
        </button>
      </div>
    </div>

    <!-- 추가/수정 폼 -->
    <div v-if="showAddForm || editingProduct" class="form-section">
      <h3>{{ editingProduct ? '가공품 수정' : '가공품 추가' }}</h3>
      <div class="form-row">
        <div class="form-group">
          <label>ID:</label>
          <input 
            v-model="formData.id" 
            type="text" 
            :disabled="!!editingProduct"
            placeholder="예: bread"
          />
        </div>
        <div class="form-group">
          <label>이름:</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="예: 빵"
          />
        </div>
        <div class="form-group">
          <label>건물:</label>
          <input 
            v-model="formData.building" 
            type="text" 
            placeholder="예: 제과소"
          />
        </div>
        <div class="form-group">
          <label>
            <input 
              v-model="formData.purchasable" 
              type="checkbox"
            />
            구매 가능
          </label>
        </div>
        <div class="form-group" v-if="formData.purchasable">
          <label>구매 가격 (P):</label>
          <input 
            v-model.number="formData.price" 
            type="number" 
            min="0"
            placeholder="예: 100"
          />
        </div>
        <div class="form-group form-actions">
          <button @click="saveProduct" class="save-btn">저장</button>
          <button @click="cancelForm" class="cancel-btn">취소</button>
        </div>
      </div>
      <div class="ingredients-section">
        <label>재료:</label>
        <div class="ingredients-list">
          <div 
            v-for="(ing, idx) in formData.ingredients" 
            :key="idx"
            class="ingredient-row"
          >
            <select v-model="ing.type" class="ing-type" @change="ing.name = ''">
              <option value="crop">작물</option>
              <option value="product">가공품</option>
              <option value="item">아이템</option>
            </select>
            <select 
              v-model="ing.name" 
              class="ing-name"
              :disabled="!ing.type"
            >
              <option value="">선택하세요</option>
              <option 
                v-for="name in getAvailableNames(ing.type)" 
                :key="name" 
                :value="name"
              >
                {{ name }}
              </option>
            </select>
            <input 
              v-model.number="ing.count" 
              type="number" 
              min="1"
              placeholder="개수"
              class="ing-count"
            />
            <button 
              @click="removeIngredient(idx)" 
              class="remove-ing-btn"
              :disabled="formData.ingredients.length === 1"
            >
              삭제
            </button>
          </div>
          <button @click="addIngredient" class="add-ing-btn">+ 재료 추가</button>
        </div>
      </div>
    </div>

    <!-- 표 형식 목록 -->
    <div v-if="filteredProducts.length === 0" class="empty-message">
      {{ searchQuery ? '검색 결과가 없습니다.' : '가공품이 없습니다.' }}
    </div>

    <div v-else class="table-container">
      <table class="products-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>건물</th>
            <th>난이도</th>
            <th>구매</th>
            <th>재료</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="product in filteredProducts" 
            :key="product.id"
            :class="{ 'custom-product': product.isCustom }"
            :style="getDifficultyStyle(product.difficulty)"
          >
            <td 
              class="name-cell"
              @dblclick="product.isCustom && startEdit(product)"
              :class="{ 'clickable': product.isCustom }"
              :title="product.isCustom ? '더블클릭하여 수정' : '기본 가공품은 수정할 수 없습니다'"
            >
              {{ product.name }}
            </td>
            <td class="building-cell">{{ product.building }}</td>
            <td class="difficulty-cell">
              <span class="difficulty-badge" :style="getDifficultyBadgeStyle(product.difficulty)">
                {{ product.difficulty }}
              </span>
            </td>
            <td class="purchase-cell">
              <span v-if="product.purchasable && product.price" class="purchase-badge">
                {{ product.price }}P
              </span>
              <span v-else class="no-purchase">-</span>
            </td>
            <td class="ingredients-cell">
              <div class="ingredients-display">
                <span 
                  v-for="(ing, idx) in product.ingredients" 
                  :key="idx"
                  class="ingredient-tag"
                  :class="getIngredientTypeClass(ing.type, ing.name)"
                  :title="getIngredientTypeLabel(ing.type, ing.name)"
                >
                  {{ getIngredientTypeLabel(ing.type, ing.name) }}: {{ ing.name }} × {{ ing.count }}
                </span>
              </div>
            </td>
            <td class="actions-cell">
              <div class="action-buttons" v-if="product.isCustom">
                <button 
                  @click="confirmDelete(product)" 
                  class="delete-btn"
                  title="삭제"
                >
                  삭제
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="productToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>⚠️ 가공품 삭제 확인</h3>
        <p><strong>"{{ productToDelete.name }}"</strong>을(를) 정말로 삭제하시겠습니까?</p>
        <p class="warning-text">이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button @click="executeDelete" class="confirm-btn">네, 삭제합니다</button>
          <button @click="cancelDelete" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllProducts, addProduct, updateProduct, deleteProduct, getAllCrops, getCropDifficulty, isItem } from '../utils/dataManager.js'
import { findProduct } from '../utils/chainResolver.js'

const DEFAULT_ITEMS = ['응고제', '소금', '발효액', '이스트', '달걀', '우유', '뽕잎']
const ITEMS_STORAGE_KEY = 'realfarm_custom_items'

export default {
  name: 'ProductList',
  emits: ['edit-product', 'product-deleted'],
  data() {
    return {
      searchQuery: '',
      productToDelete: null,
      showAddForm: false,
      editingProduct: null,
      products: [],
      crops: [],
      customItems: [],
      formData: {
        id: '',
        name: '',
        building: '',
        purchasable: false,
        price: null,
        ingredients: [{ type: 'crop', name: '', count: 1 }]
      }
    }
  },
  created() {
    this.refreshData()
  },
  computed: {
    allProducts() {
      return this.products.map(product => ({
        ...product,
        difficulty: this.calculateProductDifficulty(product),
        purchasable: product.purchasable || false,
        price: product.price || null
      })).sort((a, b) => a.name.localeCompare(b.name))
    },
    availableCrops() {
      return this.crops.map(c => c.name).sort()
    },
    availableProducts() {
      return this.products.map(p => p.name).sort()
    },
    availableItems() {
      const defaultItems = DEFAULT_ITEMS
      const customItems = this.customItems.map(i => i.name)
      const itemMap = new Map()
      defaultItems.forEach(name => itemMap.set(name, name))
      customItems.forEach(name => itemMap.set(name, name))
      return Array.from(itemMap.values()).sort()
    },
    filteredProducts() {
      if (!this.searchQuery.trim()) {
        return this.allProducts
      }
      
      const query = this.searchQuery.toLowerCase().trim()
      return this.allProducts.filter(product => {
        // 이름으로 검색
        if (product.name.toLowerCase().includes(query)) {
          return true
        }
        
        // 건물로 검색
        if (product.building.toLowerCase().includes(query)) {
          return true
        }
        
        // 재료로 검색
        if (product.ingredients.some(ing => 
          ing.name.toLowerCase().includes(query)
        )) {
          return true
        }
        
        return false
      })
    }
  },
  methods: {
    refreshData() {
      this.products = getAllProducts()
      this.crops = getAllCrops()
      this.customItems = this.getCustomItems()
    },
    getCustomItems() {
      try {
        const stored = localStorage.getItem(ITEMS_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
      } catch (e) {
        console.error('Failed to load custom items:', e)
        return []
      }
    },
    getAvailableNames(type) {
      if (type === 'crop') {
        return this.availableCrops
      } else if (type === 'product') {
        return this.availableProducts
      } else if (type === 'item') {
        return this.availableItems
      }
      return []
    },
    // 가공품의 난이도를 계산합니다
    calculateProductDifficulty(product, allProducts = this.products) {
      if (!product || !product.ingredients) return 0
      
      const visited = new Set()
      
      const calculateRecursive = (prod) => {
        if (!prod || visited.has(prod.name)) return 0
        visited.add(prod.name)
        
        let difficulty = 0
        prod.ingredients.forEach(ingredient => {
          let ingredientType = ingredient.type
          if (!ingredientType) {
            if (this.availableItems.includes(ingredient.name) || isItem(ingredient.name)) {
              ingredientType = 'item'
            } else if (findProduct(allProducts, ingredient.name)) {
              ingredientType = 'product'
            } else {
              ingredientType = 'crop'
            }
          }

          if (ingredientType === 'crop') {
            difficulty += getCropDifficulty(ingredient.name) * ingredient.count
          } else if (ingredientType === 'product') {
            const ingredientProduct = findProduct(allProducts, ingredient.name)
            if (ingredientProduct) {
              difficulty += calculateRecursive(ingredientProduct) * ingredient.count
            }
          }
          // 아이템은 난이도 0
        })
        
        return difficulty
      }
      
      return calculateRecursive(product)
    },
    // 재료 타입을 한글로 변환
    getIngredientTypeLabel(type, name) {
      if (type === 'item' || isItem(name)) {
        return '아이템'
      } else if (type === 'product') {
        return '가공품'
      } else {
        return '작물'
      }
    },
    // 재료 타입에 따른 CSS 클래스
    getIngredientTypeClass(type, name) {
      if (type === 'item' || isItem(name)) {
        return 'item'
      } else if (type === 'product') {
        return 'product'
      } else {
        return 'crop'
      }
    },
    // 난이도 배지 스타일
    getDifficultyBadgeStyle(difficulty) {
      const maxDifficulty = 100
      const normalized = Math.min(difficulty / maxDifficulty, 1)
      
      // 녹색 테마 기반 색상
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
    // 난이도에 따른 색상 스타일
    getDifficultyStyle(difficulty) {
      const maxDifficulty = 100
      const normalized = Math.min(difficulty / maxDifficulty, 1)
      
      // 녹색 테마 기반 배경색
      const baseR = 232
      const baseG = 245
      const baseB = 233
      
      const r = Math.floor(baseR - (normalized * 50))
      const g = Math.floor(baseG - (normalized * 40))
      const b = Math.floor(baseB - (normalized * 30))
      
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`
      }
    },
    startEdit(product) {
      if (!product.isCustom) return
      if (this.editingProduct && this.editingProduct.id === product.id) return // 이미 편집 중이면 무시
      this.editingProduct = product
      this.showAddForm = true
      this.formData = {
        id: product.id,
        name: product.name,
        building: product.building,
        purchasable: product.purchasable || false,
        price: product.price || null,
        ingredients: product.ingredients.map(ing => {
          // 타입이 없으면 자동 판단
          let type = ing.type
          if (!type) {
            if (this.availableItems.includes(ing.name) || isItem(ing.name)) {
              type = 'item'
            } else if (findProduct(this.products, ing.name)) {
              type = 'product'
            } else {
              type = 'crop'
            }
          }
          return {
            type: type,
            name: ing.name,
            count: ing.count
          }
        })
      }
    },
    cancelForm() {
      this.showAddForm = false
      this.editingProduct = null
      this.formData = {
        id: '',
        name: '',
        building: '',
        purchasable: false,
        price: null,
        ingredients: [{ type: 'crop', name: '', count: 1 }]
      }
    },
    addIngredient() {
      this.formData.ingredients.push({ type: 'crop', name: '', count: 1 })
    },
    removeIngredient(index) {
      if (this.formData.ingredients.length > 1) {
        this.formData.ingredients.splice(index, 1)
      }
    },
    saveProduct() {
      // 유효성 검사
      if (!this.formData.id.trim() || !this.formData.name.trim() || !this.formData.building.trim()) {
        alert('ID, 이름, 건물을 모두 입력해주세요.')
        return
      }
      
      if (this.formData.ingredients.some(ing => !ing.name.trim() || ing.count < 1)) {
        alert('재료 정보를 올바르게 입력해주세요.')
        return
      }

      const product = {
        id: this.formData.id.trim(),
        name: this.formData.name.trim(),
        building: this.formData.building.trim(),
        purchasable: this.formData.purchasable || false,
        price: this.formData.purchasable && this.formData.price ? parseInt(this.formData.price) : null,
        ingredients: this.formData.ingredients.map(ing => ({
          type: ing.type,
          name: ing.name.trim(),
          count: parseInt(ing.count)
        }))
      }

      let result
      if (this.editingProduct) {
        result = updateProduct(this.editingProduct.id, product)
      } else {
        result = addProduct(product)
      }

      if (result.success) {
        this.$emit('product-deleted')
        this.refreshData()
        this.cancelForm()
      } else {
        alert(result.error || '저장에 실패했습니다.')
      }
    },
    editProduct(product) {
      this.$emit('edit-product', product)
    },
    confirmDelete(product) {
      if (!product.isCustom) {
        alert('기본 가공품은 삭제할 수 없습니다.')
        return
      }
      this.productToDelete = product
    },
    cancelDelete() {
      this.productToDelete = null
    },
    executeDelete() {
      if (this.productToDelete) {
        const result = deleteProduct(this.productToDelete.id)
        if (result.success) {
          this.$emit('product-deleted')
          this.refreshData()
          this.productToDelete = null
        } else {
          alert(result.error)
        }
      }
    }
  }
}
</script>

<style scoped>
.product-list {
  margin-bottom: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.list-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5em;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #66BB6A;
}

.add-btn {
  padding: 8px 16px;
  background: #66BB6A;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #558B2F;
}

/* 폼 섹션 */
.form-section {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.form-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9em;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #66BB6A;
}

.form-actions {
  flex-direction: row;
  gap: 10px;
}

.save-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.save-btn {
  background: #66BB6A;
  color: white;
}

.save-btn:hover {
  background: #558B2F;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.ingredients-section {
  margin-top: 15px;
}

.ingredients-section label {
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 10px;
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ingredient-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ing-type {
  width: 80px;
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
}

.ing-name {
  flex: 2;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
}

.ing-name:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.ing-count {
  width: 100px;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
}

.remove-ing-btn {
  padding: 8px 12px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.remove-ing-btn:hover:not(:disabled) {
  background: #cc0000;
}

.remove-ing-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-ing-btn {
  padding: 8px 16px;
  background: #66BB6A;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
  width: fit-content;
}

.add-ing-btn:hover {
  background: #558B2F;
}

/* 표 스타일 */
.table-container {
  overflow-x: auto;
  border: 2px solid rgba(129, 199, 132, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(129, 199, 132, 0.15);
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.products-table thead {
  background: linear-gradient(135deg, #66BB6A 0%, #558B2F 100%);
  color: white;
}

.products-table th,
.products-table td {
  text-align: center;
}

.products-table th {
  padding: 12px;
  font-weight: 600;
  border-bottom: 2px solid #2E7D32;
}

.products-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.products-table tbody tr:hover {
  background: rgba(200, 230, 201, 0.3);
}

.products-table tbody tr.custom-product {
  background: rgba(232, 245, 233, 0.5);
}

.products-table tbody tr.custom-product:hover {
  background: rgba(200, 230, 201, 0.4);
}

.products-table td {
  padding: 12px;
  vertical-align: middle;
}

.name-cell {
  font-weight: 600;
  color: #333;
  width: 150px;
  text-align: center;
}

.name-cell.clickable {
  cursor: pointer;
  user-select: none;
}

.name-cell.clickable:hover {
  background: rgba(129, 199, 132, 0.2);
}

.building-cell {
  color: #555;
  width: 120px;
  text-align: center;
}

.difficulty-cell {
  width: 80px;
  text-align: center;
}

.purchase-cell {
  width: 100px;
  text-align: center;
}

.ingredients-cell {
  min-width: 300px;
  text-align: center;
}

.difficulty-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.85em;
}

.purchase-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  background: #66BB6A;
  color: white;
  font-weight: 600;
  font-size: 0.85em;
}

.no-purchase {
  color: #999;
  font-style: italic;
}

.ingredients-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.ingredient-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
}

.ingredient-tag.crop {
  background: #e8f5e9;
  color: #2e7d32;
}

.ingredient-tag.product {
  background: #fff3e0;
  color: #e65100;
}

.ingredient-tag.item {
  background: #f3e5f5;
  color: #6a1b9a;
}

.actions-cell {
  width: 150px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 600;
  transition: background 0.3s;
}

.edit-btn {
  background: #66BB6A;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background: #558B2F;
}

.delete-btn {
  background: #ff4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #cc0000;
}

.edit-btn:disabled,
.delete-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1em;
}

/* 모달 */
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
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.modal-content p {
  margin: 0 0 10px 0;
  color: #666;
}

.modal-content .warning-text {
  color: #ff4444;
  font-weight: 600;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.confirm-btn,
.cancel-btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.confirm-btn {
  background: #ff4444;
  color: white;
}

.confirm-btn:hover {
  background: #cc0000;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .table-container {
    font-size: 0.9em;
  }
  
  .products-table th,
  .products-table td {
    padding: 8px;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-group {
    width: 100%;
  }
}
</style>
