<template>
  <div class="hello">
    {{msg}}
    <component-a/>
    <component-b/>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>