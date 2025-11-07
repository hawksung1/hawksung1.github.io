<template>
  <div class="search-form">
    <h2>가공품 검색</h2>
    <div class="products-list">
      <div 
        v-for="(item, index) in productItems" 
        :key="index"
        class="product-item-row"
      >
        <input
          v-model="item.name"
          type="text"
          :placeholder="`가공품 이름 ${index + 1}`"
          class="product-name-input"
          @keyup.enter="handleSearch"
        />
        <input
          v-model.number="item.quantity"
          type="number"
          min="1"
          placeholder="개수"
          class="quantity-input"
          @keyup.enter="handleSearch"
        />
        <button 
          @click="removeProduct(index)" 
          class="remove-btn"
          :disabled="productItems.length === 1"
          type="button"
        >
          삭제
        </button>
      </div>
      <button @click="addProduct" class="add-product-btn" type="button">
        + 가공품 추가
      </button>
    </div>
    <button @click="handleSearch" :disabled="!isValid" class="search-btn">검색</button>
  </div>
</template>

<script>
import { getAllProducts } from '../utils/dataManager.js'

export default {
  name: 'SearchForm',
  emits: ['search'],
  data() {
    return {
      productItems: [
        { name: '', quantity: 1 }
      ]
    }
  },
  computed: {
    isValid() {
      return this.productItems.length > 0 && 
             this.productItems.every(item => 
               item.name.trim() !== '' && item.quantity > 0
             )
    }
  },
  methods: {
    addProduct() {
      this.productItems.push({ name: '', quantity: 1 })
    },
    removeProduct(index) {
      if (this.productItems.length > 1) {
        this.productItems.splice(index, 1)
      }
    },
    handleSearch() {
      if (this.isValid) {
        const products = this.productItems
          .filter(item => item.name.trim() !== '' && item.quantity > 0)
          .map(item => ({
            name: item.name.trim(),
            quantity: parseInt(item.quantity)
          }))
        
        this.$emit('search', products)
      }
    }
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 30px;
}

.search-form h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5em;
}

.products-list {
  margin-bottom: 20px;
}

.product-item-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.product-name-input {
  flex: 2;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.quantity-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.product-name-input:focus,
.quantity-input:focus {
  outline: none;
  border-color: #667eea;
}

.remove-btn {
  padding: 12px 20px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.remove-btn:hover:not(:disabled) {
  background: #cc0000;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-product-btn {
  width: 100%;
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 15px;
}

.add-product-btn:hover {
  background: #218838;
}

.search-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

