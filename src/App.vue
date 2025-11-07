<template>
  <div id="app">
    <header>
      <h1>레알팜 게임 핼퍼</h1>
    </header>
    <main>
      <Navigation :currentTab="currentTab" @tab-change="switchTab" />
      
      <!-- 검색 탭 -->
      <div v-if="currentTab === 'search'" class="tab-content">
        <SearchForm @search="handleSearch" />
        <ResultDisplay v-if="result" :result="result" />
      </div>
      
      <!-- 가공품 목록 탭 -->
      <div v-if="currentTab === 'list'" class="tab-content">
        <ProductList 
          @edit-product="handleEditProduct"
          @product-deleted="handleProductDeleted"
        />
      </div>
      
      <!-- 가공품 관리 탭 -->
      <div v-if="currentTab === 'add'" class="tab-content">
        <AddProductForm 
          :editingProduct="editingProduct"
          @product-added="handleProductAdded"
          @edit-complete="handleEditComplete"
        />
      </div>
      
      <!-- 데이터 관리 탭 -->
      <div v-if="currentTab === 'data'" class="tab-content">
        <DataManagement @data-changed="handleDataChanged" />
      </div>
    </main>
  </div>
</template>

<script>
import SearchForm from './components/SearchForm.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import AddProductForm from './components/AddProductForm.vue'
import ProductList from './components/ProductList.vue'
import Navigation from './components/Navigation.vue'
import DataManagement from './components/DataManagement.vue'
import { calculateRequirements, calculateMultipleRequirements, formatResult } from './utils/calculator.js'

export default {
  name: 'App',
  components: {
    SearchForm,
    ResultDisplay,
    AddProductForm,
    ProductList,
    Navigation,
    DataManagement
  },
  data() {
    return {
      currentTab: 'search',
      result: null,
      editingProduct: null
    }
  },
  methods: {
    switchTab(tabId) {
      this.currentTab = tabId
      // 탭 전환 시 편집 중인 제품 초기화
      if (tabId !== 'add') {
        this.editingProduct = null
      }
    },
    handleSearch(productList) {
      // productList가 배열인지 단일 객체인지 확인
      if (Array.isArray(productList)) {
        const calculated = calculateMultipleRequirements(productList)
        this.result = formatResult(calculated)
      } else {
        // 기존 단일 가공품 검색 (하위 호환성)
        const { productName, quantity } = productList
        const calculated = calculateRequirements(productName, quantity)
        this.result = formatResult(calculated)
      }
    },
    handleProductAdded() {
      // 가공품이 추가되면 결과를 다시 계산 (현재 검색 결과가 있는 경우)
      if (this.result) {
        if (this.result.targetProducts && this.result.targetProducts.length > 0) {
          // 여러 가공품인 경우
          const calculated = calculateMultipleRequirements(this.result.targetProducts)
          this.result = formatResult(calculated)
        } else if (this.result.targetProduct) {
          // 단일 가공품인 경우
          const calculated = calculateRequirements(
            this.result.targetProduct,
            this.result.targetQuantity
          )
          this.result = formatResult(calculated)
        }
      }
    },
    handleEditProduct(product) {
      this.editingProduct = product
      this.currentTab = 'add'
    },
    handleEditComplete() {
      this.editingProduct = null
    },
    handleProductDeleted() {
      // 가공품 삭제 시 결과 재계산
      this.handleProductAdded()
    },
    handleDataChanged() {
      // 데이터 변경 시 결과 재계산
      this.handleProductAdded()
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

header h1 {
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

main {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}
</style>

