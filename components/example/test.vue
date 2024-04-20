<template>
    <div class="flex flex-col border-black border-2">
        <h1>this is from a different cmponent</h1>
        <div>{{ count }}</div>
        <button @click="increment" class="border-4">click to increase</button>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                count: this.initialCount
            }
        },
        props: {
            initialCount: {
                type: Number,
                default: 0
            }
        },
        methods: {
            increment() {
                this.count++
            }
        }
    }
</script>