<template>
    <div class="calendar-wrapper">
        <div class="calendar-header">
            <div class="calendar-title__text">{{ currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }) }}</div>
            <div class="join">
                <button class="join-item btn btn-sm" @click="changeMonth(-1)">Prev</button>
                <button class="join-item btn btn-sm" @click="currentDate = new Date()">Today</button>
                <button class="join-item btn btn-sm" @click="changeMonth(1)">Next</button>
            </div>
        </div>
        
        <div class="calendar-body">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="bg-gray-50 p-2 text-center font-semibold text-sm">
                {{ day }}
            </div>
            <div v-for="{ date, isCurrentMonth, isToday } in calendarDays" :key="date.toISOString()" 
                class="day-item" :class="{ 'not-current-month': !isCurrentMonth }">
                <div class="day-item__text" 
                    :class="{ 'bg-primary text-white': isToday }">
                    {{ date.getDate() }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.calendar-wrapper {

    .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
    }

    .calendar-title__text {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-neutral-700);
        padding: 0 5px;
    }

    .calendar-body {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 1px;
        background-color: var(--color-gray-200);
        border: 1px solid var(--color-gray-200);
        border-radius: 4px;
        overflow: hidden;

        .day-item {
            background-color: #ffffff;
            min-height: 100px;
            padding: 8px;

            &.not-current-month {
                background-color: var(--color-gray-50, #f9fafb);
                color: var(--color-gray-400, #9ca3af);
            }

            .day-item__text {
                // text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                font-size: 13px;
                font-weight: 600;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }
        }
    }

    
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentDate = ref(new Date())

const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    
    // Fill previous month
    for (let i = firstDay.getDay(); i > 0; i--) {
        days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false, isToday: false })
    }
    
    // Fill current month
    const today = new Date()
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        days.push({ date, isCurrentMonth: true, isToday: date.toDateString() === today.toDateString() })
    }
    
    // Fill next month
    while (days.length % 7 !== 0) {
        days.push({ date: new Date(year, month + 1, days.length - lastDay.getDate() - firstDay.getDay() + 1), isCurrentMonth: false, isToday: false })
    }
    
    return days
})

const changeMonth = (delta: number) => {
    currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + delta))
}
</script>