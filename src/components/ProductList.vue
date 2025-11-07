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
            <select v-model="ing.type" class="ing-type">
              <option value="crop">작물</option>
              <option value="product">가공품</option>
            </select>
            <input 
              v-model="ing.name" 
              type="text" 
              placeholder="이름"
              class="ing-name"
            />
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
            <th>재료</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="product in filteredProducts" 
            :key="product.id"
            :class="{ 'custom-product': product.isCustom }"
          >
            <td class="name-cell">{{ product.name }}</td>
            <td class="building-cell">{{ product.building }}</td>
            <td class="ingredients-cell">
              <div class="ingredients-display">
                <span 
                  v-for="(ing, idx) in product.ingredients" 
                  :key="idx"
                  class="ingredient-tag"
                  :class="ing.type"
                >
                  {{ ing.name }} × {{ ing.count }}
                </span>
              </div>
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button 
                  @click="startEdit(product)" 
                  class="edit-btn"
                  :disabled="!product.isCustom"
                  :title="product.isCustom ? '수정' : '기본 가공품은 수정할 수 없습니다'"
                >
                  수정
                </button>
                <button 
                  @click="confirmDelete(product)" 
                  class="delete-btn"
                  :disabled="!product.isCustom"
                  :title="product.isCustom ? '삭제' : '기본 가공품은 삭제할 수 없습니다'"
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
        <h3>가공품 삭제</h3>
        <p>정말로 "{{ productToDelete.name }}"을(를) 삭제하시겠습니까?</p>
        <div class="modal-actions">
          <button @click="executeDelete" class="confirm-btn">삭제</button>
          <button @click="cancelDelete" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../utils/dataManager.js'

export default {
  name: 'ProductList',
  emits: ['edit-product', 'product-deleted'],
  data() {
    return {
      searchQuery: '',
      productToDelete: null,
      showAddForm: false,
      editingProduct: null,
      formData: {
        id: '',
        name: '',
        building: '',
        ingredients: [{ type: 'crop', name: '', count: 1 }]
      }
    }
  },
  computed: {
    allProducts() {
      return getAllProducts().sort((a, b) => a.name.localeCompare(b.name))
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
    startEdit(product) {
      if (!product.isCustom) return
      this.editingProduct = product
      this.showAddForm = true
      this.formData = {
        id: product.id,
        name: product.name,
        building: product.building,
        ingredients: product.ingredients.map(ing => ({
          type: ing.type,
          name: ing.name,
          count: ing.count
        }))
      }
    },
    cancelForm() {
      this.showAddForm = false
      this.editingProduct = null
      this.formData = {
        id: '',
        name: '',
        building: '',
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
        this.cancelForm()
      } else {
        alert(result.error || '저장에 실패했습니다.')
      }
    },
    editProduct(product) {
      this.$emit('edit-product', product)
    },
    confirmDelete(product) {
      if (!product.isCustom) return
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
  border-color: #667eea;
}

.add-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #218838;
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
  border-color: #667eea;
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
  background: #667eea;
  color: white;
}

.save-btn:hover {
  background: #5568d3;
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
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
  width: fit-content;
}

.add-ing-btn:hover {
  background: #218838;
}

/* 표 스타일 */
.table-container {
  overflow-x: auto;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.products-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.products-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #555;
}

.products-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.products-table tbody tr:hover {
  background: #f5f5f5;
}

.products-table tbody tr.custom-product {
  background: #f0f8ff;
}

.products-table tbody tr.custom-product:hover {
  background: #e0f0ff;
}

.products-table td {
  padding: 12px;
  vertical-align: top;
}

.name-cell {
  font-weight: 600;
  color: #333;
  width: 150px;
}

.building-cell {
  color: #555;
  width: 120px;
}

.ingredients-cell {
  min-width: 300px;
}

.ingredients-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

.actions-cell {
  width: 150px;
}

.action-buttons {
  display: flex;
  gap: 8px;
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
  background: #667eea;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background: #5568d3;
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
  margin: 0 0 20px 0;
  color: #666;
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
