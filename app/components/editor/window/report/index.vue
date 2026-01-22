<template>
  <div
    ref="floatingEl"
    class="floating-window"
    :style="{
      position: 'fixed',
      right: `${ANCHOR}px`,
      bottom: `${ANCHOR}px`,
      transform: `translate3d(${dx}px, ${dy}px, 0)`,
      userSelect: dragging ? 'none' : 'auto',
    }"
  >
    <div>
      <div>
        <div
          class="window-title"
          :class="{ collapsed: !windowBodyOpen }"
          @click="toggleWindowBody"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <div>🛠 校验与修正报告</div>
          <div class="window-badge">{{ items.length }}</div>
        </div>
        <div v-show="windowBodyOpen" class="window-body" style="max-height: 25vw; overflow-y: auto;">
          <div v-if="!items.length" class="body-empty">No report items</div>
          <div v-else class="body-item" v-for="item in items" :key="item.key">
            <div class="item-title">
              <div class="item-location">
                <icon name="solar:pin-circle-bold" size="18" />
                <div>{{ item.location }}</div>
              </div>
              <div class="badge badge-sm" :class="item.badgeClass">{{ item.badgeText }}</div>
            </div>
            <div class="item-content">
              <div class="item-original">{{ item.original }}</div>
              <div class="item-suggestion">{{ item.suggestion }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type ReportViewItem = {
  key: string
  location: string
  badgeText: string
  badgeClass: string
  original: string
  suggestion: string
}

type Props = {
  items?: ReportViewItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
})

const items = computed(() => props.items)

const ANCHOR = 20

const floatingEl = ref<HTMLElement | null>(null)
const dx = ref(0)
const dy = ref(0)
const dragging = ref(false)
const windowBodyOpen = ref(false)

let justDragged = false
const toggleWindowBody = () => {
  if (justDragged) return
  windowBodyOpen.value = !windowBodyOpen.value
}

const size = ref({ w: 0, h: 0 })
const updateSize = () => {
  const el = floatingEl.value
  if (!el) return
  size.value = { w: el.offsetWidth, h: el.offsetHeight }
}

const clamp = () => {
  const w = size.value.w
  const h = size.value.h
  const vw = window.innerWidth
  const vh = window.innerHeight

  const minX = w + ANCHOR - vw
  const maxX = ANCHOR
  const minY = h + ANCHOR - vh
  const maxY = ANCHOR

  dx.value = Math.min(Math.max(dx.value, Math.min(minX, maxX)), Math.max(minX, maxX))
  dy.value = Math.min(Math.max(dy.value, Math.min(minY, maxY)), Math.max(minY, maxY))
}

let start = { x: 0, y: 0, dx: 0, dy: 0 }
let activePointerId: number | null = null
let moved = false

const onPointerDown = (e: PointerEvent) => {
  if (activePointerId != null) return
  activePointerId = e.pointerId
  moved = false
  start = { x: e.clientX, y: e.clientY, dx: dx.value, dy: dy.value }
  ;(e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (activePointerId !== e.pointerId) return

  const nextDx = start.dx + (e.clientX - start.x)
  const nextDy = start.dy + (e.clientY - start.y)

  if (!moved && Math.abs(nextDx - start.dx) + Math.abs(nextDy - start.dy) < 3) return

  moved = true
  dragging.value = true
  dx.value = nextDx
  dy.value = nextDy
  clamp()
  e.preventDefault()
}

const onPointerUp = (e: PointerEvent) => {
  if (activePointerId !== e.pointerId) return

  if (moved) {
    justDragged = true
    setTimeout(() => {
      justDragged = false
    }, 0)
  }

  dragging.value = false
  activePointerId = null
}

let ro: ResizeObserver | null = null
const onViewportResize = () => {
  updateSize()
  clamp()
}

onMounted(() => {
  updateSize()
  clamp()

  const el = floatingEl.value
  if (el) {
    ro = new ResizeObserver(() => {
      updateSize()
      clamp()
    })
    ro.observe(el)
  }

  window.addEventListener('resize', onViewportResize)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  window.removeEventListener('resize', onViewportResize)
})
</script>

<style scoped lang="scss">
.floating-window {
  z-index: 1000;
  background-color: #ffffff;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  touch-action: none;

  .window-badge {
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    background-color: var(--color-success);
    padding: 4px 6px;
    line-height: 1;
    border-radius: 4px;
    font-weight: 400;
  }

  .window-title {
    display: flex;
    align-items: center;
    background-color: var(--color-primary);
    border-radius: 6px 6px 0 0;
    color: #ffffff;
    justify-content: space-between;
    padding: 10px 15px;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &.collapsed {
      border-radius: 6px;
    }

    &:active {
      opacity: 0.9;
    }
  }

  .window-body {
    max-height: 35vw;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 10px 0;

    &::-webkit-scrollbar {
      display: none;
    }

    .body-item {
      font-size: 12px;
      min-width: 320px;
      max-width: 480px;
      padding: 10px 15px;
      font-weight: 400;
      &:hover {
        background-color: var(--color-neutral-100);
      }

      .item-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        justify-content: space-between;
        margin-bottom: 10px;

        .item-location {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }

      .item-content {
        border: 1px dashed var(--color-neutral-300);
        padding: 5px 10px;
        border-radius: 4px;
      }

      .item-original {
        padding: 5px 0;
        font-weight: 600;
        font-style: italic;
      }
    }
  }
}
</style>