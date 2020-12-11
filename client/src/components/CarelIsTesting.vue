<template>
  <div>
    This is testing stuff, 14 Dec 2020 00:12:00 GMT
    <div>
      <input v-model="user1_ID">
      <p> user1_ID: {{user1_ID}} </p>
      <input v-model="user2_ID">
      <p> user2_ID: {{user2_ID}} </p>
      <input v-model="datestring">
      <p> datestring: {{datestring}} </p>
      <p> datetime: {{datetime}} </p>
      <p> datetime in ms: {{datetimems}} </p>
    </div>
    <div>  
      <button @click="parsedates"> parse dates </button>
    </div>
    <div>  
      <button @click="bookslots"> bookslots </button>
    </div>
    <div>  
      <button @click="cancelbookings"> cancelbookings </button>
    </div>
    <div>  
      <button @click="requestmatches"> requestmatches </button>
    </div>
    <div>  
      <button @click="cancelmatches"> cancelmatches </button>
    </div>
    <div>  
      <button @click="printredis"> printredis </button>
    </div>
    <div>  
      <button @click="deleteredis"> deleteredis </button>
    </div>
  </div>
</template>
<script>
import {
  initializeSocket,
  bookslots,
  cancelbookings,
  requestmatches,
  cancelmatches,
  printredis,
  deleteredis
} from "./CarelIsTestingdata";


export default {
  name:"CarelIsTesting",
  data() {
    return {
      user1_ID: "1",
      user2_ID: "2",
      datestring: "14 Dec 2020 00:12:00 GMT",
      datetimems: 1,
      datetime: new Date(0)
    }
  },
  computed: {
    data: function() {
      return {
        ID: this.user1_ID,
        cancelledIDs: [this.user2_ID],
        matchIDs: [this.user2_ID],
        datetimes: [this.datetimems]
      }
    }
  },
  created() {
    console.log("initializeing socket");
    initializeSocket();
  },
  methods: {
    parsedates () {
      this.datetimems = Date.parse(this.datestring);
      this.datetime = new Date(this.datetimems);
    },
    bookslots () {
      console.log("clicked bookslots");
      console.log("this.data: ", this.data);
      bookslots(this.data);
    },
    cancelbookings () {
      cancelbookings(this.data);
    },
    requestmatches () {
      requestmatches(this.data);
    },
    cancelmatches () {
      cancelmatches(this.data);
    },
    printredis() {
      printredis();
    },
    deleteredis() {
      deleteredis();
    }
  }
}
</script>