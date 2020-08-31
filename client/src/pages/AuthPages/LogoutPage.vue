<template>
    <div>
        <p> SHAME ON YOU! you should never log out </p>
        <br/>
        <p> Please wait while we redirect you to our endless feed of new events</p>
    </div>
</template>

<script>
import auth from '../../config/auth';

export default {
    name: "LogoutPage",
    async beforeRouteEnter (to, from, next) {
      try {
        const response = await auth.logout();
        console.log("@logout_beforeenter: ", response.data);
        if (response.data.success) {
          next();
        }
      } catch (err) {
        console.log(err);
      }
    },
}
</script>