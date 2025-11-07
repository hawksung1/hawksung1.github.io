<template>
  <div class="add-product-form">
    <div class="form-header">
      <h2>{{ isEditing ? '가공품 수정' : '가공품 추가' }}</h2>
      <button @click="toggleForm" class="toggle-btn">
        {{ showForm ? '닫기' : (isEditing ? '수정 중...' : '가공품 추가') }}
      </button>
    </div>
    
    <div v-if="showForm" class="form-content">
      <div class="form-group">
        <label for="product-id">ID (고유값):</label>
        <input
          id="product-id"
          v-model="formData.id"
          type="text"
          placeholder="예: bread"
          :disabled="isEditing"
          required
        />
        <small>영문, 숫자, 언더스코어만 사용 가능 {{ isEditing ? '(수정 불가)' : '' }}</small>
      </div>

      <div class="form-group">
        <label for="product-name">가공품 이름:</label>
        <input
          id="product-name"
          v-model="formData.name"
          type="text"
          placeholder="예: 빵"
          required
        />
      </div>

      <div class="form-group">
        <label for="product-building">건물 이름:</label>
        <input
          id="product-building"
          v-model="formData.building"
          type="text"
          placeholder="예: 제과소"
          required
        />
      </div>

      <div class="form-group">
        <label>재료:</label>
        <div v-for="(ingredient, index) in formData.ingredients" :key="index" class="ingredient-item">
          <select v-model="ingredient.type" class="ingredient-type">
            <option value="crop">작물</option>
            <option value="product">가공품</option>
          </select>
          <input
            v-model="ingredient.name"
            type="text"
            :placeholder="ingredient.type === 'crop' ? '작물명' : '가공품명'"
            class="ingredient-name"
            required
          />
          <input
            v-model.number="ingredient.count"
            type="number"
            min="1"
            placeholder="개수"
            class="ingredient-count"
            required
          />
          <button @click="removeIngredient(index)" class="remove-btn" type="button">삭제</button>
        </div>
        <button @click="addIngredient" class="add-ingredient-btn" type="button">재료 추가</button>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        가공품이 {{ isEditing ? '수정' : '추가' }}되었습니다!
      </div>

      <div class="form-actions">
        <button @click="handleSubmit" :disabled="!isValid" class="submit-btn">
          {{ isEditing ? '수정' : '추가' }}
        </button>
        <button @click="resetForm" class="reset-btn" type="button">
          {{ isEditing ? '취소' : '초기화' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { addProduct, updateProduct, getProduct, getAllProducts } from '../utils/dataManager.js'

export default {
  name: 'AddProductForm',
  emits: ['product-added'],
  props: {
    editingProduct: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      showForm: false,
      formData: {
        id: '',
        name: '',
        building: '',
        ingredients: [
          { type: 'crop', name: '', count: 1 }
        ]
      },
      error: null,
      success: false,
      isEditing: false
    }
  },
  watch: {
    editingProduct: {
      immediate: true,
      handler(newProduct) {
        if (newProduct) {
          this.loadProductForEdit(newProduct)
        }
      }
    }
  },
  computed: {
    isValid() {
      return (
        this.formData.id.trim() !== '' &&
        this.formData.name.trim() !== '' &&
        this.formData.building.trim() !== '' &&
        this.formData.ingredients.length > 0 &&
        this.formData.ingredients.every(ing => 
          ing.name.trim() !== '' && ing.count > 0
        ) &&
        /^[a-zA-Z0-9_]+$/.test(this.formData.id)
      )
    },
    availableProducts() {
      return getAllProducts().map(p => p.name)
    }
  },
  methods: {
    toggleForm() {
      this.showForm = !this.showForm
      if (!this.showForm) {
        this.resetForm()
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
    loadProductForEdit(product) {
      this.isEditing = true
      this.showForm = true
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
    handleSubmit() {
      if (!this.isValid) {
        this.error = '모든 필드를 올바르게 입력해주세요.'
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
      if (this.isEditing) {
        result = updateProduct(this.formData.id, product)
      } else {
        result = addProduct(product)
      }
      
      if (result.success) {
        this.success = true
        this.error = null
        this.$emit('product-added')
        
        // 2초 후 폼 초기화
        setTimeout(() => {
          this.resetForm()
          this.showForm = false
          this.isEditing = false
          this.$emit('edit-complete')
        }, 2000)
      } else {
        this.error = result.error || (this.isEditing ? '가공품 수정에 실패했습니다.' : '가공품 추가에 실패했습니다.')
        this.success = false
      }
    },
    resetForm() {
      this.formData = {
        id: '',
        name: '',
        building: '',
        ingredients: [
          { type: 'crop', name: '', count: 1 }
        ]
      }
      this.error = null
      this.success = false
      this.isEditing = false
    }
  }
}
</script>

<style scoped>
.add-product-form {
  margin-bottom: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.3em;
}

.toggle-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.toggle-btn:hover {
  background: #5568d3;
}

.form-content {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"] {
  width: 100%;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group small {
  display: block;
  margin-top: 4px;
  color: #999;
  font-size: 0.85em;
}

.ingredient-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.ingredient-type {
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 100px;
}

.ingredient-name {
  flex: 1;
}

.ingredient-count {
  width: 100px;
}

.remove-btn {
  padding: 10px 16px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.remove-btn:hover {
  background: #cc0000;
}

.add-ingredient-btn {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.3s;
}

.add-ingredient-btn:hover {
  background: #218838;
}

.error-message {
  padding: 12px;
  background: #fee;
  border: 2px solid #fcc;
  border-radius: 6px;
  color: #c33;
  margin-bottom: 15px;
}

.success-message {
  padding: 12px;
  background: #efe;
  border: 2px solid #cfc;
  border-radius: 6px;
  color: #3c3;
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  flex: 1;
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-btn {
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.reset-btn:hover {
  background: #5a6268;
}
</style>

