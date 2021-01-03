<template>
  <div class="toggle">
    <div class="toggle-background" :class="boolean ? 'blue' : 'grey'">
      <div
        class="toggle-circle"
        :class="boolean ? 'enabled' : 'disabled'"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Toggle",
  props: ["boolean"],
};
</script>

<style scoped>
.toggle {
  background-color: #d7dce0;
  border-radius: 360px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 45px;
  padding: 3px;
  cursor: pointer;
}

.toggle:hover .toggle-circle {
  background-color: #f8fafb;
}

.toggle:hover .blue {
  background-color: #4d01e2;
}

.toggle-background {
  height: 32px;
  margin: 0;
  padding: 0px 2px;
  border-radius: 360px;
  width: 65px;
  /* background-color: #5600ff; */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease-in-out;
}

.toggle-circle {
  background-color: #e9eced;
  height: 28px;
  width: 28px;
  box-sizing: border-box;
  margin: 0;
  padding: 0px;
  border-radius: 360px;
  transition: 0.2s ease-in-out;
}

.blue {
  background-color: #5600ff;
}

.enabled {
  margin-left: auto;
}

.disabled {
  margin-right: auto;
}
</style>