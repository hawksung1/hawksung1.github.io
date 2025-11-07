<template>
  <div class="search-form">
    <h2>가공품 검색</h2>
    <div class="products-list">
      <div 
        v-for="(item, index) in productItems" 
        :key="index"
        class="product-item-row"
      >
        <input
          v-model="item.name"
          type="text"
          :placeholder="`가공품 이름 ${index + 1}`"
          class="product-name-input"
          :ref="`nameInput-${index}`"
          @keyup.enter="focusQuantity(index)"
          @keydown.tab.prevent="handleTabOnName(index, $event)"
          @keydown.delete="handleDeleteOnName(index, $event)"
          @keydown.backspace="handleBackspaceOnName(index, $event)"
        />
        <input
          v-model.number="item.quantity"
          type="number"
          min="1"
          placeholder="개수"
          class="quantity-input"
          :ref="`quantityInput-${index}`"
          @keyup.enter="handleEnterOnQuantity(index, $event)"
          @keydown.tab.prevent="handleTabOnQuantity(index, $event)"
          @keydown.delete="handleDeleteOnQuantity(index, $event)"
          @keydown.backspace="handleBackspaceOnQuantity(index, $event)"
        />
        <button 
          @click="removeProduct(index)" 
          class="remove-btn"
          :disabled="productItems.length === 1"
          type="button"
          :title="productItems.length === 1 ? '최소 1개는 유지해야 합니다' : '삭제 (Ctrl+Delete 또는 빈 필드에서 Backspace)'"
        >
          삭제
        </button>
      </div>
      <button @click="addProduct" class="add-product-btn" type="button">
        + 가공품 추가 <span class="shortcut-hint">(Ctrl+Enter 또는 개수 입력 후 Tab)</span>
      </button>
    </div>
    <button @click="handleSearch" :disabled="!isValid" class="search-btn" ref="searchButton">
      검색 <span class="shortcut-hint">(Enter)</span>
    </button>
  </div>
</template>

<script>
import { getAllProducts } from '../utils/dataManager.js'

export default {
  name: 'SearchForm',
  emits: ['search'],
  data() {
    return {
      productItems: [
        { name: '', quantity: 1 }
      ]
    }
  },
  computed: {
    isValid() {
      return this.productItems.length > 0 && 
             this.productItems.every(item => 
               item.name.trim() !== '' && item.quantity > 0
             )
    }
  },
  methods: {
    addProduct() {
      this.productItems.push({ name: '', quantity: 1 })
      // 새로 추가된 행의 이름 필드에 포커스
      this.$nextTick(() => {
        const newIndex = this.productItems.length - 1
        const nameInput = this.$refs[`nameInput-${newIndex}`]
        if (nameInput && nameInput[0]) {
          nameInput[0].focus()
        } else if (nameInput) {
          nameInput.focus()
        }
      })
    },
    removeProduct(index) {
      if (this.productItems.length > 1) {
        this.productItems.splice(index, 1)
        // 삭제 후 포커스 이동
        this.$nextTick(() => {
          const targetIndex = Math.min(index, this.productItems.length - 1)
          const nameInput = this.$refs[`nameInput-${targetIndex}`]
          if (nameInput && nameInput[0]) {
            nameInput[0].focus()
          } else if (nameInput) {
            nameInput.focus()
          }
        })
      }
    },
    focusQuantity(index) {
      // 이름 입력 후 Enter를 누르면 개수 필드로 이동
      this.$nextTick(() => {
        const quantityInput = this.$refs[`quantityInput-${index}`]
        if (quantityInput && quantityInput[0]) {
          quantityInput[0].focus()
        } else if (quantityInput) {
          quantityInput.focus()
        }
      })
    },
    handleEnterOnQuantity(index, event) {
      // 개수 입력 필드에서 Enter
      if (event.ctrlKey || event.metaKey) {
        // Ctrl+Enter: 새 가공품 추가
        event.preventDefault()
        this.addProduct()
      } else {
        // 일반 Enter: 검색 실행
        this.handleSearch()
      }
    },
    handleTabOnName(index, event) {
      // 이름 입력 필드에서 Tab: 개수 필드로 이동
      if (!event.shiftKey) {
        event.preventDefault()
        this.focusQuantity(index)
      }
    },
    handleTabOnQuantity(index, event) {
      // 개수 입력 필드에서 Tab
      if (event.shiftKey) {
        // Shift+Tab: 같은 행의 이름 필드로 이동
        event.preventDefault()
        this.$nextTick(() => {
          const nameInput = this.$refs[`nameInput-${index}`]
          if (nameInput && nameInput[0]) {
            nameInput[0].focus()
          } else if (nameInput) {
            nameInput.focus()
          }
        })
      } else {
        // 일반 Tab: 다음 행의 이름 필드로 이동 또는 새 가공품 추가
        event.preventDefault()
        if (index < this.productItems.length - 1) {
          // 다음 행의 이름 필드로 이동
          this.$nextTick(() => {
            const nameInput = this.$refs[`nameInput-${index + 1}`]
            if (nameInput && nameInput[0]) {
              nameInput[0].focus()
            } else if (nameInput) {
              nameInput.focus()
            }
          })
        } else {
          // 마지막 행이면 새 가공품 추가
          this.addProduct()
        }
      }
    },
    handleDeleteOnName(index, event) {
      // 이름 필드에서 Delete 키 (Ctrl+Delete로 삭제)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        if (this.productItems.length > 1) {
          this.removeProduct(index)
        }
      }
    },
    handleBackspaceOnName(index, event) {
      // 이름 필드에서 Backspace (필드가 비어있고 커서가 맨 앞일 때 삭제)
      const input = event.target
      if (input.value === '' && input.selectionStart === 0 && input.selectionEnd === 0) {
        if (this.productItems.length > 1) {
          event.preventDefault()
          this.removeProduct(index)
          // 이전 행의 개수 필드로 포커스 이동
          if (index > 0) {
            this.$nextTick(() => {
              const quantityInput = this.$refs[`quantityInput-${index - 1}`]
              if (quantityInput && quantityInput[0]) {
                quantityInput[0].focus()
              } else if (quantityInput) {
                quantityInput.focus()
              }
            })
          }
        }
      } else if (event.ctrlKey || event.metaKey) {
        // Ctrl+Backspace: 삭제
        event.preventDefault()
        if (this.productItems.length > 1) {
          this.removeProduct(index)
        }
      }
    },
    handleDeleteOnQuantity(index, event) {
      // 개수 필드에서 Delete 키 (Ctrl+Delete로 삭제)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        if (this.productItems.length > 1) {
          this.removeProduct(index)
        }
      }
    },
    handleBackspaceOnQuantity(index, event) {
      // 개수 필드에서 Backspace (값이 1이고 커서가 맨 앞일 때 삭제)
      const input = event.target
      if (input.value === '1' || input.value === '' && input.selectionStart === 0 && input.selectionEnd === 0) {
        if (this.productItems.length > 1) {
          event.preventDefault()
          this.removeProduct(index)
          // 이전 행의 개수 필드로 포커스 이동
          if (index > 0) {
            this.$nextTick(() => {
              const quantityInput = this.$refs[`quantityInput-${index - 1}`]
              if (quantityInput && quantityInput[0]) {
                quantityInput[0].focus()
              } else if (quantityInput) {
                quantityInput.focus()
              }
            })
          }
        }
      } else if (event.ctrlKey || event.metaKey) {
        // Ctrl+Backspace: 삭제
        event.preventDefault()
        if (this.productItems.length > 1) {
          this.removeProduct(index)
        }
      }
    },
    handleSearch() {
      if (this.isValid) {
        const products = this.productItems
          .filter(item => item.name.trim() !== '' && item.quantity > 0)
          .map(item => ({
            name: item.name.trim(),
            quantity: parseInt(item.quantity)
          }))
        
        this.$emit('search', products)
      }
    },
    handleGlobalShortcuts(event) {
      // 입력 필드에 포커스가 있을 때는 전역 단축키 무시
      const activeElement = document.activeElement
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return
      }
      
      // Ctrl+Enter 또는 Cmd+Enter: 새 가공품 추가
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        this.addProduct()
      }
    }
  },
  mounted() {
    // 전역 키보드 단축키
    document.addEventListener('keydown', this.handleGlobalShortcuts)
    // 첫 번째 이름 필드에 포커스
    this.$nextTick(() => {
      const nameInput = this.$refs['nameInput-0']
      if (nameInput && nameInput[0]) {
        nameInput[0].focus()
      } else if (nameInput) {
        nameInput.focus()
      }
    })
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleGlobalShortcuts)
  }
}
</script>

<style scoped>
.search-form {
  margin-bottom: 30px;
}

.search-form h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5em;
}

.products-list {
  margin-bottom: 20px;
}

.product-item-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.product-name-input {
  flex: 2;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.quantity-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.product-name-input:focus,
.quantity-input:focus {
  outline: none;
  border-color: #667eea;
}

.remove-btn {
  padding: 12px 20px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.remove-btn:hover:not(:disabled) {
  background: #cc0000;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-product-btn {
  width: 100%;
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
  margin-bottom: 15px;
}

.add-product-btn:hover {
  background: #218838;
}

.search-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shortcut-hint {
  font-size: 0.75em;
  opacity: 0.7;
  font-weight: normal;
  margin-left: 8px;
}
</style>

