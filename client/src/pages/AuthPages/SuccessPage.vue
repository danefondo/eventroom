<template>
    <div>
        <p> Success </p>
        <br/>
        <p> Please verify your account </p>
        <p> Did not get an email? Well, too bad </p>
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
            console.log("here1");
            router.push("/register/success");
            console.log("here2");
        }
    }
}
</script>