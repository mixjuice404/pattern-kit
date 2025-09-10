<template>
  <div>
    <div class="form-section" style="padding: 15px;">

        <div class="input-set">
            <legend class="form-title">Basic Info</legend>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px;">封面/主图</div>
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
                <div class="input-label" style="margin-bottom: 8px;">标题</div>
                <input 
                  type="text" 
                  class="input" 
                  style="width: 100%;" 
                  placeholder="Type here" 
                  v-model="patternInfo.title"
                />
            </div>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px;">描述</div>
                <input 
                  type="text" 
                  class="input" 
                  style="width: 100%;" 
                  placeholder="Type here" 
                  v-model="patternInfo.subtitle"
                />
            </div>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px;">创作灵感</div>
                <textarea 
                  class="textarea" 
                  placeholder="Bio" 
                  style="width: 100%;" 
                  rows="6"
                  v-model="patternInfo.inspiration"
                ></textarea>
            </div>
        </div>
        <div class="input-set">
            <legend class="form-title">Pattern Properties</legend>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px;">SKILL LEVEL</div>
                <select class="select" style="width: 100%;" v-model="patternInfo.skillLevel" >
                    <option selected>Beginner</option>
                    <option>Easy</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert / Master</option>
                </select>
            </div>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px;">ESTIMATED TIME</div>
                <input 
                  type="text" 
                  class="input" 
                  style="width: 100%;" 
                  placeholder="6-8 hours" 
                  v-model="patternInfo.estimatedTime"
                />
            </div>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px;">FINISHED SIZE</div>
                <input 
                  type="text" 
                  class="input" 
                  style="width: 100%;" 
                  placeholder="Approximately 12cm tall (using 3.5mm hook)" 
                  v-model="patternInfo.finishedSize"
                />
            </div>
        </div>
        <div class="input-set" >
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

        <div class="input-set" >
            <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
                <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
                <div>ABBREVIATIONS & TECHNIQUES</div>
            </legend>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px; display: flex; align-items: center; gap: 5px">
                    <input type="checkbox" :checked="true" class="checkbox checkbox-success checkbox-xs" />
                    <div>Abbreviations List</div>
                </div>
                <div class="grid-btn-group">
                    <div 
                        v-for="(value, key) in gridBtnList" 
                        :key="key" 
                        class="grid-btn"
                        :class="{ 'selected': isTermSelected(key) }"
                        @click="toggleTerm(key)"
                    >
                        {{ key }}
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

        <div class="input-set" >
            <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
                <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
                <div>MATERIALS & TOOLS</div>
            </legend>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px; display: flex; align-items: center; gap: 5px">
                    <input type="checkbox" :checked="true" class="checkbox checkbox-success checkbox-xs" />
                    <div>Recommended Yarn</div>
                </div>
                <input 
                  type="text" 
                  class="input" 
                  style="width: 100%; margin-bottom: 8px;" 
                  placeholder="Recommended yarn for this pattern ..." 
                  v-model="patternInfo.yarn"
                />
            </div>
            <div class="input-item">
                <div class="input-label" style="margin-bottom: 8px; display: flex; align-items: center; gap: 5px">
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

        <div class="input-set" >
            <legend class="form-title" style="display: flex; align-items: center; gap: 6px">
                <input type="checkbox" :checked="true" class="checkbox checkbox-primary checkbox-xs" />
                <div>MAIN PATTERN INSTRUCTIONS</div>
            </legend>
            <div style="display: grid; grid-template-columns: 2fr 1fr; align-items: center; gap: 6px; margin-bottom: 20px;">
                <button class="btn btn-primary">Export Instruction</button>
                <button class="btn btn-primary" @click="addInstructionStep">Add</button>
            </div>
            
            <!-- 动态渲染指令步骤 -->
            <div v-for="(instruction, stepIndex) in patternInfo.instructions" :key="stepIndex" style="padding: 5px; border:2px dashed #e5e5e5; border-radius: 4px; margin-bottom: 10px;">
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
                    <input
                        type="text" 
                        class="input" 
                        style="width: 100%; margin-bottom: 8px;" 
                        placeholder="Description of the instruction ..." 
                        :value="instruction.description || ''"
                        @input="updateInstructionField(stepIndex, 'description', ($event.target as HTMLInputElement).value)"
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
                    
                </div>
            </div>
            
            <!-- 无指令步骤时的提示 -->
            <div v-if="patternInfo.instructions.length === 0" style="padding: 20px; text-align: center; opacity: 0.5;">
                点击 "Add" 按钮添加第一个指令步骤
            </div>
        </div>

        <div class="input-set" >
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


        <div class="input-set" >
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PatternInfo } from '~/types/PatternInfo'
import crochetTermsData from '~/data/crochet-terms.json'
import TextListEditor from '~/components/editor/text-list/index.vue'
import Upload from '~/components/upload/index.vue'

interface Props {
  patternInfo: PatternInfo
}

const props = defineProps<Props>()

// 使用导入的 JSON 数据
const gridBtnList = ref<Record<string, { full_text: string; description: string }>>(crochetTermsData)

// 检查术语是否已被选中
const isTermSelected = (alias: string) => {
  return props.patternInfo.terms.some(term => term.alias === alias)
}

// 切换术语选中状态
const toggleTerm = (alias: string) => {
  const existingIndex = props.patternInfo.terms.findIndex(term => term.alias === alias)
  
  if (existingIndex >= 0) {
    props.patternInfo.terms.splice(existingIndex, 1)
  } else {
    const termData = gridBtnList.value[alias]
    if (termData) {
      props.patternInfo.terms.push({
        alias: alias,
        full_text: termData.full_text,
        description: termData.description
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
    image: []
  })
}

// 删除指定索引的指令步骤
const removeInstructionStep = (stepIndex: number) => {
  if (stepIndex >= 0 && stepIndex < props.patternInfo.instructions.length) {
    props.patternInfo.instructions.splice(stepIndex, 1)
  }
}

// 统一的指令字段更新函数
const updateInstructionField = (stepIndex: number, field: 'title' | 'description' | 'text', value: string) => {
  const instruction = props.patternInfo.instructions[stepIndex]
  if (instruction) {
    instruction[field] = value
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

</script>

<style scoped lang="scss">
.grid-btn-group {
    display: grid; 
    grid-template-columns: repeat(6, 1fr); 
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
            }
        }
    }
}
</style>