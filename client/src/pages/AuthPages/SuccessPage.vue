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
            router.push("/register/success");
        }
    }
}
</script>