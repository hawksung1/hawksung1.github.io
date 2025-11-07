<template>
  <nav class="navigation">
    <ul class="nav-list">
      <li 
        v-for="(item, index) in menuItems" 
        :key="item.id"
        :class="{ active: currentTab === item.id }"
        @click="switchTab(item.id)"
        class="nav-item"
        :title="`${item.label} (${index + 1}번 키 또는 Ctrl+${index + 1})`"
      >
        {{ item.label }}
        <span class="shortcut-hint">({{ index + 1 }})</span>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Navigation',
  props: {
    currentTab: {
      type: String,
      required: true
    }
  },
  emits: ['tab-change'],
  data() {
    return {
      menuItems: [
        { id: 'search', label: '검색' },
        { id: 'list', label: '가공품 목록' },
        { id: 'data', label: '데이터 관리' }
      ]
    }
  },
  methods: {
    switchTab(tabId) {
      this.$emit('tab-change', tabId)
    }
  }
}
</script>

<style scoped>
.navigation {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 10px;
}

.nav-item {
  flex: 1;
  padding: 12px 20px;
  text-align: center;
  cursor: pointer;
  border-radius: 6px;
  font-weight: 600;
  color: #666;
  transition: all 0.3s;
  user-select: none;
}

.nav-item:hover {
  background: #f0f0f0;
  color: #333;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-item .shortcut-hint {
  font-size: 0.7em;
  opacity: 0.8;
  margin-left: 5px;
  font-weight: normal;
}

@media (max-width: 768px) {
  .nav-item {
    padding: 10px 12px;
    font-size: 0.9em;
  }
}
</style>

