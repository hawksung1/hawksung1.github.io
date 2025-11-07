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
        { id: 'crops', label: '작물 목록' },
        { id: 'items', label: '아이템 목록' },
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
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(129, 199, 132, 0.25);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(200, 230, 201, 0.5);
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
  border-radius: 12px;
  font-weight: 600;
  color: #689F38;
  transition: all 0.3s;
  user-select: none;
}

.nav-item:hover {
  background: rgba(200, 230, 201, 0.4);
  color: #558B2F;
}

.nav-item.active {
  background: linear-gradient(135deg, #A5D6A7 0%, #C8E6C9 100%);
  color: #2E7D32;
  box-shadow: 0 4px 12px rgba(129, 199, 132, 0.4);
  border: 1px solid rgba(129, 199, 132, 0.5);
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

