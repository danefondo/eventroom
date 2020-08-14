<template>
    <div>
        <p> Success </p>
        <br/>
        <p> Please verify your account </p>
    </div>
</template>

<script>
import router from '../../router';

export default {
    name: 'SuccessPage',

    mounted() {
        this.atMounted();
    },

    methods: {
        atMounted() {
            console.log("@ mounted")
            router.push("/register/success");
        }
    }
}
</script>