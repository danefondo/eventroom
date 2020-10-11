<template>
    <div v-if="verified" class="verificationPage">
        <p> Verified! </p> 
        <br/>
        <p> For security purposes, you'll need to sign in again.</p>
        <router-link to="/account/login"> Sign in </router-link>

    </div>
    <div v-else-if="verifying"> Verifying... </div>
    <div v-else> 
        You're screwed  
        {{error_message}}
    </div>
</template>

<script>
import axios from 'axios';
// import auth from '../../config/auth';

export default {
    name: "VerificationPage",

    data() {
        return {
            verified: false,
            verifying: false,
            error_message: "",
        }
    },

    mounted() {
        this.verify();
    },

    methods: {
        async verify() {
            this.verifying = true;
            try {
                const {data} = await axios.get(
                    `/api/accounts/verify/${this.$route.params.token}`
                );
                if (data.message === "verification.verified") {
                    this.verified = true;
                    this.$router.push('/');
                    // auth.logout();
                } else {
                    this.verified = false;
                    this.error_message = "Verification unsuccessful"
                }
            } catch (error) {
                console.log("rip");
                if (error.response.status === 500) {
                    this.error_message = "DB error occurred";
                } else if (error.response.status === 401) {
                    this.error_message = "Please ensure you have created an account";
                } else {
                    this.error_message = "internal server error";
                }
            } finally {
                this.verifying = false;
            }
        }
    }
}
</script>

<style scoped>
.verificationPage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>