<template>
  <div id="app">
    <header>
      <h1>레알팜 게임 핼퍼</h1>
    </header>
    <main>
      <SearchForm @search="handleSearch" />
      <ResultDisplay v-if="result" :result="result" />
    </main>
  </div>
</template>

<script>
import SearchForm from './components/SearchForm.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import { calculateRequirements, formatResult } from './utils/calculator.js'

export default {
  name: 'App',
  components: {
    SearchForm,
    ResultDisplay
  },
  data() {
    return {
      result: null
    }
  },
  methods: {
    handleSearch(searchData) {
      const { productName, quantity } = searchData
      const calculated = calculateRequirements(productName, quantity)
      this.result = formatResult(calculated)
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

