<template>
<div class="base-container prose" :style="{ padding: `${paddingY}px ${paddingX}px` }">
    <div class="mb-4">
        <div class="mb-8">
            <div class="title">{{ patternData.title ? patternData.title : 'Default Title (Required)' }}</div>
            <div class="subtitle">{{ patternData.subtitle ? patternData.subtitle : 'Default Subtitle Description' }}</div>
            <div class="italic mt-2" v-if="patternData.inspiration" style="background-color: oklch(98.5% 0.002 247.839); border-radius: 6px; padding: 8px 10px; font-size: 12px">
                {{ patternData.inspiration }}
            </div>
        </div>

        <div class="mb-10" style="font-size: 12px; opacity: 0.8;">
            <div>Created by: MixionAria Studio</div>
            <div>Contact: Message us on Etsy for support</div>
            <div>Website/Shop: <a href="https://www.etsy.com/sg-en/shop/MixionAriaStudio">https://www.etsy.com/sg-en/shop/MixionAriaStudio</a></div>
        </div>

        <div class="info-box">
            <!-- <div class="badge badge-soft badge-primary">Beginner Friendly</div> -->
            <div class="box-item">
                <div class="item-label">✨ SKILL LEVEL</div>
                <div class="badge badge-soft badge-primary">{{ patternData.skillLevel }}</div>
            </div>
            <div class="box-item">
                <div class="item-label">⏱️ ESTIMATED TIME</div>
                <div class="item-value" :class="{'gray-scale': !patternData.estimatedTime}">{{ patternData.estimatedTime ? patternData.estimatedTime : 'Required' }}</div>
            </div>
            <div class="box-item">
                <div class="item-label">📱 LANGUAGE</div>
                <div class="item-value">English</div>
            </div>
            <div class="box-item" style="grid-column: span 2;">
                <div class="item-label">📏 FINISHED SIZE</div>
                <div class="item-value" :class="{'gray-scale': !patternData.finishedSize}">{{ patternData.finishedSize ? patternData.finishedSize : 'Required' }}</div>
            </div>
            <div class="box-item" style="grid-column: span 2;">
                <div class="item-label">🎯 PATTERN TYPE</div>
                <div class="item-value">Digital PDF Download</div>
            </div>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            📋 PATTERN INFORMATION
        </div>
        <div>
            <h4>What You'll Create</h4>
            <div>{{ patternData.info.text }}, complete with:</div>
            <ul>
                <li v-for="(item, index) in patternData.info.list" :key="index">{{ item }}</li>
            </ul>
        </div>
        <div>
            <h4>Difficulty Notes</h4>
            <div>{{ patternData.note.text }}</div>
            <ul>
                <li v-for="(item, index) in patternData.note.list" :key="index">{{ item }}</li>
            </ul>
        </div>
    </div>

    <div class="section-block">
        <div class="divider-title">
            🔤 ABBREVIATIONS & TECHNIQUES
        </div>
        <div>
            <h4>Standard Abbreviations</h4>
            <table>
                <thead>
                    <tr>
                        <th>Abbreviation</th>
                        <th>Full Term</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(term, index) in patternData.terms" :key="index">
                        <td style="white-space: nowrap;">{{ term.alias }}</td>
                        <td style="white-space: nowrap;">{{ term.full_text }}</td>
                        <td>{{ term.description }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <h4>Special Techniques Used</h4>
            <div>{{ patternData.techniques.text }}</div>
            <ul>
                <li v-for="(technique, index) in patternData.techniques.list" :key="index">
                    <template v-if="technique.includes(':')">
                        <strong>{{ technique.split(':')[0] }}:</strong>{{ technique.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ technique }}
                    </template>
                </li>
            </ul>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            🧶 MATERIALS & TOOLS
        </div>
        <div v-if="patternData.materialsDesc">
            <div style="white-space: pre-wrap; word-wrap: break-word;">{{ patternData.materialsDesc }}</div>
        </div>
        <div>
            <h4>Yarn Requirements</h4>
            <div>
                <div><strong>Recommended Yarn:</strong> {{ patternData.yarn }}</div>
                <div><strong>Suggested Brands:</strong> {{ patternData.brands }}</div>
            </div>
        </div>
        <div>
            <h4>Color Palette</h4>
            <ul>
                <li v-for="(color, index) in patternData.colors.list" :key="index">
                  <template v-if="color.includes(':')">
                    <strong>{{ color.split(':')[0] }}</strong>{{ color.substring(color.indexOf(':')) }}
                  </template>
                  <template v-else>
                    {{ color }}
                  </template>
                </li>
            </ul>
        </div>
        <div>
            <h4>Tools & Notions</h4>
            <ul>
                <li v-for="(tool, index) in patternData.tools.list" :key="index">
                    <template v-if="tool.includes(':')">
                        <strong>{{ tool.split(':')[0] }}:</strong>{{ tool.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ tool }}
                    </template>
                </li>
            </ul>
        </div>
        <div>
            <h4>Optional Supplies</h4>
            <ul>
                <li v-for="(supply, index) in patternData.supplies.list" :key="index">
                    {{ supply }}
                </li>
            </ul>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            🎯 MAIN PATTERN INSTRUCTIONS
        </div>
        <div v-for="(item, index) in patternData.instructions">
            <h4>{{ item.title }}</h4>
            <div>{{ item.text }}</div>
            <div>{{ item.description }}</div>
            <div class="py-2" style="display: flex; width: 100%; justify-content: space-between;">
                <div style="flex-grow: 1;">
                    <div v-for="(step, index) in item.list" :key="index" class="round-step">
                        <div v-if="step.toLowerCase().startsWith('rnd') || step.toLowerCase().startsWith('round')" class="checkbox"></div>
                        {{ step }}
                    </div>
                </div>
                <div style="width: 21%; display: flex; flex-direction: column; gap: 10px; padding-top: 5px">
                    <img v-for="(url, index) in item.image" style="width: 100%; margin: 0; border-radius: 4px;" :key="index" :src="url" />
                </div>
            </div>  
        </div>
        <!-- <div>
            <h4>Body</h4>
            <div>With white yarn</div>
            <div>Start with making a round base. Work in continuous rounds without slip stitches.
                you can stuff the chick's body with fiberfill to achieve the desired appearance; 
                there's no need to pack it too tightly—a bit of fluffiness is ideal.
            </div>
            <div class="py-2" style="display: flex; width: 100%; justify-content: space-between;">
                <div style="flex-grow: 1;">
                    <div class="round-step"><div class="checkbox"></div>Rnd 1: 6sc in the MR(6)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 2: 6inc (12)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 3: 6 * (sc, inc) (18)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 4: 6 * (sc, inc, sc) (24)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 5: 6 * (3sc, inc) (30)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 6: 6 * (2sc, inc, 2sc) (36)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 7-8: 36sc (2 rounds)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 9: 9sc, inc, 16sc, inc, 9sc (38)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 10-11: 38sc (2 rounds)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 12: 10sc, inc, 16sc, inc, 10sc (40)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 13-14: 40sc (2 rounds)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 15:BLO 11sc, inc, 16sc, inc, 11sc (42)</div>
                    <div>Change to light khaki color</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 16: BLO 42sc (42)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 17: 11sc, 2inc, 16sc, 2inc, 11sc (46)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 18-19: 46sc (2 rounds)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 20: 12sc, 2inc, 18sc, 2inc, 12sc (50)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 21: BLO 50sc (50)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 22-23: 50sc (2 rounds)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 24: 4 * (10sc, dec), 2sc (46)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 25: 46sc (46)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 26: 6 * (5sc, dec), 4sc (40)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 27: 6 * (2sc, dec, 2sc), 4sc (34)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 28: 6 * (3sc, dec), 4sc (28)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 29: 7 * (sc, dec, sc) (21)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 30: 7 * (sc, dec) (14)</div>
                    <div class="round-step"><div class="checkbox"></div>Rnd 31: 7 * (dec) (7)</div>
                </div>
                <div style="width: 21%; display: flex; flex-direction: column; gap: 10px; padding-top: 5px">
                    <img style="width: 100%; margin: 0; border-radius: 4px;" src="https://pub.qingheplus.cn/%E5%B0%8F%E9%B8%A1%E4%BB%94%E8%A1%A3%E6%9C%8D%E8%B5%B7%E9%92%88%E4%BD%8D%E7%BD%AE.jpg" />
                    <img style="width: 100%; margin: 0; border-radius: 4px;" src="https://pub.qingheplus.cn/%E5%B0%8F%E9%B8%A1%E4%BB%94%E8%A1%A3%E6%9C%8D%E8%B5%B7%E9%92%88%E4%BD%8D%E7%BD%AE.jpg" />
                </div>
            </div>
        </div>

        <div>
            <h4>WINGS/HANDS</h4>
            <div>Make 2 - Using White yarn</div>
            <div></div>
            <div class="py-2" style="display: flex; width: 100%; justify-content: space-between;">
                <div style="flex-grow: 1;">
                    <div class="round-step"><div class="checkbox"></div>Round 1: Magic ring, 6 sc in ring (6)</div>
                    <div class="round-step"><div class="checkbox"></div>Round 2: inc in each st around (12)</div>
                    <div class="round-step"><div class="checkbox"></div>Round 3-8: sc in each st around (12)</div>
                    <div class="round-step"><div class="checkbox"></div>Lightly stuff</div>
                    <div class="round-step"><div class="checkbox"></div>Round 9: dec around (6)</div>
                    <div class="round-step"><div class="checkbox"></div>Fasten off, leaving long tail for sewing</div>
                </div>
                <div style="width: 21%; display: flex; flex-direction: column; gap: 10px; padding-top: 5px">
                    <img style="width: 100%; margin: 0; border-radius: 4px;" src="https://pub.qingheplus.cn/%E5%B0%8F%E9%B8%A1%E4%BB%94%E8%A1%A3%E6%9C%8D%E8%B5%B7%E9%92%88%E4%BD%8D%E7%BD%AE.jpg" />
                </div>
            </div>  
        </div>

        <div>
            <h4>ASSEMBLY/DECORATION</h4>
            <div>Make 2 - Using White yarn</div>
            <div>Use a hot glue gun or fine thread to attach the other parts to the chick's body, 
                then wait for everything to set before completing.
            </div>
            <div class="py-2" style="display: flex; width: 100%; justify-content: space-between;">
                <div style="flex-grow: 1;">
                </div>
                <div style="width: 21%; display: flex; flex-direction: column; gap: 10px; padding-top: 5px; flex-shrink: 0;">
                    <img style="width: 100%; margin: 0; border-radius: 4px;" src="https://pub.qingheplus.cn/%E5%B0%8F%E9%B8%A1%E4%BB%94-%E5%B0%BE%E5%B7%B4%E7%85%A7%E7%89%87.jpg" />
                </div>
            </div>  
        </div> -->
    </div>


    <div class="section-block">
        <div class="divider-title">
            ✨ FINISHING TIPS & TECHNIQUES
        </div>
        <div>
            <h4>Professional Finishing</h4>
            <ul>
                <li v-for="item in patternData.finishingTips.list" :key="item">
                    <template v-if="item.includes(':')">
                        <strong>{{ item.split(':')[0] }}:</strong>{{ item.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ item }}
                    </template> 
                </li>
            </ul>
        </div>
        <div>
            <h4>Troubleshooting</h4>
            <ul>
                <li v-for="item in patternData.troubleshooting.list" :key="item">
                    <template v-if="item.includes(':')">
                        <strong>{{ item.split(':')[0] }}:</strong>{{ item.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ item }}
                    </template> 
                </li>
            </ul>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            📜 COPYRIGHT & TERMS OF USE
        </div>
        <div>
            <h4>License Terms</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <strong>✅ You MAY:</strong>
                    <ul style="font-size: 12px;">
                        <li>Use this pattern for personal projects</li>
                        <li>Sell finished items made from this pattern (small quantities)</li>
                        <li>Gift finished items to friends and family</li>
                        <li>Modify the pattern for personal use</li>
                    </ul>
                </div>
                <div>
                    <strong>❌ You MAY NOT:</strong>
                    <ul style="font-size: 12px;">
                        <li>Share, distribute, or resell this PDF pattern</li>
                        <li>Claim this pattern as your own design</li>
                        <li>Use for mass production or commercial manufacturing</li>
                        <li>Post the pattern content online or in forums</li>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            <h4>Copyright Notice</h4>
            <div>© 2025 MixionAria. All rights reserved. This pattern is for personal use only. </div>
        </div>
        <div>
            <h4>Support & Contact</h4>
            <div>Questions about the pattern? Message us on Etsy!</div>
            <div>We're here to help you create something amazing! 💝</div>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            🎁 BONUS CONTENT
        </div>
        <div>
            <h4>Pro Tips for Success</h4>
            <ul>
                <li v-for="item in patternData.bonus_tips.list" :key="item">
                    <template v-if="item.includes(':')">
                        <strong>{{ item.split(':')[0] }}:</strong>{{ item.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ item }}
                    </template> 
                </li>
            </ul>
        </div>
        <div>
            <h4>Variation Ideas</h4>
            <ul>
                <li v-for="item in patternData.bonus_idea.list" :key="item">
                    <template v-if="item.includes(':')">
                        <strong>{{ item.split(':')[0] }}:</strong>{{ item.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ item }}
                    </template> 
                </li>
            </ul>
        </div>
        <div>
            <h4>Community & Feedback</h4>
            <div v-for="item in patternData.bonus_community.list" :key="item">
                 {{ item }}
            </div>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            📱 THANK YOU!
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>Thank you for choosing our pattern! We hope you enjoy creating your Jacket Chickie.</div>
            <strong>Happy Crocheting! 🧶💕</strong>
            <div class="italic">If you loved this pattern, please consider leaving a review on Etsy. Your feedback helps us create more amazing patterns!</div>
        </div>
        
    </div>

     
</div>
</template>
<script setup lang="ts">
import { PatternInfo } from '~/types/PatternInfo'

// Props 定义
interface Props {
  paddingX?: number
  paddingY?: number
  patternData: PatternInfo
}

const props = withDefaults(defineProps<Props>(), {
  paddingX: 80,
  paddingY: 40
})
</script>
<style scoped lang="scss">

.base-container {
  font-size: 16px;

  &.prose {
    max-width: none !important; /* 移除 prose 的宽度限制 */
    width: 100% !important;     /* 确保填满父容器 */
  }

  .title {
    font-size: 28px;
    font-weight: 800;
  }

  .subtitle {
    opacity: 0.8;
    margin-bottom: 10px;
  }

}

.section-block {
    padding: 15px 0;

    .divider-title {
        margin: 20px 0;
        display: flex;
        align-items: center;
        width: 100%;
        padding-bottom: 5px;
        border-bottom: 1px dashed #e5e5e5;
        font-weight: 600;
    }

    li {
        margin: 0;
    }

    .round-step {
       display: flex;
       align-items: center;
       gap: 10px;

       .checkbox {
        width: 16px;
        height: 16px;
        border: 1px solid #000;
        border-radius: 3px;
        opacity: 0.2;
       }
    }
}

.info-box {
    border: 2px dashed oklch(75% 0.183 55.934);
    padding: 15px; 
    border-radius: 5px;
    background-color: oklch(98% 0.016 73.684);
    display: flex;
    flex-direction: column;
    gap:8px;
    
    /* 强制打印背景色 - 修复版本 */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    /* 移除已废弃的 color-adjust 属性 */

    .box-item {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;

        .item-label {
            opacity: 0.8;
            width: 150px;
        }

        .item-value {
            font-weight: 600;
        }
    }

}

/* 表格样式 */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 14px;
}

thead {
  background-color: #f8f9fa;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border: 1px solid #dee2e6;
}

th {
  font-weight: 600;
  color: #495057;
  background-color: #e9ecef;
}

td {
  color: #212529;
}

tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

tbody tr:hover {
  background-color: #e3f2fd;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .title {
    font-size: 24px;
  }
  
  .info-box {
    grid-template-columns: 1fr;
  }
  
  table {
    font-size: 12px;
  }
  
  th, td {
    padding: 8px 12px;
  }
}



/* 专门的打印样式 */
@media print {
    .info-box {
        background-color: oklch(98% 0.016 73.684) !important;
        -webkit-print-color-adjust: exact !important;
        // color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}

.gray-scale {
    filter: grayscale(70%);
    opacity: 0.5;
}
</style>
