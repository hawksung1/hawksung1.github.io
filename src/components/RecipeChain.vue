<template>
  <div class="recipe-chain" v-if="dependencyChain && dependencyChain.length > 0">
    <h3>의존성 체인</h3>
    <div class="chain-container">
      <div
        v-for="(product, index) in dependencyChain"
        :key="product.id || product.name"
        class="chain-item"
      >
        <div class="chain-product">
          <div class="product-box">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-building">{{ product.building }}</div>
          </div>
        </div>
        <div v-if="index < dependencyChain.length - 1" class="chain-arrow">→</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecipeChain',
  props: {
    dependencyChain: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>
.recipe-chain {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
}

.recipe-chain h3 {
  color: #667eea;
  margin-bottom: 20px;
  font-size: 1.2em;
}

.chain-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  overflow-x: auto;
}

.chain-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.chain-product {
  flex-shrink: 0;
}

.product-box {
  padding: 12px 18px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 8px;
  min-width: 120px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.3);
}

.product-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.product-building {
  font-size: 0.85em;
  color: #999;
}

.chain-arrow {
  font-size: 1.5em;
  color: #667eea;
  font-weight: bold;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .chain-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .chain-arrow {
    transform: rotate(90deg);
    text-align: center;
  }
}
</style>

