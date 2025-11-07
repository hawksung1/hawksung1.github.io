<template>
  <div class="crop-list">
    <div class="list-header">
      <h2>작물 목록</h2>
      <div class="header-actions">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="작물 이름으로 검색..."
            class="search-input"
          />
        </div>
        <button @click="showAddForm = true" class="add-btn">
          + 작물 추가
        </button>
      </div>
    </div>

    <!-- 추가 폼 -->
    <div v-if="showAddForm && !editingCrop" class="form-section">
      <h3>작물 추가</h3>
      <div class="form-row">
        <div class="form-group">
          <label>이름:</label>
          <input 
            v-model="formData.name" 
            type="text" 
            placeholder="예: 벼"
          />
        </div>
        <div class="form-group">
          <label>난이도:</label>
          <input 
            v-model.number="formData.difficulty" 
            type="number" 
            min="0"
            placeholder="예: 1"
          />
        </div>
        <div class="form-group form-actions">
          <button @click="saveCrop" class="save-btn">저장</button>
          <button @click="cancelForm" class="cancel-btn">취소</button>
        </div>
      </div>
    </div>

    <!-- 표 형식 목록 -->
    <div v-if="filteredCrops.length === 0" class="empty-message">
      {{ searchQuery ? '검색 결과가 없습니다.' : '작물이 없습니다.' }}
    </div>

    <div v-else class="table-container">
      <table class="crops-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>난이도</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="crop in filteredCrops" 
            :key="crop.name"
            :class="{ 'custom-crop': crop.isCustom, 'editing': editingCrop === crop.name }"
            :style="getDifficultyStyle(editingCrop === crop.name ? editFormData.difficulty : crop.difficulty)"
          >
            <td 
              class="name-cell"
              @dblclick="startEdit(crop)"
              :title="'더블클릭하여 수정'"
            >
              <span v-if="editingCrop !== crop.name">{{ crop.name }}</span>
              <input 
                v-else
                v-model="editFormData.name" 
                type="text" 
                class="inline-input"
                :disabled="true"
                :title="'기본 작물은 이름을 변경할 수 없습니다'"
                @keydown.enter="saveEditCrop(crop)"
                @keydown.esc="cancelEdit"
              />
            </td>
            <td 
              class="difficulty-cell"
              @dblclick="startEdit(crop)"
              :title="'더블클릭하여 수정'"
            >
              <span v-if="editingCrop !== crop.name" class="difficulty-badge" :style="getDifficultyBadgeStyle(crop.difficulty)">
                {{ crop.difficulty }}
              </span>
              <input 
                v-else
                v-model.number="editFormData.difficulty" 
                type="number" 
                min="0"
                class="inline-input inline-number"
                @keydown.enter="saveEditCrop(crop)"
                @keydown.esc="cancelEdit"
                ref="difficultyInput"
              />
            </td>
            <td class="actions-cell">
              <div class="action-buttons" v-if="editingCrop !== crop.name && crop.isCustom">
                <button 
                  @click="confirmDelete(crop)" 
                  class="delete-btn"
                  title="삭제"
                >
                  삭제
                </button>
              </div>
              <div class="action-buttons" v-else-if="editingCrop === crop.name">
                <button 
                  @click="saveEditCrop(crop)" 
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
    <div v-if="cropToDelete" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>⚠️ 작물 삭제 확인</h3>
        <p><strong>"{{ cropToDelete.name }}"</strong>을(를) 정말로 삭제하시겠습니까?</p>
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
import { getAllCrops, getCustomCrops, saveCustomCrops } from '../utils/dataManager.js'

export default {
  name: 'CropList',
  emits: ['data-changed'],
  data() {
    return {
      searchQuery: '',
      cropToDelete: null,
      showAddForm: false,
      editingCrop: null, // 편집 중인 작물 이름 (null이면 편집 모드 아님)
      crops: [],
      formData: {
        name: '',
        difficulty: 1
      },
      editFormData: {
        name: '',
        difficulty: 1
      }
    }
  },
  created() {
    this.refreshData()
  },
  computed: {
    allCrops() {
      return this.crops
    },
    filteredCrops() {
      if (!this.searchQuery.trim()) {
        return this.allCrops
      }
      
      const query = this.searchQuery.toLowerCase().trim()
      return this.allCrops.filter(crop => 
        crop.name.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    refreshData() {
      this.crops = getAllCrops().sort((a, b) => a.name.localeCompare(b.name))
    },
    getDifficultyStyle(difficulty) {
      const maxDifficulty = 100
      const normalized = Math.min(difficulty / maxDifficulty, 1)
      
      const baseR = 232
      const baseG = 245
      const baseB = 233
      
      const r = Math.floor(baseR - (normalized * 50))
      const g = Math.floor(baseG - (normalized * 40))
      const b = Math.floor(baseB - (normalized * 30))
      
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`
      }
    },
    getDifficultyBadgeStyle(difficulty) {
      const maxDifficulty = 100
      const normalized = Math.min(difficulty / maxDifficulty, 1)
      
      const baseR = 102
      const baseG = 187
      const baseB = 106
      
      const r = Math.floor(baseR - (normalized * 30))
      const g = Math.floor(baseG - (normalized * 50))
      const b = Math.floor(baseB - (normalized * 30))
      
      return {
        backgroundColor: `rgb(${r}, ${g}, ${b})`
      }
    },
    startEdit(crop) {
      if (this.editingCrop === crop.name) return // 이미 편집 중이면 무시
      this.editingCrop = crop.name
      this.editFormData = {
        name: crop.name,
        difficulty: crop.difficulty || 1
      }
      this.$nextTick(() => {
        // 난이도 입력 필드에 포커스
        const inputs = this.$refs.difficultyInput
        if (inputs && inputs.length > 0) {
          const index = this.filteredCrops.findIndex(c => c.name === crop.name)
          if (inputs[index]) {
            inputs[index].focus()
            inputs[index].select()
          }
        }
      })
    },
    cancelEdit() {
      this.editingCrop = null
      this.editFormData = {
        name: '',
        difficulty: 1
      }
    },
    cancelForm() {
      this.showAddForm = false
      this.formData = {
        name: '',
        difficulty: 1
      }
    },
    saveEditCrop(crop) {
      if (this.editFormData.difficulty < 0) {
        alert('난이도를 올바르게 입력해주세요.')
        return
      }

      const customCrops = getCustomCrops()
      const cropIndex = customCrops.findIndex(c => c.name === crop.name)
      
      const updatedCrop = {
        name: crop.name, // 이름은 변경 불가
        difficulty: parseInt(this.editFormData.difficulty) || 1
      }

      if (crop.isCustom) {
        // 사용자 추가 작물 수정
        if (cropIndex >= 0) {
          customCrops[cropIndex] = updatedCrop
        } else {
          customCrops.push(updatedCrop)
        }
      } else {
        // 기본 작물의 난이도만 수정 (사용자 오버라이드)
        if (cropIndex >= 0) {
          customCrops[cropIndex] = updatedCrop
        } else {
          customCrops.push(updatedCrop)
        }
      }

      const saved = saveCustomCrops(customCrops)
      if (saved) {
        this.$emit('data-changed')
        this.refreshData()
        this.cancelEdit()
      } else {
        alert('저장에 실패했습니다.')
      }
    },
    saveCrop() {
      if (!this.formData.name.trim() || this.formData.difficulty < 0) {
        alert('이름과 난이도를 올바르게 입력해주세요.')
        return
      }

      const customCrops = getCustomCrops()
      const cropIndex = customCrops.findIndex(c => c.name === this.formData.name.trim())
      
      // 추가
      if (cropIndex >= 0) {
        alert('이미 존재하는 작물입니다.')
        return
      }

      const crop = {
        name: this.formData.name.trim(),
        difficulty: parseInt(this.formData.difficulty) || 1
      }

      customCrops.push(crop)

      const saved = saveCustomCrops(customCrops)
      if (saved) {
        this.$emit('data-changed')
        this.refreshData()
        this.cancelForm()
      } else {
        alert('저장에 실패했습니다.')
      }
    },
    confirmDelete(crop) {
      if (!crop.isCustom) {
        alert('기본 작물은 삭제할 수 없습니다.')
        return
      }
      this.cropToDelete = crop
    },
    cancelDelete() {
      this.cropToDelete = null
    },
    executeDelete() {
      if (this.cropToDelete) {
        const customCrops = getCustomCrops()
        const filtered = customCrops.filter(c => c.name !== this.cropToDelete.name)
        const saved = saveCustomCrops(filtered)
        if (saved) {
          this.$emit('data-changed')
          this.refreshData()
          this.cropToDelete = null
        } else {
          alert('삭제에 실패했습니다.')
        }
      }
    }
  }
}
</script>

<style scoped>
.crop-list {
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

.inline-number {
  text-align: center;
  width: 80px;
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

.crops-table tbody tr.editing {
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

.crops-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.crops-table thead {
  background: linear-gradient(135deg, #66BB6A 0%, #558B2F 100%);
  color: white;
}

.crops-table th,
.crops-table td {
  text-align: center;
}

.crops-table th {
  padding: 12px;
  font-weight: 600;
  border-bottom: 2px solid #2E7D32;
}

.crops-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.crops-table tbody tr:hover {
  background: rgba(200, 230, 201, 0.3);
}

.crops-table tbody tr.custom-crop {
  background: rgba(232, 245, 233, 0.5);
}

.crops-table td {
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
  cursor: pointer;
  user-select: none;
}

.difficulty-cell:hover {
  background: rgba(129, 199, 132, 0.2);
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

