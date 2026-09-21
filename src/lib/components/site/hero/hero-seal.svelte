<script lang="ts">
	export let src: string;
</script>

<div class="seal">
	<img class="hero-icon" {src} alt="" width="128" height="128" />
</div>

<style>
	.seal {
		width: 100%;
		height: 100%;
		padding: 10%;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 2px 8px #0003;
	}
	.hero-icon {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		filter: brightness(0);
		/* Optical alignment for the stamp's heavier upper-left lettering. */
		transform: translate(1.5%, 2.5%);
	}
</style>
