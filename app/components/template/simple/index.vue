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
            <div>{{ L.createdBy }}</div>
            <div>{{ L.contact }}</div>
            <div>{{ L.websiteShop }}: <a href="https://www.etsy.com/shop/CozyDogOutfits">https://www.etsy.com/shop/CozyDogOutfits</a></div>
        </div>

        <div class="info-box">
            <div class="box-item">
                <div class="item-label">{{ L.skillLevelLabel }}</div>
                <div class="badge badge-soft badge-primary">{{ patternData.skillLevel }}</div>
            </div>
            <div class="box-item">
                <div class="item-label">{{ L.estimatedTimeLabel }}</div>
                <div class="item-value" :class="{'gray-scale': !patternData.estimatedTime}" v-html="patternData.estimatedTime ? patternData.estimatedTime : 'Required'"></div>
            </div>
            <div class="box-item">
                <div class="item-label">{{ L.languageLabel }}</div>
                <div class="item-value">{{ L.languageValue }}</div>
            </div>
            <div class="box-item" style="grid-column: span 2;">
                <div class="item-label">{{ L.finishedSizeLabel }}</div>
                <div class="item-value" :class="{'gray-scale': !patternData.finishedSize}" v-html="patternData.finishedSize ? patternData.finishedSize : 'Required'"></div>
            </div>
            <div class="box-item" style="grid-column: span 2;">
                <div class="item-label">{{ L.patternTypeLabel }}</div>
                <div class="item-value">{{ L.patternTypeValue }}</div>
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
            {{ L.abbreviationsTitle }}
        </div>
        <div>
            <h4>{{ L.standardAbbrev }}</h4>
            <table class="custom-table">
                <thead>
                    <tr>
                        <th>{{ L.abbreviationHeader }}</th>
                        <th>{{ L.fullTermHeader }}</th>
                        <th>{{ L.descriptionHeader }}</th>
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
            <!-- <h4>{{ L.specialTech }}</h4> -->
            <h4>{{ patternData.techniques.text }}</h4>
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
            {{ L.materialsTitle }}
        </div>
        <div v-if="patternData.yarn || patternData.brands">
            <h4>{{ L.yarnRequirements }}</h4>
            <div>
                <div><strong>{{ L.recommendedYarn }}</strong> <span v-html="patternData.yarn"></span></div>
                <div><strong>{{ L.suggestedBrands }}</strong> {{ patternData.brands }}</div>
            </div>
        </div>
        <div v-if="patternData.colors.list.length > 0">
            <h4>{{ L.colorPalette }}</h4>
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
            <h4>{{ L.toolsNotions }}</h4>
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
            <h4>{{ L.optionalSupplies }}</h4>
            <ul>
                <li v-for="(supply, index) in patternData.supplies.list" :key="index">
                    {{ supply }}
                </li>
            </ul>
        </div>
        <div v-if="patternData.materialsDesc">
            <div class="rich-text" v-html="patternData.materialsDesc"></div>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            {{ L.mainInstructionsTitle }}
        </div>
        <div v-for="(instructionGroup, groupIndex) in patternData.instructions" :key="groupIndex" class="instruction-group" style="margin-bottom: 40px;">
            <div style="font-size: 28px; font-weight: 700;" v-if="instructionGroup.title" class="group-title">{{ instructionGroup.title.toUpperCase() }}</div>
            <div v-if="instructionGroup.description" class="rich-text" v-html="instructionGroup.description"></div>
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
                    <div class="images-column" v-if="item.image && item.image.length > 0">
                        <div v-for="(url, imgIndex) in item.image" :key="imgIndex" style="position: relative;">
                            <img  :src="url" />
                        </div>
                    </div>
                </div> 
                <div class="bottom-images" v-if="item.imageBottom && item.imageBottom.length > 0">
                    <div v-for="(url, imgIndex) in item.imageBottom" :key="imgIndex" style="position: relative;" >
                        <img  :src="url" :style="item.bottomHeight != null ? { height: item.bottomHeight + 'px' } : {}" />
                    </div>
                </div> 
                <div v-if="item.end_description" class="end-description" v-html="item.end_description"></div>
            </div>
        </div>
    </div>


    <div class="section-block" v-if="patternData.finishingTips.list.length > 0">
        <div class="divider-title">
            {{ L.finishingTipsTitle }}
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
            {{ L.copyrightTitle }}
        </div>
        <div>
            <h4>{{ L.licenseTerms }}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <strong>{{ L.youMay }}</strong>
                    <ul style="font-size: 12px;">
                        <li v-for="(item, i) in L.youMayList" :key="i">{{ item }}</li>
                    </ul>
                </div>
                <div>
                    <strong>{{ L.youMayNot }}</strong>
                    <ul style="font-size: 12px;">
                        <li v-for="(item, i) in L.youMayNotList" :key="i">{{ item }}</li>
                    </ul>
                </div>
            </div>
        </div>
        <div>
            <h4>{{ L.copyrightNoticeHeader }}</h4>
            <div>{{ L.copyrightNoticeText }}</div>
        </div>
        <div>
            <h4>{{ L.supportContactHeader }}</h4>
            <div>{{ L.supportContactLine1 }}</div>
            <div>{{ L.supportContactLine2 }}</div>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            {{ L.bonusContentTitle }}
        </div>
        <div v-if="patternData.bonus_tips.list.length > 0">
            <h4>{{ L.proTips }}</h4>
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
            <h4>{{ L.variationIdeas }}</h4>
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
            <h4>{{ L.communityFeedback }}</h4>
            <div v-for="(item, index) in patternData.bonus_community.list" :key="index">
                 {{ item }}
            </div>
        </div>
    </div>


    <div class="section-block">
        <div class="divider-title">
            {{ L.thankYouTitle }}
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>{{ L.thankYouLine1 }} <strong>{{ patternData.title }}</strong>.</div>
            <strong>{{ L.happyCrocheting }}</strong>
            <div class="italic">{{ L.reviewHint }}</div>
        </div>
        
    </div>

     
</div>
</template>
<script setup lang="ts">
import { PatternInfo } from '~/types/PatternInfo'
import i18nSimple from '~/data/i18n.simple.json'

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
const L = computed(() => {
  const lang = String(props.patternData?.lang ?? 'en').trim().toLowerCase()
  return (i18nSimple as any)[lang] ?? (i18nSimple as any).en
})
</script>
<style scoped lang="scss">
@use '../common.scss';
</style>