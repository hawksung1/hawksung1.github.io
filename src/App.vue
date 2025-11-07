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
          @product-deleted="handleProductDeleted"
        />
      </div>
      
      <!-- 작물 목록 탭 -->
      <div v-if="currentTab === 'crops'" class="tab-content">
        <CropList @data-changed="handleDataChanged" />
      </div>
      
      <!-- 아이템 목록 탭 -->
      <div v-if="currentTab === 'items'" class="tab-content">
        <ItemList @data-changed="handleDataChanged" />
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
import ProductList from './components/ProductList.vue'
import CropList from './components/CropList.vue'
import ItemList from './components/ItemList.vue'
import Navigation from './components/Navigation.vue'
import DataManagement from './components/DataManagement.vue'
import { calculateRequirements, calculateMultipleRequirements, formatResult } from './utils/calculator.js'

export default {
  name: 'App',
  components: {
    SearchForm,
    ResultDisplay,
    ProductList,
    CropList,
    ItemList,
    Navigation,
    DataManagement
  },
  data() {
    return {
      currentTab: 'search',
      result: null
    }
  },
  methods: {
    switchTab(tabId) {
      this.currentTab = tabId
    },
    handleKeyboardShortcuts(event) {
      // 입력 필드에 포커스가 있을 때는 숫자 키 무시 (입력 방해 방지)
      const activeElement = document.activeElement
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.isContentEditable
      )
      
      // Ctrl/Cmd + 숫자 키로 탭 이동
      if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '5') {
        event.preventDefault()
        const tabIndex = parseInt(event.key) - 1
        const tabs = ['search', 'list', 'crops', 'items', 'data']
        if (tabs[tabIndex]) {
          this.switchTab(tabs[tabIndex])
        }
        return
      }
      
      // 입력 필드에 포커스가 없을 때만 숫자 키로 탭 이동
      if (!isInputFocused && event.key >= '1' && event.key <= '5' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
        event.preventDefault()
        const tabIndex = parseInt(event.key) - 1
        const tabs = ['search', 'list', 'crops', 'items', 'data']
        if (tabs[tabIndex]) {
          this.switchTab(tabs[tabIndex])
        }
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
    handleProductDeleted() {
      // 가공품 삭제 시 결과 재계산
      this.handleProductAdded()
    },
    handleDataChanged() {
      // 데이터 변경 시 결과 재계산
      this.handleProductAdded()
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleKeyboardShortcuts)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyboardShortcuts)
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Gowun Dodum', 'Noto Sans KR', sans-serif;
  background: linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 30%, #FFF9C4 60%, #FFE0B2 100%);
  min-height: 100vh;
  background-attachment: fixed;
  color: #3E4A2F;
  letter-spacing: 0.01em;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  color: #558B2F;
  margin-bottom: 30px;
}

header h1 {
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
  font-weight: 700;
  background: linear-gradient(135deg, #66BB6A 0%, #81C784 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Jua', 'Gowun Dodum', sans-serif;
  letter-spacing: 0.08em;
  text-transform: none;
}

main {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(85, 139, 47, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(129, 199, 132, 0.3);
}

h2, h3, h4 {
  font-family: 'Jua', 'Gowun Dodum', sans-serif;
  color: #4C6F2C;
  letter-spacing: 0.05em;
}

button,
.nav-item,
.search-btn,
.add-product-btn,
.remove-btn {
  font-family: 'Jua', 'Gowun Dodum', sans-serif;
  letter-spacing: 0.04em;
}

input,
textarea,
select {
  font-family: 'Gowun Dodum', 'Noto Sans KR', sans-serif;
  letter-spacing: 0.02em;
}

.tab-content {
  font-family: 'Gowun Dodum', 'Noto Sans KR', sans-serif;
}
</style>

