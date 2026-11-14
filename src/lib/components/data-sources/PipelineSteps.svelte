<script lang="ts">
	import type { PipelineStep } from '#lib/types.ts';

	type Props = { steps: PipelineStep[] };

	let { steps }: Props = $props();
</script>

<!-- `steps` de daisyUI numera y une los pasos; en pantallas angostas pasa a vertical. -->
<ol class="steps steps-vertical lg:steps-horizontal">
	{#each steps as step (step.id)}
		<li class="step step-primary text-label">
			<div class="flex flex-col gap-1 text-start lg:text-center">
				<span class="text-title-xs">{step.title}</span>
				<span class="text-body text-base-content/70">{step.detail}</span>
			</div>
		</li>
	{/each}
</ol>
