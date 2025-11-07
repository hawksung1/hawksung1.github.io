<template>
  <div class="product-list">
    <div class="list-header">
      <h2>가공품 목록</h2>
      <div class="filter-tabs">
        <button 
          @click="filter = 'all'" 
          :class="{ active: filter === 'all' }"
          class="filter-btn"
        >
          전체
        </button>
        <button 
          @click="filter = 'custom'" 
          :class="{ active: filter === 'custom' }"
          class="filter-btn"
        >
          내가 추가한 가공품
        </button>
      </div>
    </div>

    <div v-if="filteredProducts.length === 0" class="empty-message">
      가공품이 없습니다.
    </div>

    <div v-else class="products-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
      >
        <div class="product-header">
          <h3>{{ product.name }}</h3>
          <div class="product-badges">
            <span v-if="product.isCustom" class="badge custom">사용자 추가</span>
            <span class="badge building">{{ product.building }}</span>
          </div>
        </div>
        
        <div class="product-ingredients">
          <strong>재료:</strong>
          <ul>
            <li v-for="(ingredient, idx) in product.ingredients" :key="idx">
              {{ ingredient.name }} × {{ ingredient.count }}
              <span class="ingredient-type">({{ ingredient.type === 'crop' ? '작물' : '가공품' }})</span>
            </li>
          </ul>
        </div>

        <div v-if="product.isCustom" class="product-actions">
          <button @click="editProduct(product)" class="edit-btn">수정</button>
          <button @click="confirmDelete(product)" class="delete-btn">삭제</button>
        </div>
      </div>
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
import { getAllProducts, deleteProduct } from '../utils/dataManager.js'

export default {
  name: 'ProductList',
  emits: ['edit-product'],
  data() {
    return {
      filter: 'all',
      productToDelete: null
    }
  },
  computed: {
    allProducts() {
      return getAllProducts()
    },
    filteredProducts() {
      if (this.filter === 'custom') {
        return this.allProducts.filter(p => p.isCustom)
      }
      return this.allProducts
    }
  },
  methods: {
    editProduct(product) {
      this.$emit('edit-product', product)
    },
    confirmDelete(product) {
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

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  background: #f0f0f0;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: #e0e0e0;
}

.filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1em;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: box-shadow 0.3s, transform 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.product-header h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.2em;
}

.product-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: 600;
}

.badge.custom {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.building {
  background: #f3e5f5;
  color: #7b1fa2;
}

.product-ingredients {
  margin-bottom: 15px;
}

.product-ingredients strong {
  display: block;
  margin-bottom: 8px;
  color: #555;
}

.product-ingredients ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
}

.product-ingredients li {
  margin-bottom: 4px;
}

.ingredient-type {
  color: #999;
  font-size: 0.9em;
}

.product-actions {
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.edit-btn:hover {
  background: #5568d3;
}

.delete-btn {
  background: #ff4444;
  color: white;
}

.delete-btn:hover {
  background: #cc0000;
}

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
</style>

