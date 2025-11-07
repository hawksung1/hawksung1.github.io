<template>
  <div class="item-list">
    <div class="list-header">
      <h2>아이템 목록</h2>
      <div class="header-actions">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="아이템 이름으로 검색..."
            class="search-input"
          />
        </div>
        <button @click="showAddForm = true" class="add-btn">
          + 아이템 추가
        </button>
      </div>
    </div>

    <!-- 추가 폼 -->
    <div v-if="showAddForm && !editingItem" class="form-section">
      <h3>아이템 추가</h3>
      <div class="form-row">
        <div class="form-group">
          <label>이름:</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="예: 응고제"
          />
        </div>
        <div class="form-group">
          <label>난이도:</label>
          <input 
            v-model.number="formData.difficulty" 
            type="number" 
            min="0"
            value="0"
            disabled
            title="아이템은 난이도가 항상 0입니다"
          />
        </div>
        <div class="form-group form-actions">
          <button @click="saveItem" class="save-btn">저장</button>
          <button @click="cancelForm" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>

    <!-- 표 형식 목록 -->
    <div v-if="filteredItems.length === 0" class="empty-message">
      {{ searchQuery ? '검색 결과가 없습니다.' : '아이템이 없습니다.' }}
    </div>

    <div v-else class="table-container">
      <table class="items-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>난이도</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in filteredItems" 
            :key="item.name"
            :class="{ 'custom-item': item.isCustom, 'editing': editingItem === item.name }"
            :style="getDifficultyStyle(0)"
          >
            <td 
              class="name-cell"
              @dblclick="startEdit(item)"
              :title="'더블클릭하여 수정'"
            >
              <span v-if="editingItem !== item.name">{{ item.name }}</span>
              <input 
                v-else
                v-model="editFormData.name" 
                type="text" 
                class="inline-input"
                :disabled="true"
                :title="'기본 아이템은 이름을 변경할 수 없습니다'"
                @keydown.enter="saveEditItem(item)"
                @keydown.esc="cancelEdit"
              />
            </td>
            <td class="difficulty-cell">
              <span class="difficulty-badge" :style="getDifficultyBadgeStyle(0)">
                0
              </span>
            </td>
            <td class="actions-cell">
              <div class="action-buttons" v-if="editingItem !== item.name && item.isCustom">
                <button 
                  @click="confirmDelete(item)" 
                  class="delete-btn"
                  title="삭제"
                >
                  삭제
                </button>
              </div>
              <div class="action-buttons" v-else-if="editingItem === item.name">
                <button 
                  @click="saveEditItem(item)" 
                  class="save-btn-small"
                >
                  저장
                </button>
                <button 
                  @click="cancelEdit" 
                  class="cancel-btn-small"
                >
                  취소
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="itemToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>⚠️ 아이템 삭제 확인</h3>
        <p><strong>"{{ itemToDelete.name }}"</strong>을(를) 정말로 삭제하시겠습니까?</p>
        <p class="warning-text">이 작업은 되돌릴 수 없습니다.</p>
        <div class="modal-actions">
          <button @click="executeDelete" class="confirm-btn">네, 삭제합니다</button>
          <button @click="cancelDelete" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isItem } from '../utils/dataManager.js'

const DEFAULT_ITEMS = ['응고제', '소금', '발효액', '이스트', '달걀', '우유', '뽕잎']
const ITEMS_STORAGE_KEY = 'realfarm_custom_items'

export default {
  name: 'ItemList',
  emits: ['data-changed'],
  data() {
    return {
      searchQuery: '',
      itemToDelete: null,
      showAddForm: false,
      editingItem: null, // 편집 중인 아이템 이름 (null이면 편집 모드 아님)
      items: [],
      formData: {
        name: '',
        difficulty: 0
      },
      editFormData: {
        name: '',
        difficulty: 0
      }
    }
  },
  created() {
    this.refreshData()
  },
  computed: {
    allItems() {
      return this.items
    },
    filteredItems() {
      if (!this.searchQuery.trim()) {
        return this.allItems
      }
      
      const query = this.searchQuery.toLowerCase().trim()
      return this.allItems.filter(item => 
        item.name.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    refreshData() {
      const defaultItems = DEFAULT_ITEMS.map(name => ({
        name,
        difficulty: 0,
        isCustom: false
      }))
      const customItems = this.getCustomItems().map(item => ({
        ...item,
        difficulty: 0,
        isCustom: true
      }))

      const itemMap = new Map()
      defaultItems.forEach(item => {
        itemMap.set(item.name, item)
      })
      customItems.forEach(item => {
        itemMap.set(item.name, item)
      })

      this.items = Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    },
    getCustomItems() {
      try {
        const stored = localStorage.getItem(ITEMS_STORAGE_KEY)
        return stored ? JSON.parse(stored) : []
      } catch (e) {
        console.error('Failed to load custom items:', e)
        return []
      }
    },
    saveCustomItems(items) {
      try {
        localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
        return true
      } catch (e) {
        console.error('Failed to save custom items:', e)
        return false
      }
    },
    getDifficultyStyle(difficulty) {
      // 아이템은 항상 난이도 0
      return {
        backgroundColor: `rgb(240, 248, 255)`
      }
    },
    getDifficultyBadgeStyle(difficulty) {
      return {
        backgroundColor: `rgb(102, 126, 234)`
      }
    },
    startEdit(item) {
      if (this.editingItem === item.name) return // 이미 편집 중이면 무시
      this.editingItem = item.name
      this.editFormData = {
        name: item.name,
        difficulty: 0
      }
    },
    cancelEdit() {
      this.editingItem = null
      this.editFormData = {
        name: '',
        difficulty: 0
      }
    },
    cancelForm() {
      this.showAddForm = false
      this.formData = {
        name: '',
        difficulty: 0
      }
    },
    saveEditItem(item) {
      // 아이템은 이름만 수정 가능 (난이도는 항상 0)
      const customItems = this.getCustomItems()
      const itemIndex = customItems.findIndex(i => i.name === item.name)
      
      const updatedItem = {
        name: item.name, // 이름은 변경 불가
        difficulty: 0 // 아이템은 항상 난이도 0
      }

      if (item.isCustom) {
        // 사용자 추가 아이템 수정
        if (itemIndex >= 0) {
          customItems[itemIndex] = updatedItem
        } else {
          customItems.push(updatedItem)
        }
      } else {
        // 기본 아이템은 수정 불가 (이름 변경 불가)
        // 하지만 사용자 오버라이드를 위해 저장
        if (itemIndex >= 0) {
          customItems[itemIndex] = updatedItem
        } else {
          // 기본 아이템은 수정할 수 없음
          this.cancelEdit()
          return
        }
      }

      const saved = this.saveCustomItems(customItems)
      if (saved) {
        this.$emit('data-changed')
        this.refreshData()
        this.cancelEdit()
      } else {
        alert('저장에 실패했습니다.')
      }
    },
    saveItem() {
      if (!this.formData.name.trim()) {
        alert('이름을 입력해주세요.')
        return
      }

      const customItems = this.getCustomItems()
      const itemIndex = customItems.findIndex(i => i.name === this.formData.name.trim())
      
      // 추가
      if (itemIndex >= 0) {
        alert('이미 존재하는 아이템입니다.')
        return
      }

      const item = {
        name: this.formData.name.trim(),
        difficulty: 0 // 아이템은 항상 난이도 0
      }

      customItems.push(item)

      const saved = this.saveCustomItems(customItems)
      if (saved) {
        this.$emit('data-changed')
        this.refreshData()
        this.cancelForm()
      } else {
        alert('저장에 실패했습니다.')
      }
    },
    confirmDelete(item) {
      if (!item.isCustom) {
        alert('기본 아이템은 삭제할 수 없습니다.')
        return
      }
      this.itemToDelete = item
    },
    cancelDelete() {
      this.itemToDelete = null
    },
    executeDelete() {
      if (this.itemToDelete) {
        const customItems = this.getCustomItems()
        const filtered = customItems.filter(i => i.name !== this.itemToDelete.name)
        const saved = this.saveCustomItems(filtered)
        if (saved) {
          this.$emit('data-changed')
          this.refreshData()
          this.itemToDelete = null
        } else {
          alert('삭제에 실패했습니다.')
        }
      }
    }
  }
}
</script>

<style scoped>
.item-list {
  margin-bottom: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.list-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5em;
}

.header-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #66BB6A;
}

.add-btn {
  padding: 8px 16px;
  background: #66BB6A;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #558B2F;
}

.form-section {
  background: #f9f9f9;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.form-section h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.form-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9em;
}

.form-group input {
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #66BB6A;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  flex-direction: row;
  gap: 10px;
}

.save-btn,
.cancel-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.save-btn {
  background: #66BB6A;
  color: white;
}

.save-btn:hover {
  background: #558B2F;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.inline-input {
  width: 100%;
  padding: 6px 10px;
  border: 2px solid #66BB6A;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.inline-input:focus {
  outline: none;
  border-color: #558B2F;
}

.inline-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.save-btn-small,
.cancel-btn-small {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  font-weight: 600;
  transition: background 0.3s;
}

.save-btn-small {
  background: #66BB6A;
  color: white;
}

.save-btn-small:hover {
  background: #558B2F;
}

.cancel-btn-small {
  background: #6c757d;
  color: white;
}

.cancel-btn-small:hover {
  background: #5a6268;
}

.items-table tbody tr.editing {
  background: rgba(200, 230, 201, 0.4) !important;
  border: 2px solid rgba(102, 187, 106, 0.6);
}

.table-container {
  overflow-x: auto;
  border: 2px solid rgba(129, 199, 132, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(129, 199, 132, 0.15);
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.items-table thead {
  background: linear-gradient(135deg, #66BB6A 0%, #558B2F 100%);
  color: white;
}

.items-table th,
.items-table td {
  text-align: center;
}

.items-table th {
  padding: 12px;
  font-weight: 600;
  border-bottom: 2px solid #2E7D32;
}

.items-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.items-table tbody tr:hover {
  background: rgba(200, 230, 201, 0.3);
}

.items-table tbody tr.custom-item {
  background: rgba(232, 245, 233, 0.5);
}

.items-table td {
  padding: 12px;
  vertical-align: middle;
}

.name-cell {
  font-weight: 600;
  color: #333;
  width: 200px;
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.name-cell:hover {
  background: rgba(129, 199, 132, 0.2);
}

.difficulty-cell {
  width: 120px;
  text-align: center;
}

.difficulty-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.85em;
}

.actions-cell {
  width: 150px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85em;
  font-weight: 600;
  transition: background 0.3s;
}

.edit-btn {
  background: #66BB6A;
  color: white;
}

.edit-btn:hover {
  background: #558B2F;
}

.delete-btn {
  background: #ff4444;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #cc0000;
}

.delete-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 1.1em;
}

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
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.modal-content p {
  margin: 0 0 10px 0;
  color: #666;
}

.modal-content .warning-text {
  color: #ff4444;
  font-weight: 600;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.confirm-btn,
.cancel-btn {
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.confirm-btn {
  background: #ff4444;
  color: white;
}

.confirm-btn:hover {
  background: #cc0000;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}
</style>

