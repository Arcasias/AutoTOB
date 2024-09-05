<script lang="ts">
  import { fade } from "svelte/transition";

  export let color: "purple" | "orange";
  export let maxFiles: number = 1;
  export let name: string;

  const onChange = () => {
    names = [...(input.files || [])].map((file) => file.name);
  };

  const onDragEnter = () => {
    dragging = true;
  };

  const onDragLeave = () => {
    dragging = false;
  };

  const onDrop = (ev: DragEvent) => {
    dragging = false;

    if (!ev.dataTransfer?.files) {
      return;
    }

    input.files = ev.dataTransfer.files;
    onChange();
  };

  const cls = {
    orange: {
      text: "text-orange-500",
      border: "border-orange-500",
      bg: "hover:bg-orange-50 dark:hover:bg-orange-950",
    },
    purple: {
      text: "text-purple-500",
      border: "border-purple-500",
      bg: "hover:bg-purple-100 dark:hover:bg-purple-950",
    },
  };

  let dragging = false;
  let input: HTMLInputElement;
  let names: string[] = [];
</script>

<button
  type="button"
  id="template-dropzone"
  class="aspect-square rounded-lg border-4 {cls[color]
    .border} transition-colors flex-1 {dragging ? '' : cls[color].bg}"
  on:click={() => input.click()}
  on:dragover|preventDefault
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:drop|preventDefault={onDrop}
>
  <div
    class="flex flex-col items-center justify-center relative w-full h-full pointer-events-none p-3"
  >
    {#if dragging}
      <div
        class="absolute flex items-center justify-center bg-opacity-90 top-0 left-0 w-full h-full bg-white dark:bg-black"
        in:fade={{ duration: 150 }}
      >
        <strong class="text-2xl {cls[color].text}"
          >DROP FILE{maxFiles > 1 ? "S" : ""}</strong
        >
      </div>
    {/if}
    <slot />
    <input
      bind:this={input}
      {name}
      type="file"
      class="w-px h-px"
      accept="application/pdf"
      required
      multiple={maxFiles > 1}
      on:change={onChange}
    />
    {#if names.length}
      <ul class="text-black">
        {#each names as name, i}
          <li class="font-bold text-slate-700 dark:text-slate-300">
            {name}
            {i < maxFiles ? "✅" : "❌"}
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-400 italic">
        Upload or drop file{maxFiles > 1 ? "s" : ""}
      </p>
    {/if}
  </div>
</button>
