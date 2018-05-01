<template>
  <div class="cabecera"><h1>{{app.appname}}</h1></div>
</template>

<script>
    export default {
        name: "Cabecera",
      data: function() {
        return {}
      },
      props: ['app']
    }
</script>

<style scoped>

</style>
