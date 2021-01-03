<template>
  <div class="coming-soon">
    <div>Coming soon!</div>
  </div>
</template>

<style scoped>
.coming-soon {
  position: absolute;
  background-color: #f1f4f770;
  left: 0px;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  cursor: no-drop;
}

.coming-soon div {
  background-color: #101010;
  width: 165px;
  color: #f1f4f7;
  font-size: 20px;
  padding: 5px 10px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 360px;
  margin-left: auto;
  font-weight: bold;
  margin-right: auto;
}
</style>