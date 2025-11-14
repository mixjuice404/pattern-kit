<template>
<div class="base-container prose" :style="{ padding: `${paddingY}px ${paddingX}px` }">
    <div class="mb-4">
        <div class="mb-8">
            <div class="title">{{ patternData.title ? patternData.title : 'Default Title (Required)' }}</div>
            <!-- <div class="subtitle">{{ patternData.subtitle ? patternData.subtitle : 'Default Subtitle Description' }}</div> -->
            <div class="italic mt-2" v-if="patternData.inspiration" style="white-space: pre-wrap; background-color: oklch(98.5% 0.002 247.839); border-radius: 6px; padding: 8px 10px; font-size: 12px" v-html="patternData.inspiration">
            </div>
        </div>

        <div class="mb-10" style="font-size: 12px; opacity: 0.8;">
            <div>Created by: CozyDogOutfits</div>
            <div>Contact: Message us on Etsy for support</div>  
            <div>Website/Shop: <a href="https://www.etsy.com/shop/CozyDogOutfits">https://www.etsy.com/shop/CozyDogOutfits</a></div>
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

    <div class="section-block" v-if="patternData.introduction.title">
        <div class="divider-title">
            {{ patternData.introduction.title }}
        </div>
        <div class="rich-text" v-html="patternData.introduction.text"></div>
    </div>

    <div class="section-block">
        <div class="divider-title">
            🔤 ABBREVIATIONS & TECHNIQUES
        </div>
        <div>
            <h4>Standard Abbreviations</h4>
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>Abbreviation</th>
                        <th>Full Term</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(term, index) in patternData.terms" :key="index">
                        <td>{{ term.alias }}</td>
                        <td>{{ term.full_text }}</td>
                        <td>{{ term.description }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-if="patternData.techniques.text || patternData.techniques.list.length > 0">
            <h4>Special Techniques Used</h4>
            <div>{{ patternData.techniques.text }}</div>
            <ul>
                <li v-for="(technique, index) in patternData.techniques.list" :key="index">
                    <template v-if="typeof technique === 'string' && technique.includes(':')">
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
            <div class="rich-text" v-html="patternData.materialsDesc"></div>
        </div>
        <div v-if="patternData.yarn || patternData.brands">
            <h4>Yarn Requirements</h4>
            <div>
                <div><strong>Recommended Yarn:</strong> <span v-html="patternData.yarn"></span></div>
                <div><strong>Suggested Brands:</strong> {{ patternData.brands }}</div>
            </div>
        </div>
        <div v-if="patternData.colors.list.length > 0">
            <h4>Color Palette</h4>
            <div v-if="patternData.colors.text">{{ patternData.colors.text }}</div>
            <ul>
                <li v-for="(color, index) in patternData.colors.list" :key="index">
                  <template v-if="typeof color === 'string' && color.includes(':')">
                    <strong>{{ color.split(':')[0] }}</strong>{{ color.substring(color.indexOf(':')) }}
                  </template>
                  <template v-else>
                    {{ color }}
                  </template>
                </li>
            </ul>
        </div>
        <div v-if="patternData.tools.list.length > 0">
            <h4>Tools & Notions</h4>
            <ul>
                <li v-for="(tool, index) in patternData.tools.list" :key="index">
                    <template v-if="typeof tool === 'string' && tool.includes(':')">
                        <strong>{{ tool.split(':')[0] }}:</strong>{{ tool.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ tool }}
                    </template>
                </li>
            </ul>
        </div>
        <div v-if="patternData.supplies.list.length > 0">
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
        <div v-for="(instructionGroup, groupIndex) in patternData.instructions" :key="groupIndex" class="instruction-group" style="margin-bottom: 40px;">
            <div style="font-size: 28px; font-weight: 700;" v-if="instructionGroup.title" class="group-title">{{ instructionGroup.title.toUpperCase() }}</div>
            <div v-if="instructionGroup.description" v-html="instructionGroup.description"></div>
            <div v-for="(item, index) in instructionGroup.steps" :key="index" class="instruction-item">
                <div style="margin-top: 15px; font-size: 20px; font-weight: 700;margin-bottom: 10px;" v-if="item.title">{{ item.title }}</div>
                <div v-if="item.text">{{ item.text }}</div>
                <div v-if="item.description" class="description" v-html="item.description"></div>
                <div class="content-row">
                    <div class="steps-column">
                        <div v-for="(step, stepIndex) in item.extendList || []" :key="stepIndex" class="round-step">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="align-self: flex-start;" v-if="step.content && (step.content.toLowerCase().startsWith('rnd') || step.content.toLowerCase().startsWith('round'))">
                                    <div  class="checkbox" style="margin-top: -2px;"></div>
                                </div>
                                <div v-html="step.content"></div>
                            </div>
                            <ul v-if="step.subList && step.subList.length > 0" class="sub-list">
                                <li v-for="(subItem, subIndex) in step.subList" :key="subIndex" v-html="subItem"></li>
                            </ul>
                        </div>
                    </div>
                    <div v-if="!item.bottom" class="images-column">
                        <div v-for="(url, imgIndex) in item.image" :key="imgIndex" style="position: relative;">
                            <img  :src="url" />
                            <div class="shadow" style="font-weight: 600; position: absolute; bottom: 5px; right: 5px; background-color: #f97316; color: #fff; padding: 4px 7px; line-height: 1; font-size: 12px; border-radius: 4px;">
                                {{ (imgIndex + 1) }}
                            </div>   
                        </div>
                    </div>
                </div> 
                <div v-if="item.bottom" class="bottom-images">
                    <div v-for="(url, imgIndex) in item.image" :key="imgIndex" style="position: relative;">
                        <img  :src="url" />
                        <div class="shadow" style="font-weight: 600; position: absolute; bottom: 5px; right: 5px; background-color: #f97316; color: #fff; padding: 5px 8px; line-height: 1; font-size: 12px; border-radius: 4px;">
                            {{(imgIndex + 1) }}
                        </div> 
                    </div>
                </div> 
                <div v-if="item.end_description" class="end-description" v-html="item.end_description"></div>
            </div>
        </div>
    </div>


    <div class="section-block" v-if="patternData.finishingTips.list.length > 0">
        <div class="divider-title">
            ✨ CREATIVE NOTES & TIPS
        </div>
        <ul>
            <li v-for="(item, index) in patternData.finishingTips.list" :key="index">
                <template v-if="typeof item === 'string' && item.includes(':')">
                    <strong>{{ item.split(':')[0] }}:</strong>{{ item.split(':')[1] }}
                </template>
                <template v-else>
                    {{ item }}
                </template> 
            </li>
        </ul>
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
            <div>© 2025 CozyDogOutfits. All rights reserved. This pattern is for personal use only. </div>
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
        <div v-if="patternData.bonus_tips.list.length > 0">
            <h4>Pro Tips for Success</h4>
            <ul>
                <li v-for="(item, index) in patternData.bonus_tips.list" :key="index">
                    <template v-if="typeof item === 'string' && item.includes(':')">
                        <strong>{{ item.split(':')[0] }}:</strong>{{ item.split(':')[1] }}
                    </template>
                    <template v-else>
                        {{ item }}
                    </template> 
                </li>
            </ul>
        </div>
        <div v-if="patternData.bonus_idea.list.length > 0 && patternData.template !== 'simple'">
            <h4>Variation Ideas</h4>
            <ul>
                <li v-for="(item, index) in patternData.bonus_idea.list" :key="index">
                    <template v-if="typeof item === 'string' && item.includes(':')">
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
            <div v-for="(item, index) in patternData.bonus_community.list" :key="index">
                 {{ item }}
            </div>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            📱 THANK YOU!
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>Thank you for choosing our pattern! We hope you enjoy creating your <strong>{{ patternData.title }}</strong>.</div>
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
@use '../common.scss';
</style>
