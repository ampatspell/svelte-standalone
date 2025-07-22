<script lang="ts">
	import { thingie } from "$lib/index.js";

  let el = $state<HTMLDivElement>();
  $effect(() => {
    if(el) {
      return thingie(el, { name: 'thingie' });
    }
  });
</script>

<div class="index">
  <div class="content" bind:this={el}></div>
</div>
