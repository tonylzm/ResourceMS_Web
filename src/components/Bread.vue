<template>
  <a-breadcrumb style="margin: 16px 0">
    <a-breadcrumb-item>
      <a-icon type="home"/>
      <a href style="padding-left: 5px">Home</a>
    </a-breadcrumb-item>
    <a-breadcrumb-item v-if="$route.meta.module">{{ $route.meta.module }}</a-breadcrumb-item>
    <a-breadcrumb-item>{{ $route.meta.title }}</a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script>
export default {
  name: "Bread"
}
</script>

<style scoped>

</style>
