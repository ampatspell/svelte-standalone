<script lang="ts">
	let { name }: { name: string } = $props();
</script>

<div class="thingie">
	hello "{name}"
</div>

<style lang="scss">
	.thingie {
		width: min-content;
		white-space: nowrap;
		padding: 10px;
		border: 1px solid red;
	}
</style>
