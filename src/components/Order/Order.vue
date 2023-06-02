<template>
  <div class="order container-fluid">
    <div class="order__wrapper row align-items-center justify-content-center">
      <div class="col-auto text-dark">
        <Logo />
      </div>
    </div>
  </div>
</template>

<script>

import Logo from "../Logo/Logo.vue";

export default {
  name: 'Order',
  components: {Logo},
}
</script>

<style lang="scss">
  $content-height: calc(100vh - 64px);
  .order{
    min-height: $content-height;
    background-image: url('/src/assets/background.png');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;

    &__wrapper {
      min-height: $content-height;
      background-color: #FFFFFFB8;
    }
  }
</style>
