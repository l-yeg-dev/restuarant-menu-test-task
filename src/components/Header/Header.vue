<template>
  <div class="container-fluid">
    <div class="row bg-dark text-white justify-content-center py-3">
      <div class="col-auto text-white">
        <Logo />
      </div>
    </div>
  </div>
</template>

<script>

import Logo from "../Logo/Logo.vue";

export default {
  name: 'Header',
  components: {Logo},
}
</script>
