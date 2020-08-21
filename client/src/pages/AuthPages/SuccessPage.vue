<template>
    <!-- This page has several possible views.

    First, at mount the page confirms asynchronously authentication status. So the first view is not-yet-authenticated view.

    If authenticated, the page view depends on whether authentication happened locally or through FB/some other 3rd party provider -->

    <div v-if="!authenticationSuccess">
        <p> Your registration was successful </p>
        <p> Please wait while we're authenticating your account </p>
        <br/>
        <p> Did not get an email? Well, too bad </p>
        
    </div>
    <div v-else> 
        <div v-if="registrationMethodIsFB"/>
        
        <!-- If registration method was local or undefined for some reason, render this  -->
        <div v-else>
            <p> Go to home page? </p>
            <br/>
            <p> Did not get an email? Well, too bad </p>
        </div>
    </div>
</template>

<script>
import auth from '../../config/auth';


export default {
    name: 'SuccessPage',


    props: {
        registrationMethod: String,
    },

    data() {
        return {
            authenticationSuccess: false,
        }
    },

    async mounted() {
        this.$router.push("/register/success");
        try {
            const authResponse = await auth.isAuthenticated();
            if (authResponse.success) {
                this.authenticationSuccess = true;
            } 
        } catch (err) {
            console.log(err);
        }
    },

    methods: {
        registrationMethodIsLocal() {
            return this.registrationMethod == "" || this.registrationMethod == "local";
        },
        registrationMethodIsFB() {
            return this.registrationMethod =="facebook";
        }
    },

}
</script>