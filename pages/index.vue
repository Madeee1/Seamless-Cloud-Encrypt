<template>
    <div class="flex flex-col w-[300px] place-content-center mx-auto">
        <h1 class="text-3xl mx-auto">{{ count }}</h1>
        <button class="border-2 border-black" @click="increment">Increment</button>
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
        }
    };
</script>
