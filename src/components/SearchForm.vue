<template>
  <div class="search-form">
    <h2>가공품 검색</h2>
    <div class="products-list">
      <div 
        v-for="(item, index) in productItems" 
        :key="item.id"
        class="product-item-row"
      >
        <div class="autocomplete-wrapper">
          <input
            :key="`name-${item.id}`"
            v-model="item.name"
            type="text"
            :placeholder="`가공품 이름 ${index + 1}`"
            class="product-name-input"
            :ref="el => { if (el) nameInputRefs[item.id] = el }"
            lang="ko"
            autocomplete="off"
            inputmode="text"
            @input="handleInput(index, $event)"
            @keydown.enter="handleEnterOnName(index, $event)"
            @keydown.delete="handleDeleteOnName(index, $event)"
            @keydown.backspace="handleBackspaceOnName(index, $event)"
            @keydown.down.prevent="handleArrowDown(index, $event)"
            @keydown.up.prevent="handleArrowUp(index, $event)"
            @keydown.right="handleArrowRightOnName(index, $event)"
            @compositionstart="handleCompositionStart(index)"
            @compositionend="handleCompositionEnd(index, $event)"
            @focus="handleFocus(index, $event)"
            @blur="handleBlur(index)"
          />
          <div 
            v-if="autocompleteVisible[index] && autocompleteItems[index].length > 0"
            class="autocomplete-dropdown"
            :ref="`autocomplete-${index}`"
          >
            <div
              v-for="(suggestion, suggestionIndex) in autocompleteItems[index]"
              :key="suggestionIndex"
              class="autocomplete-item"
              :class="{ 'selected': suggestionIndex === selectedIndex[index] }"
              @mousedown.prevent="selectSuggestion(index, suggestion)"
              @mouseenter="selectedIndex[index] = suggestionIndex"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>
        <input
          :key="`quantity-${item.id}`"
          v-model.number="item.quantity"
          type="number"
          min="1"
          placeholder="개수"
          class="quantity-input"
          :ref="el => { if (el) quantityInputRefs[item.id] = el }"
          @focus="handleFocusQuantity(index, $event)"
          @input="handleQuantityInput(index, $event)"
          @keyup.enter="handleEnterOnQuantity(index, $event)"
          @keydown.down.prevent="handleArrowDownQuantity(index, $event)"
          @keydown.up.prevent="handleArrowUpQuantity(index, $event)"
          @keydown.delete="handleDeleteOnQuantity(index, $event)"
          @keydown.backspace="handleBackspaceOnQuantity(index, $event)"
          @keydown.left="handleArrowLeftOnQuantity(index, $event)"
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

const generateItemId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `pi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const createProductItem = (overrides = {}) => ({
  id: generateItemId(),
  name: '',
  quantity: 1,
  ...overrides
})

export default {
  name: 'SearchForm',
  emits: ['search'],
  data() {
    return {
      productItems: [
        createProductItem()
      ],
      allProductNames: [],
      autocompleteVisible: {},
      autocompleteItems: {},
      selectedIndex: {},
      isComposing: {}, // 각 입력 필드별로 조합 상태 관리
      nameInputRefs: {}, // id 기반 input refs
      quantityInputRefs: {} // id 기반 quantity refs
    }
  },
  computed: {
    isValid() {
      return this.productItems.length > 0 && 
             this.productItems.every(item => 
               item.name.trim() !== '' && 
               item.quantity !== null && 
               item.quantity !== undefined && 
               item.quantity !== '' && 
               item.quantity > 0
             )
    }
  },
  methods: {
    loadProductNames() {
      const products = getAllProducts()
      this.allProductNames = products.map(p => p.name).sort()
    },
    handleInput(index, event) {
      const value = event.target.value.trim()
      if (value.length > 0) {
        this.autocompleteItems[index] = this.allProductNames.filter(name => 
          name.startsWith(value)
        )
        this.autocompleteVisible[index] = this.autocompleteItems[index].length > 0
        this.selectedIndex[index] = 0
      } else {
        this.autocompleteVisible[index] = false
        this.autocompleteItems[index] = []
        this.selectedIndex[index] = -1
      }
    },
    handleCompositionStart(index) {
      this.isComposing[index] = true
    },
    handleCompositionEnd(index, event) {
      this.isComposing[index] = false
      if (event && event.target) {
        this.handleInput(index, event)
      }
    },
    handleFocus(index, event) {
      const value = this.productItems[index].name.trim()
      if (value.length > 0) {
        this.autocompleteItems[index] = this.allProductNames.filter(name => 
          name.startsWith(value)
        )
        this.autocompleteVisible[index] = this.autocompleteItems[index].length > 0
        this.selectedIndex[index] = 0
      }
      // 한글 입력 모드 활성화
      if (event && event.target) {
        const input = event.target
        input.setAttribute('lang', 'ko')
        input.setAttribute('inputmode', 'text')
        // IME 모드 강제 설정 (브라우저 지원 시)
        if (input.style) {
          input.style.imeMode = 'active'
          input.style.webkitImeMode = 'active'
        }
        // 포커스 이벤트 후에도 다시 한번 설정
        this.$nextTick(() => {
          if (input.style) {
            input.style.imeMode = 'active'
            input.style.webkitImeMode = 'active'
          }
        })
      }
    },
    handleBlur(index) {
      // 마우스 클릭으로 선택하는 경우를 위해 약간의 지연
      setTimeout(() => {
        this.autocompleteVisible[index] = false
      }, 200)
    },
    handleArrowDown(index, event) {
      if (this.autocompleteVisible[index] && this.autocompleteItems[index].length > 0) {
        // 자동완성이 열려있으면 자동완성 항목 선택
        event.preventDefault()
        this.selectedIndex[index] = Math.min(
          (this.selectedIndex[index] || 0) + 1,
          this.autocompleteItems[index].length - 1
        )
      } else {
        // 자동완성이 없으면 다음 행으로 이동하거나 새 행 추가
        event.preventDefault()
        if (index < this.productItems.length - 1) {
          // 다음 행의 이름 입력 필드로 이동
          const nextItem = this.productItems[index + 1]
          if (nextItem) {
            this.$nextTick(() => {
              const nextInput = this.nameInputRefs[nextItem.id]
              if (nextInput) {
                nextInput.focus()
              }
            })
          }
        } else {
          // 마지막 행이면 새 가공품 추가
          this.addProduct()
        }
      }
    },
    handleArrowUp(index, event) {
      if (this.autocompleteVisible[index] && this.autocompleteItems[index].length > 0) {
        // 자동완성이 열려있으면 자동완성 항목 선택
        event.preventDefault()
        this.selectedIndex[index] = Math.max(
          (this.selectedIndex[index] || 0) - 1,
          0
        )
      } else {
        // 자동완성이 없으면 이전 행으로 이동
        event.preventDefault()
        if (index > 0) {
          const prevItem = this.productItems[index - 1]
          if (prevItem) {
            this.$nextTick(() => {
              const prevInput = this.nameInputRefs[prevItem.id]
              if (prevInput) {
                prevInput.focus()
              }
            })
          }
        }
      }
    },
    selectSuggestion(index, suggestion) {
      this.productItems[index].name = suggestion
      this.autocompleteVisible[index] = false
      // 자동 포커스 제거: IME 초기화 방지
      // this.$nextTick(() => {
      //   this.focusQuantity(index)
      // })
    },
    handleEnterOnName(index, event) {
      if (this.isComposing[index]) {
        return
      }
      // 자동완성 항목이 있고 선택된 항목이 있으면 선택
      if (this.autocompleteVisible[index] && 
          this.autocompleteItems[index].length > 0 && 
          this.selectedIndex[index] >= 0) {
        event.preventDefault()
        this.selectSuggestion(index, this.autocompleteItems[index][this.selectedIndex[index]])
      } else {
        // 일반 Enter: 개수 필드로 이동
        event.preventDefault()
        this.focusQuantity(index)
      }
    },
    focusNameInputWithIME(index) {
      // 이름 입력 필드에 포커스를 주고 IME 모드를 한글로 설정
      // setTimeout(0)을 사용하여 IME 초기화 방지
      const item = this.productItems[index]
      if (!item) return
      
      this.$nextTick(() => {
        setTimeout(() => {
          const input = this.nameInputRefs[item.id]
          if (input) {
            // IME 모드를 먼저 설정
            input.setAttribute('lang', 'ko')
            input.setAttribute('inputmode', 'text')
            if (input.style) {
              input.style.imeMode = 'active'
              input.style.webkitImeMode = 'active'
            }
            // Zero-timeout으로 IME 초기화 방지
            input.focus()
            // 포커스 후에도 다시 한번 IME 모드 확인
            if (input.style) {
              input.style.imeMode = 'active'
              input.style.webkitImeMode = 'active'
            }
          }
        }, 0) // IME 깨짐 방지를 위한 zero-timeout
      })
    },
    addProduct() {
      this.productItems.push(createProductItem())
      // 자동 포커스 제거: IME 초기화 방지를 위해 사용자가 직접 클릭하도록 함
      // const newIndex = this.productItems.length - 1
      // this.focusNameInputWithIME(newIndex)
    },
    removeProduct(index) {
      if (this.productItems.length > 1) {
        this.productItems.splice(index, 1)
        // 자동 포커스 제거: IME 초기화 방지를 위해 사용자가 직접 클릭하도록 함
        // const targetIndex = Math.min(index, this.productItems.length - 1)
        // this.focusNameInputWithIME(targetIndex)
      }
    },
    focusQuantity(index) {
      // 이름 입력 후 Enter를 누르면 개수 필드로 이동
      // setTimeout(0)을 사용하여 IME 초기화 방지
      const item = this.productItems[index]
      if (!item) return
      
      this.$nextTick(() => {
        setTimeout(() => {
          const quantityInput = this.quantityInputRefs[item.id]
          if (quantityInput) {
            quantityInput.focus()
          }
        }, 0) // IME 깨짐 방지를 위한 zero-timeout
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
    handleArrowDownQuantity(index, event) {
      // 개수 입력 필드에서 방향키 아래: 다음 행으로 이동하거나 새 행 추가
      event.preventDefault()
      if (index < this.productItems.length - 1) {
        // 다음 행의 개수 입력 필드로 이동
        const nextItem = this.productItems[index + 1]
        if (nextItem) {
          this.$nextTick(() => {
            const nextQuantity = this.quantityInputRefs[nextItem.id]
            if (nextQuantity) {
              nextQuantity.focus()
            }
          })
        }
      } else {
        // 마지막 행이면 새 가공품 추가
        this.addProduct()
        this.$nextTick(() => {
          const newItem = this.productItems[index + 1]
          if (newItem) {
            const nameInput = this.nameInputRefs[newItem.id]
            if (nameInput) {
              nameInput.focus()
            }
          }
        })
      }
    },
    handleArrowUpQuantity(index, event) {
      // 개수 입력 필드에서 방향키 위: 이전 행으로 이동
      event.preventDefault()
      if (index > 0) {
        const prevItem = this.productItems[index - 1]
        if (prevItem) {
          this.$nextTick(() => {
            const prevQuantity = this.quantityInputRefs[prevItem.id]
            if (prevQuantity) {
              prevQuantity.focus()
            }
          })
        }
      }
    },
    // Tab 키 핸들러 제거: 브라우저 기본 Tab 동작 사용 (IME 초기화 방지)
    // handleTabOnName(index, event) {
    //   // 이름 입력 필드에서 Tab - 제거됨
    // },
    // handleTabOnQuantity(index, event) {
    //   // 개수 입력 필드에서 Tab - 제거됨
    // },
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
          // 자동 포커스 제거: IME 초기화 방지
          // if (index > 0) {
          //   this.focusNameInputWithIME(index - 1)
          // }
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
    handleFocusQuantity(index, event) {
      // 포커스 시 값 전체 선택 (기본값 1이 있을 때 2를 입력하면 12가 되는 문제 방지)
      const input = event.target
      if (input.value) {
        this.$nextTick(() => {
          input.select()
        })
      }
    },
    handleQuantityInput(index, event) {
      // 개수 입력 필드에서 빈 값이 되어도 row를 유지
      // v-model.number가 빈 값을 null로 변환하므로, 이를 허용
      // 빈 값일 때도 row가 유지되도록 quantity를 null로 유지
      const value = event.target.value
      if (value === '' || value === null || value === undefined) {
        // 빈 값일 때는 null로 유지 (row는 유지되지만 검색 시 필터링됨)
        this.productItems[index].quantity = null
      }
    },
    handleBackspaceOnQuantity(index, event) {
      // 개수 필드에서 Backspace
      const input = event.target
      // 빈 값일 때는 row를 삭제하지 않음 (기본값만 지워진 상태)
      // 값이 1이고 커서가 맨 앞일 때만 삭제 (의도적인 삭제)
      if (input.value === '1' && input.selectionStart === 0 && input.selectionEnd === 0) {
        if (this.productItems.length > 1) {
          event.preventDefault()
          this.removeProduct(index)
          // 자동 포커스 제거: IME 초기화 방지
          // if (index > 0) {
          //   this.$nextTick(() => {
          //     const quantityInput = this.$refs[`quantityInput-${index - 1}`]
          //     if (quantityInput && quantityInput[0]) {
          //       quantityInput[0].focus()
          //     } else if (quantityInput) {
          //       quantityInput.focus()
          //     }
          //   })
          // }
        }
      } else if (event.ctrlKey || event.metaKey) {
        // Ctrl+Backspace: 삭제
        event.preventDefault()
        if (this.productItems.length > 1) {
          this.removeProduct(index)
        }
      }
    },
    handleArrowRightOnName(index, event) {
      const input = event.target
      const caretAtEnd =
        input.selectionStart === input.selectionEnd &&
        input.selectionEnd === input.value.length
      if (!caretAtEnd) {
        return
      }

      event.preventDefault()
      const item = this.productItems[index]
      if (!item) return

      this.$nextTick(() => {
        const quantityInput = this.quantityInputRefs[item.id]
        if (quantityInput) {
          quantityInput.focus()
        }
      })
    },
    handleArrowLeftOnQuantity(index, event) {
      const input = event.target
      const selectionStart = input.selectionStart
      const selectionEnd = input.selectionEnd

      const hasSelectionInfo =
        typeof selectionStart === 'number' && typeof selectionEnd === 'number'

      const caretAtStart = hasSelectionInfo
        ? selectionStart === selectionEnd && selectionStart === 0
        : true

      if (hasSelectionInfo && selectionStart !== selectionEnd) {
        return
      }
      if (!caretAtStart) {
        return
      }

      event.preventDefault()
      const item = this.productItems[index]
      if (!item) return

      this.$nextTick(() => {
        const nameInput = this.nameInputRefs[item.id]
        if (nameInput) {
          nameInput.focus()
        }
      })
    },
    handleSearch() {
      if (this.isValid) {
        const products = this.productItems
          .filter(item => 
            item.name.trim() !== '' && 
            item.quantity !== null && 
            item.quantity !== undefined && 
            item.quantity !== '' && 
            item.quantity > 0
          )
          .map(item => ({
            name: item.name.trim(),
            quantity: parseInt(item.quantity) || 1
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
    // 가공품 이름 목록 로드
    this.loadProductNames()
    // 전역 키보드 단축키
    document.addEventListener('keydown', this.handleGlobalShortcuts)
    // 자동 포커스 제거: IME 초기화 방지를 위해 사용자가 직접 클릭하도록 함
    // this.focusNameInputWithIME(0)
  },
  updated() {
    // 업데이트 후 모든 입력 필드의 IME 모드를 재설정
    this.$nextTick(() => {
      const inputs = document.querySelectorAll('.product-name-input')
      inputs.forEach(input => {
        input.setAttribute('lang', 'ko')
        input.setAttribute('inputmode', 'text')
        if (input.style) {
          input.style.imeMode = 'active'
          input.style.webkitImeMode = 'active'
        }
      })
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

.autocomplete-wrapper {
  flex: 2;
  position: relative;
}

.product-name-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  ime-mode: active;
  -webkit-ime-mode: active;
  -moz-ime-mode: active;
  -ms-ime-mode: active;
  text-transform: none;
  direction: ltr;
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
  border-color: #81C784;
  box-shadow: 0 0 0 3px rgba(129, 199, 132, 0.25);
  background: rgba(255, 255, 255, 0.95);
}

.remove-btn {
  padding: 12px 20px;
  background: #FFAB91;
  color: #BF360C;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.remove-btn:hover:not(:disabled) {
  background: #FF8A65;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 171, 145, 0.4);
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-product-btn {
  width: 100%;
  padding: 10px 20px;
  background: linear-gradient(135deg, #A5D6A7 0%, #C8E6C9 100%);
  color: #2E7D32;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(129, 199, 132, 0.3);
}

.add-product-btn:hover {
  background: linear-gradient(135deg, #81C784 0%, #A5D6A7 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(129, 199, 132, 0.4);
}

.search-btn {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #66BB6A 0%, #81C784 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(102, 187, 106, 0.4);
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(102, 187, 106, 0.5);
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
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

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid #81C784;
  border-top: none;
  border-radius: 0 0 10px 10px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 16px rgba(129, 199, 132, 0.3);
  margin-top: -2px;
  backdrop-filter: blur(10px);
}

.autocomplete-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
  background-color: rgba(200, 230, 201, 0.4);
}

.autocomplete-item:active {
  background-color: rgba(165, 214, 167, 0.5);
}
</style>

