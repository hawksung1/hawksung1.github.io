<template>
  <div class="data-management">
    <h2>데이터 관리</h2>
    <div class="info-box">
      <p>가공품 데이터는 브라우저의 localStorage에 자동으로 저장됩니다.</p>
      <p>백업을 위해 JSON 파일로 내보내거나, 다른 기기에서 가져올 수 있습니다.</p>
    </div>
    
    <div class="actions">
      <div class="action-group">
        <h3>내보내기</h3>
        <p>현재 저장된 가공품 데이터를 JSON 파일로 다운로드합니다.</p>
        <button @click="handleExport" class="export-btn">데이터 내보내기</button>
      </div>
      
      <div class="action-group">
        <h3>가져오기</h3>
        <p>JSON 파일에서 가공품 데이터를 불러옵니다. (기존 데이터와 병합됩니다)</p>
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleImport"
          style="display: none"
        />
        <button @click="triggerFileInput" class="import-btn">데이터 가져오기</button>
      </div>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { exportProductsToFile, importProductsFromFile } from '../utils/dataManager.js'

export default {
  name: 'DataManagement',
  emits: ['data-changed'],
  data() {
    return {
      message: null,
      messageType: 'info'
    }
  },
  methods: {
    handleExport() {
      const result = exportProductsToFile()
      if (result.success) {
        this.showMessage('데이터가 성공적으로 내보내졌습니다.', 'success')
      } else {
        this.showMessage(result.error || '내보내기에 실패했습니다.', 'error')
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async handleImport(event) {
      const file = event.target.files[0]
      if (!file) return
      
      if (!file.name.endsWith('.json')) {
        this.showMessage('JSON 파일만 업로드할 수 있습니다.', 'error')
        return
      }
      
      const result = await importProductsFromFile(file)
      
      if (result.success) {
        this.showMessage(
          `데이터 가져오기 완료! ${result.imported}개 항목을 가져왔습니다. (총 ${result.total}개)`,
          'success'
        )
        this.$emit('data-changed')
        // 파일 입력 초기화
        event.target.value = ''
      } else {
        this.showMessage(result.error || '가져오기에 실패했습니다.', 'error')
        event.target.value = ''
      }
    },
    showMessage(text, type = 'info') {
      this.message = text
      this.messageType = type
      setTimeout(() => {
        this.message = null
      }, 5000)
    }
  }
}
</script>

<style scoped>
.data-management {
  margin-bottom: 30px;
}

.data-management h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5em;
}

.info-box {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 25px;
}

.info-box p {
  margin: 5px 0;
  color: #555;
  font-size: 0.95em;
}

.actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.action-group {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.action-group h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.1em;
}

.action-group p {
  margin: 0 0 15px 0;
  color: #666;
  font-size: 0.9em;
  line-height: 1.5;
}

.export-btn,
.import-btn {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.export-btn {
  background: #28a745;
  color: white;
}

.export-btn:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.import-btn {
  background: #007bff;
  color: white;
}

.import-btn:hover {
  background: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

.message {
  padding: 15px;
  border-radius: 6px;
  margin-top: 20px;
  font-weight: 600;
}

.message.success {
  background: #d4edda;
  border: 2px solid #c3e6cb;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  border: 2px solid #f5c6cb;
  color: #721c24;
}

.message.info {
  background: #d1ecf1;
  border: 2px solid #bee5eb;
  color: #0c5460;
}
</style>







