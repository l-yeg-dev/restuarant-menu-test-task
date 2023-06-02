<template>
  <Header />
  <Order />
</template>

<script>
import Order from "./components/Order/Order.vue";
import Header from "./components/Header/Header.vue";

export default {
  name: 'App',
  components: {
    Header,
    Order,
  }
}
</script>
