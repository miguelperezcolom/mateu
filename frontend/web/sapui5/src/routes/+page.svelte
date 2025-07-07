<script lang="ts">
	import "@ui5/webcomponents/dist/Label";
	import "@ui5/webcomponents/dist/Button.js"; // ui5-button
	import "@ui5/webcomponents/dist/Input.js"; // ui5-input
	import "@ui5/webcomponents/dist/List.js"; // ui5-list
	import "@ui5/webcomponents/dist/ListItemStandard.js"; // ui5-li
	import "@ui5/webcomponents-fiori/dist/Wizard.js"; // ui5-wizard
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>

	<h2>Hola</h2>

	<div class="content">
		<ui5-button id="btn">This is a button</ui5-button>
		<p></p>
		<ui5-label for="myInputSimple" show-colon>Label</ui5-label>
		<ui5-input id="myInputSimple" value="This is an input" ui5-label="Hola"></ui5-input>
	</div>
	<script>
		btn.addEventListener("click", () => {
			console.log('hola')
		});
	</script>

</section>

<style>

	.content {
		display: flex;
		flex-direction: column;
		flex: 0.6;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

</style>
