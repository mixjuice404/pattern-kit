<template>
  <div>
    <!-- <div class="position-bar">
      <div class="tooltip tooltip-right tooltip-primary" :data-tip="'hello world'">
        <div class="position-cursor"></div>
      </div>
      
    </div> -->
    <!-- <div class="position-bar">
      <div 
        v-for="(section, index) in navSections" 
        :key="index"
        class="position-cursor-wrapper"
        :style="{ top: `${index * 20}px` }"
        @click="section.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })"
      >
        <div 
          class="tooltip tooltip-right tooltip-primary" 
          :data-tip="(section as HTMLElement).dataset.nav || ''"
        >
          <div class="position-cursor"></div>
        </div>
      </div>
    </div> -->

    <div class="form-section" style="padding: 15px;">

      <div class="input-set" data-nav="Template">
        <legend class="form-title">Template Selection</legend>
        <div class="input-item">
          <div class="input-label" style="margin-bottom: 15px;">选择模板</div>
          <div class="radio-set" style="gap: 20px; display: flex; align-items: center;">
            <label class="radio-label" style="display: flex; align-items: center; gap: 5px;">
              <input 
                type="radio" 
                name="radio-1" 
                class="radio radio-primary radio-xs" 
                :checked="patternInfo.template === 'simple'" 
                @change="patternInfo.template = 'simple'"
              />
              <div style="font-size: 14px; font-weight: 500;">Simple Layout</div>
            </label>
            <label class="radio-label" style="display: flex; align-items: center; gap: 5px;">
              <input 
                type="radio" 
                name="radio-1" 
                class="radio radio-primary radio-xs" 
                :checked="patternInfo.template === 'base'" 
                @change="patternInfo.template = 'base'"
              />
              <div style="font-size: 14px; font-weight: 500;">Base Layout</div>
            </label>
          </div>
          <!-- <select 
            class="select" 
            style="width: 100%;" 
            v-model="patternInfo.template"
          >
            <option value="simple">精简模板</option>
            <option value="complex">完整模板</option>
          </select> -->
        </div>
      </div>

      <div class="input-set" data-nav="Basic Info">
          <legend class="form-title">Basic Info</legend>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px;">封面/主图</div>
              <Upload 
                  uploadId="cover-image"
                  v-model="coverImage"
                  :multiple="false" 
                  :initial-url="patternInfo.cover_image ? [patternInfo.cover_image] : []"
                  @remove="handleRemove"
                  @upload-success="handleUploadSuccess"
                  @upload-error="handleUploadError"
              />
          </div>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px;">标题</div>
              <input 
                type="text" 
                class="input" 
                style="width: 100%;" 
                placeholder="Type here" 
                v-model="patternInfo.title"
              />
          </div>
          <div class="input-item" v-if="patternInfo.template === 'base'">
              <div class="input-label" style="margin-bottom: 15px;">描述</div>
              <input 
                type="text" 
                class="input" 
                style="width: 100%;" 
                placeholder="Type here" 
                v-model="patternInfo.subtitle"
              />
          </div>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px;">创作灵感/描述</div>
              <textarea 
                class="textarea" 
                placeholder="Bio" 
                style="width: 100%;" 
                rows="6"
                v-model="patternInfo.inspiration"
              ></textarea>
          </div>
      </div>
      <div class="input-set" data-nav="Pattern Properties">
          <legend class="form-title">Pattern Properties</legend>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px;">SKILL LEVEL</div>
              <select class="select" style="width: 100%;" v-model="patternInfo.skillLevel" >
                  <option selected>Beginner</option>
                  <option>Easy</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert / Master</option>
              </select>
          </div>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px;">ESTIMATED TIME</div>
              <input 
                type="text" 
                class="input" 
                style="width: 100%;" 
                placeholder="6-8 hours" 
                v-model="patternInfo.estimatedTime"
              />
          </div>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px;">FINISHED SIZE</div>
              <input 
                type="text" 
                class="input" 
                style="width: 100%;" 
                placeholder="Approximately 12cm tall (using 3.5mm hook)" 
                v-model="patternInfo.finishedSize"
              />
          </div>
      </div>
      <div class="input-set" data-nav="Pattern Information" v-if="patternInfo.template === 'base'">
          <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
              <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
              <div>Pattern Information</div>
          </legend>
          <TextListEditor
              v-model="patternInfo.info"
              label="What You'll Create"
              text-placeholder="Description of the pattern ..."
              list-placeholder="Demo: Moveable wings/arms ..."
          />  
          <TextListEditor
              v-model="patternInfo.note"
              label="Difficulty Notes"
              text-placeholder="Notes about difficulty or special techniques ..."
              list-placeholder="Demo: Pay attention to tension in round 5 ..."
          />
      </div>

      <div class="input-set" data-nav="Abbreviations & Techniques">
          <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
              <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
              <div>ABBREVIATIONS & TECHNIQUES</div>
              
          </legend>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px; display: flex; align-items: center; gap: 5px">
                  <input type="checkbox" :checked="true" class="checkbox checkbox-success checkbox-xs" />
                  <div>Abbreviations List</div>
                  <div @click="resetAbbreviations"
                  style="flex-shrink: 0; margin-left: auto; display: flex; align-items:center; gap: 4px; cursor: pointer;">
                      <icon name="solar:restart-square-outline" />
                      <div>Reset</div>
                  </div>
              </div>
              
              <!-- 按 section 分组显示 -->
              <div v-for="section in crochetSections" :key="section.id" style="margin-bottom: 20px;">
                  <div style="font-size: 12px; font-weight: 600; margin-bottom: 15px; opacity: 0.7;">
                      {{ section.name }}
                  </div>
                  <div class="grid-btn-group">
                      <div 
                          v-for="(termData, usName) in section.terms" 
                          :key="usName" 
                          class="grid-btn"
                          :class="{ 'selected': isTermSelected(termData.us_abbrev) }"
                          @click="toggleTerm(termData.us_abbrev)"
                          :title="`${termData.chinese} (${termData.notation_cn}) - ${termData.description}`"
                      >
                          {{ termData.us_abbrev || usName }}
                      </div>
                  </div>
              </div>
          </div>
          <TextListEditor
              v-model="patternInfo.techniques"
              label="Special Techniques Used"
              text-placeholder="Special techniques used in this pattern ..."
              list-placeholder="Demo: Magic Ring, Invisible Decrease ..."
          />
      </div>

      <div class="input-set" data-nav="Materials & Tools">
          <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
              <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
              <div>MATERIALS & TOOLS</div>
          </legend>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px; display: flex; align-items: center; gap: 5px">
                  <input type="checkbox" :checked="true" class="checkbox checkbox-success checkbox-xs" />
                  <div>Recommended Yarn</div>
              </div>
              <textarea 
                class="textarea" 
                style="width: 100%; margin-bottom: 8px;" 
                placeholder="Recommended yarn for this pattern ..." 
                v-model="patternInfo.yarn"
              />
          </div>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px; display: flex; align-items: center; gap: 5px">
                  <input type="checkbox" :checked="true" class="checkbox checkbox-success checkbox-xs" />
                  <div>Suggested Brands</div>
              </div>
              <input 
                type="text" 
                class="input" 
                style="width: 100%; margin-bottom: 8px;" 
                placeholder="Suggested brands for this pattern ..." 
                v-model="patternInfo.brands"
              />
          </div>
          <div class="input-item">
              <div class="input-label" style="margin-bottom: 15px; display: flex; align-items: center; gap: 5px">
                  <input type="checkbox" :checked="true" class="checkbox checkbox-success checkbox-xs" />
                  <div>Materials Description</div>
              </div>
              <textarea class="textarea" 
                style="width: 100%; margin-bottom: 8px;" 
                placeholder="Materials description for this pattern ..." 
                v-model="patternInfo.materialsDesc"
              />
          </div>
          <TextListEditor
              v-model="patternInfo.colors"
              label="Color Palette"
              text-placeholder="Color name ..."
              list-placeholder="Color / Weight ..."
          />
          <TextListEditor
              v-model="patternInfo.tools"
              label="Tools & Notions"
              text-placeholder="Tools or notions description ..."
              list-placeholder="Tools or notions used in this pattern ..."
          />
          <TextListEditor
              v-model="patternInfo.supplies"
              label="Optional Supplies"
              text-placeholder="Optional supplies description ..."
              list-placeholder="Optional supplies used in this pattern ..."
          />
      </div>

      <div class="input-set" data-nav="Main Pattern Instructions">
          <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
              <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
              <div>MAIN PATTERN INSTRUCTIONS</div>
          </legend>
          <div style="display: grid; grid-template-columns: 2fr 1fr; align-items: center; gap: 6px; margin-bottom: 20px;">
              <button class="btn btn-primary">Export Instruction</button>
              <button class="btn btn-primary" @click="addInstructionStep">Add</button>
          </div>
          
          <!-- 动态渲染指令步骤 -->
          <div v-for="(instruction, stepIndex) in patternInfo.instructions" 
              :key="stepIndex" 
              :data-nav="`Instructions-${stepIndex}`"
              style="padding: 5px; border:2px dashed #e5e5e5; border-radius: 4px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 8px;">
                  <icon name="solar:close-square-bold-duotone" 
                        style="color: oklch(63.7% 0.237 25.331); cursor: pointer" 
                        @click="removeInstructionStep(stepIndex)" />
                  <div style="font-size: 12px; font-weight: 500; opacity: 0.6;">Step {{ stepIndex + 1 }}</div>
              </div>
              <div class="input-item" style="margin-bottom: 0px;" >
                  <input
                      type="text" 
                      class="input" 
                      style="width: 100%; margin-bottom: 8px;" 
                      placeholder="Title of the instruction ..." 
                      :value="instruction.title"
                      @input="updateInstructionField(stepIndex, 'title', ($event.target as HTMLInputElement).value)"
                  />
                  <textarea
                      class="textarea" 
                      style="width: 100%; margin-bottom: 8px;" 
                      placeholder="Description of the instruction ..." 
                      :value="instruction.description || ''"
                      @input="updateInstructionField(stepIndex, 'description', ($event.target as HTMLInputElement).value)"
                  />
                  <textarea
                      class="textarea" 
                      style="width: 100%; margin-bottom: 8px;" 
                      placeholder="After Description of the instruction ..." 
                      :value="instruction.end_description || ''"
                      @input="updateInstructionField(stepIndex, 'end_description', ($event.target as HTMLInputElement).value)"
                  />
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                      <input 
                          type="text" 
                          class="input" 
                          style="width: 100%;" 
                          placeholder="The instruction text ..." 
                          :value="instruction.text"
                          @input="updateInstructionField(stepIndex, 'text', ($event.target as HTMLInputElement).value)"
                      />
                      <button class="btn btn-soft btn-primary" @click="openImportModal(stepIndex)">
                          <icon name="hugeicons:file-import" />
                      </button>
                      <button class="btn btn-soft btn-primary" @click="addInstructionListItem(stepIndex)">
                          <icon name="hugeicons:add-01" />
                      </button>
                  </div>

                  
                  
                  <!-- 动态渲染列表项 -->
                  <div v-for="(listItem, listIndex) in instruction.list" 
                        :key="listIndex" 
                        style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                      <div @click="removeInstructionListItem(stepIndex, listIndex)">
                          <icon name="solar:minus-square-bold" style="flex-shrink: 0; opacity: 0.5; cursor: pointer;" class="remove-btn" size="20" />
                      </div>
                      <input 
                          type="text" 
                          class="input" 
                          style="width: 100%;" 
                          placeholder="Add a step ..." 
                          :value="listItem"
                          @input="updateInstructionListItem(stepIndex, listIndex, ($event.target as HTMLInputElement).value)"
                      />
                  </div>

                  <Upload 
                      :uploadId="`pattern-step:${stepIndex}`"
                      v-model="imageMatrix[stepIndex]"
                      :initial-url="patternInfo.instructions[stepIndex]?.image || []"
                      :multiple="true"
                      :max-count="5"
                      @remove="handleRemove"
                      @upload-success="handleUploadSuccess"
                      @upload-error="handleUploadError"
                  />

                  <div class="input-item" style="padding: 10px 2px; margin-bottom: 0; text-align:right">
                      <label style="font-size: 12px; font-weight: 500; opacity: 0.6; margin-right: 5px">Bottom Layout</label>
                      <input type="checkbox" :checked="instruction.bottom" class="checkbox checkbox-primary checkbox-xs" @change="updateInstructionField(stepIndex, 'bottom', ($event.target as HTMLInputElement).checked)" />
                  </div>
                  
              </div>
          </div>
          
          <!-- 无指令步骤时的提示 -->
          <div v-if="patternInfo.instructions.length === 0" style="padding: 20px; text-align: center; opacity: 0.5;">
              点击 "Add" 按钮添加第一个指令步骤
          </div>
      </div>

      <div class="input-set" data-nav="Finishing Tips & Techniques" >
          <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
              <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
              <div>FINISHING TIPS & TECHNIQUES</div>
          </legend>
          <TextListEditor
              v-model="patternInfo.finishingTips"
              label="Finishing Tips"
              text-placeholder="Finishing tips description ..."
              list-placeholder="Finishing tips used in this pattern ..."
          />
          <TextListEditor
              v-model="patternInfo.troubleshooting"
              label="Troubleshooting"
              text-placeholder="Troubleshooting description ..."
              list-placeholder="Troubleshooting used in this pattern ..."
          />
      </div>


      <div class="input-set" data-nav="Bonus Content" >
          <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
              <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
              <div>BONUS CONTENT</div>
          </legend>
          <TextListEditor
              v-model="patternInfo.bonus_tips"
              label="Pro Tips for Success"
              text-placeholder="Pro Tips for Success description ..."
              list-placeholder="Pro Tips for Success used in this pattern ..."
          />
          <TextListEditor
              v-model="patternInfo.bonus_idea"
              label="Variation Ideas"
              text-placeholder="Variation Ideas description ..."
              list-placeholder="Variation Ideas used in this pattern ..."
          />
          <TextListEditor
              v-model="patternInfo.bonus_community"
              label="Community & Feedback"
              text-placeholder="Community & Feedback description ..."
              list-placeholder="Community & Feedback used in this pattern ..."
          />
      </div>

      <div style="padding: 80px 0"></div>
    </div>



    <dialog id="import-instruction-modal" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-6">Import Instruction</h3>
        <textarea 
          v-model="importTextArea"
          class="textarea"
          style="width: 100%; margin-bottom: 8px; min-height: 360px;"
          placeholder="Paste the instruction text here..."
        ></textarea>
        <div class="modal-action">
          <form method="dialog" style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-soft btn-primary" @click="confirmImportInstruction()">Confirm</button>
            <button class="btn">Cancel</button>
          </form>
        </div>
      </div>
    </dialog>


  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PatternInfo } from '~/types/PatternInfo'
import crochetDictData from '~/data/crochet_dict.json'
import TextListEditor from '~/components/editor/text-list/index.vue'
import Upload from '~/components/upload/index.vue'

interface Props {
  patternInfo: PatternInfo
}

const props = defineProps<Props>()

// 处理 crochet_dict.json 数据，按 section 分组
const crochetSections = computed(() => {
  return crochetDictData.sections.map(section => ({
    id: section.section_id,
    name: section.section_name,
    terms: section.rows.reduce((acc, row) => {
      acc[row.us] = {
        chinese: row.chinese,
        notation_cn: row.notation_cn,
        us_abbrev: row.us_abbrev,
        us: row.us,  // 添加这一行
        us_description: row.us_description,  // 添加这一行
        description: row.description
      }
      return acc
    }, {} as Record<string, any>)
  }))
})

// 添加响应式依赖
const navSections = computed(() => {
  if (typeof document === 'undefined') return []
  
  // 依赖可能影响 DOM 的数据
  const _ = crochetSections.value // 触发重新计算
  
  // 查找所有 data-nav 元素
  return Array.from(document.querySelectorAll('[data-nav]'))
})


// 重置所有术语选中状态
const resetAbbreviations = () => {
  props.patternInfo.terms = []
}

// 检查术语是否已被选中
const isTermSelected = (key: string) => {
  return props.patternInfo.terms.some(term => term.alias === key)
}

// 切换术语选中状态
const toggleTerm = (abbrev: string) => {
  const existingIndex = props.patternInfo.terms.findIndex(term => term.alias === abbrev)
  
  if (existingIndex >= 0) {
    props.patternInfo.terms.splice(existingIndex, 1)
  } else {
    // 在所有 sections 中查找对应的术语
    let termData = null
    for (const section of crochetSections.value) {
      const foundTerm = Object.values(section.terms).find(term => term.us_abbrev === abbrev)
      if (foundTerm) {
        termData = foundTerm
        break
      }
    }
    
    if (termData) {
      props.patternInfo.terms.push({
        alias: abbrev,  // 使用 us_abbrev 作为 alias
        full_text: termData.us || abbrev,  // 使用完整的 us 名称
        description: termData.us_description || termData.description
      })
    }
  }
}

// 添加新的指令步骤
const addInstructionStep = () => {
  props.patternInfo.instructions.push({
    title: '',
    text: '',
    description: '',
    list: [],
    image: [],
    end_description: null,
    bottom: false
  })
}

// 删除指定索引的指令步骤
const removeInstructionStep = (stepIndex: number) => {
  if (stepIndex >= 0 && stepIndex < props.patternInfo.instructions.length) {
    props.patternInfo.instructions.splice(stepIndex, 1)
  }
}

// 统一的指令字段更新函数
const updateInstructionField = (stepIndex: number, field: 'title' | 'description' | 'text' | 'end_description' | 'bottom', value: string | boolean) => {
  const instruction = props.patternInfo.instructions[stepIndex]
  if (instruction) {
    (instruction as any)[field] = value
  }
}

// 添加指令列表项
const addInstructionListItem = (stepIndex: number) => {
  const instruction = props.patternInfo.instructions[stepIndex]
  if (instruction) {
    instruction.list.push('')
  }
}

// 删除指令列表项
const removeInstructionListItem = (stepIndex: number, listIndex: number) => {
  const instruction = props.patternInfo.instructions[stepIndex]
  if (instruction && listIndex >= 0 && listIndex < instruction.list.length) {
    instruction.list.splice(listIndex, 1)
  }
}

// 更新指令列表项
const updateInstructionListItem = (stepIndex: number, listIndex: number, value: string) => {
  const instruction = props.patternInfo.instructions[stepIndex]
  if (instruction && instruction.list[listIndex] !== undefined) {
    instruction.list[listIndex] = value
  }
}

// 文件上传
// 单文件存储
const coverImage = ref<File[]>([])
// 文件二维矩阵
const imageMatrix = ref<File[][]>([])

// 上传回调
const handleUploadSuccess = (uploadId: string, result: any, file: File) => {
    if (uploadId === 'cover-image') {
        props.patternInfo.cover_image = result.url
    } else if (uploadId.startsWith('pattern-step:')) {
        const stepIndexStr = uploadId.split(':')[1]
        if (stepIndexStr) {
            const stepIndex = parseInt(stepIndexStr)
            const instruction = props.patternInfo.instructions[stepIndex]
            if (instruction && stepIndex >= 0 && stepIndex < props.patternInfo.instructions.length) {
                instruction.image.push(result.url)
            }
        }
    }
}

const handleRemove = (uploadId: string, file: File | null, index: number, isUrl?: boolean) => {
  if (uploadId === 'cover-image') {
    // 无论是文件还是URL预览被移除，都清空cover_image
    props.patternInfo.cover_image = ''
  } else if (uploadId.startsWith('pattern-step:')) {
    const stepIndexStr = uploadId.split(':')[1]
    if (stepIndexStr) {
      const stepIndex = parseInt(stepIndexStr)
      const instruction = props.patternInfo.instructions[stepIndex]
      if (instruction && stepIndex >= 0 && stepIndex < props.patternInfo.instructions.length) {
        instruction.image.splice(index, 1)
      }
    }
  }
}

const handleUploadError = (uploadId: string, err: Error, file: File) => {
  console.error('Upload error', uploadId, err, file)
}

const currentStepIndex = ref(0)

const openImportModal = (stepIndex: number) => {
  currentStepIndex.value = stepIndex
  ;(document.getElementById('import-instruction-modal') as HTMLDialogElement)?.showModal()
}

// 添加 ref
const importTextArea = ref<string>('')

// 添加确认导入方法
const confirmImportInstruction = () => {
  const content = importTextArea.value || ''
  console.log("content: ", content)
  console.log("currentStepIndex: ", currentStepIndex)
  if (content.trim()) {
    // 按换行分割成数组，过滤空行
    const steps = content.split('\n').filter(line => line.trim() !== '')    
    console.log("steps: ", steps)
    console.log("currentStepIndex: ", currentStepIndex.value)
    // 直接替换当前 instruction 的 list
    const instruction = props.patternInfo.instructions[currentStepIndex.value]
    if (instruction) {
      instruction.list = steps
    }
    
    // 清空输入框并关闭模态框
    importTextArea.value = '';
    (document.getElementById('import-instruction-modal') as HTMLDialogElement)?.close()
  }
  
}

</script>

<style scoped lang="scss">
.grid-btn-group {
    display: flex; 
    flex-wrap: wrap;
    gap: 10px;

    .grid-btn {
        cursor: pointer;
        padding: 8px 12px;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        background-color: #f9fafb;
        transition: all 0.2s ease;
        text-align: center;
        font-size: 14px;
        
        &.selected {
            border-color: #3b82f6;
            background-color: #eff6ff;
        }
    }
}

.position-bar {
    position: absolute;
    top: 0;
    right: -2px;
    width: 1px;
    height: 100vh;
    background-color: #3b82f6;
    z-index: 1000;
    padding-top: 10px;

    .position-cursor {
        position: relative;
        top: 0;
        left: -4px;
        width: 9px;
        height: 9px;
        background-color: #3b82f6;
        z-index: 1000;
        border-radius:50% ;
        cursor: pointer;

        &:hover {
            background-color: #2563eb;
        }
        
    }
}

.remove-btn {
    cursor: pointer;
    &:hover {
        color: $danger-color;
        opacity: 1;
    }
}

.form-section::-webkit-scrollbar {
    display: none;
}

.form-section {
    padding: 10px 0;
    display: flex;
    gap: 10px;
    flex-direction: column;
    overflow-y: auto;
    height: calc(100vh - 50px);
    scrollbar-width: none;
    -ms-overflow-style: none;

    position: relative;

    

    .input-set {
        margin-bottom: 20px;

        .form-title {
            font-size: 14px;
            font-weight: 700;
            color: $dark-color;
            margin-bottom: 25px;
        }

        .input-item {
            margin-bottom: 25px;

            .input-label {
                font-size: 12px;
                font-weight: 500;
                opacity: 0.6;
                display: flex;
                align-items: center;
            }
        }
    }
}
</style>