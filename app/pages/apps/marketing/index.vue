<template>
  <div class="default-container">
    <PageHeader
      title="Marketing Tools"
      :breadcrumbs="breadcrumbs">
    </PageHeader>

    <div>

       <div class="grid grid-cols-3 2xl:grid-cols-4 gap-4">
        <!-- Marketing Calendar -->
         <div class="app-card" @click="$router.push('/apps/marketing/calendar')">
           <div class="card-title">
              <div class="card-title__icon">
                <Icon name="hugeicons:calendar-02"></Icon>
              </div>
              <div class="card-title__text">Marketing Calendar</div>
             </div>
           <div class="card-content">
             <div class="card-content__text">Plan and schedule your social media posts, email campaigns, and product launches.</div>
           </div>
         </div>

         <!-- Profit Calculator -->
         <div class="app-card" @click="$router.push('/apps/marketing/calculator')">
           <div class="card-title">
              <div class="card-title__icon">
                <Icon name="hugeicons:calculator"></Icon>
              </div>
              <div class="card-title__text">Pricing & Margin Simulator</div>
             </div>
           <div class="card-content">
             <div class="card-content__text">    Unit Economics Model. Calculate your profit margin, revenue, and cost of goods sold.</div>
           </div>
         </div>

       </div>

    </div>
  </div>
</template>

<style scoped lang="scss">

.app-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px 0 oklch(92.8% 0.006 264.531 / 0.2);
  cursor: pointer;
  padding: 12px;
  transition: all 0.2s ease-in-out;

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  .card-title {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;

    .card-title__icon {
      display: flex;
      align-items: center;
      font-size: 24px;
      color: var(--color-red-500);
    }

    .card-title__text {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-neutral-700);
    }
  }

  .card-content {
    flex-grow: 1;

    .card-content__text {
      display: block;
      font-size: 12px;
      color: var(--color-neutral-500);
    }
  }

  .card-footer {
    margin-top: 15px;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
  }
}

</style>

<script setup lang="ts">

const breadcrumbs = [
  { label: 'Home', to: '/', icon: 'solar:home-2-outline' },
  { label: 'Apps', icon: 'hugeicons:ai-brain-03' },
  { label: 'Marketing', to: '/apps/marketing', icon: 'hugeicons:command-line' }
]

</script>
