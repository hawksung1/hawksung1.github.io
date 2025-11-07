<template>
  <div class="result-display" v-if="result">
    <div v-if="result.error" class="error-message">
      <p>{{ result.error }}</p>
    </div>
    
    <div v-else>
      <div class="result-header">
        <h2>계산 결과</h2>
        <p class="target-info">
          <strong>{{ result.targetProduct }}</strong> {{ result.targetQuantity }}개 생산 필요
        </p>
      </div>

      <div class="result-section">
        <h3>필요한 작물</h3>
        <div v-if="result.formattedCrops && result.formattedCrops.length > 0" class="crops-list">
          <div
            v-for="crop in result.formattedCrops"
            :key="crop.name"
            class="crop-item"
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
            class="product-item"
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
  </div>
</template>

<script>
import RecipeChain from './RecipeChain.vue'

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
</style>

