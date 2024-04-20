<template>
    <div class="flex flex-col w-[300px] place-content-center mx-auto">
        <h1 class="text-3xl mx-auto">{{ count }}</h1>
        <button class="border-2 border-black" @click="increment">Increment</button>
        <ExampleTest class="my-4" :initial-count="5"></ExampleTest>
        <ExampleTest></ExampleTest>
    </div>
</template>

<script lang="ts">
    export default {
        data() {
            return {
                count: 0
            }
        },
        methods: {
            increment() {
                this.count++
            }
        },
    };
</script>
