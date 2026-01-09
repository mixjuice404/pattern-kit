<template>
  <div class="preprocess-container">
    <div class="preprocess-input">textarea</div>
    <div class="preprocess-data">data</div>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  title: '预处理',
})
</script>

<style scoped lang="scss">

    .preprocess-container {
        height: 100%;
        display: grid;
        grid-template-columns: 55vw auto;
        background-color: #dfe6e9;

        .preprocess-input {
            height: 100%;
            padding: 10px;
            border: none;
            outline: none;
            background-color: var(--color-neutral-100);
        }

        .preprocess-data {
            height: 100%;
            padding: 10px;
            border: none;
            outline: none;
            background-color: var(--color-white);
        }

    }

</style>
