<template>
  <div class="search-form">
    <h2>가공품 검색</h2>
    <div class="form-group">
      <label for="product-name">가공품 이름:</label>
      <input
        id="product-name"
        v-model="productName"
        type="text"
        placeholder="예: A 가공품"
        @keyup.enter="handleSearch"
      />
    </div>
    <div class="form-group">
      <label for="quantity">개수:</label>
      <input
        id="quantity"
        v-model.number="quantity"
        type="number"
        min="1"
        placeholder="1"
        @keyup.enter="handleSearch"
      />
    </div>
    <button @click="handleSearch" :disabled="!isValid">검색</button>
  </div>
</template>

<script>
import productsData from '../data/products.json'

export default {
  name: 'SearchForm',
  emits: ['search'],
  data() {
    return {
      productName: '',
      quantity: 1,
      products: productsData.products
    }
  },
  computed: {
    isValid() {
      return this.productName.trim() !== '' && this.quantity > 0
    },
    productNames() {
      return this.products.map(p => p.name)
    }
  },
  methods: {
    handleSearch() {
      if (this.isValid) {
        this.$emit('search', {
          productName: this.productName.trim(),
          quantity: this.quantity
        })
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

button {
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

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

