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
            v-for="crop in result.formattedCrops"
            :key="crop.name"
            class="crop-item clickable"
            @click="showCropDetails(crop.name)"
            :title="'클릭하여 ' + crop.name + '이(가) 필요한 가공품 보기'"
          >
            <span class="crop-name">{{ crop.name }}</span>
            <span class="crop-count">{{ crop.count }}개</span>
          </div>
        </div>
        <p v-else class="no-data">필요한 작물이 없습니다.</p>
      </div>

      <div class="result-section">
        <h3>필요한 가공품</h3>
        <div v-if="result.formattedProducts && result.formattedProducts.length > 0" class="products-list">
          <div
            v-for="product in result.formattedProducts"
            :key="product.name"
            class="product-item clickable"
            @click="showProductDetails(product.name)"
            :title="'클릭하여 ' + product.name + '의 재료 보기'"
          >
            <span class="product-name">{{ product.name }}</span>
            <span class="product-count">{{ product.count }}개</span>
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
      productIngredients: null
    }
  },
  methods: {
    showCropDetails(cropName) {
      const products = getAllProducts()
      const related = findProductsUsingCrop(products, cropName)
      
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
  color: #667eea;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.crops-list,
.products-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.crop-item,
.product-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  border-left: 4px solid #667eea;
  transition: all 0.2s ease;
}

.crop-item.clickable,
.product-item.clickable {
  cursor: pointer;
}

.crop-item.clickable:hover,
.product-item.clickable:hover {
  background: #e8e8ff;
  transform: translateX(3px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.crop-name,
.product-name {
  font-weight: 600;
  color: #333;
}

.crop-count,
.product-count {
  color: #667eea;
  font-weight: 600;
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
  border-left: 4px solid #764ba2;
}

.building-name {
  font-weight: 600;
  color: #764ba2;
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
  color: #667eea;
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
  border-left: 4px solid #764ba2;
}

.product-building {
  background: #764ba2;
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
  border-left: 4px solid #667eea;
}

.ingredient-type {
  background: #667eea;
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
  color: #667eea;
  font-weight: 600;
}

.no-related {
  color: #999;
  font-style: italic;
  padding: 20px;
  text-align: center;
}
</style>

