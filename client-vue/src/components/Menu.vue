<template>
<div class="menu">
  <div class="menu"><h2>Menú</h2>
  <ul>
    <li v-for="area in app.areas">
      {{ area.name }}
      <ul>
        <li v-for="modulo in area.modules">
          {{modulo.name}}
          <ul>
            <li v-for="action in modulo.actions">
              <a :href="'#/' + action.coordinates">{{action.name}}</a>
            </li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
  </div>
</div>
</template>

<script>
    export default {
        name: "Menu",
      data: function() {
        return {}
      },
    props: ['app']
    }
</script>

<style scoped>

</style>
