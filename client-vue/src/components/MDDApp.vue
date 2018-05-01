<template>
<div class="mddapp">
  <Cabecera :app="app"></Cabecera>
  <Menu :app="app"></Menu>
  <Contenido></Contenido>
</div>
</template>

<script>

  import axios from 'axios';

  import Cabecera from "./Cabecera.vue";
    import Menu from "./Menu.vue";
    import Contenido from "./Contenido.vue"

  var baseurl = 'http://localhost:9998'

    export default {
        name: "MDDApp",
      components: {Cabecera, Menu, Contenido},
      data () {
          console.log('data');
        return {
          app: {
            appname: "Hola!"
          }
        }
      },
      mounted: function() {
          console.log('mounted');
        this.$data.app.caption = "Hola!!!";

        axios.get(baseurl + '/mdd/menu')
          .then(response => {
            // JSON responses are automatically parsed.
            this.$data.app = response.data
            console.log(response.data)
          })
          .catch(e => {
            console.log(e)
          })
      },
    }
</script>

<style scoped>

</style>
