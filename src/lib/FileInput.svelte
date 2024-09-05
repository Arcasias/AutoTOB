<script lang="ts">
  export let name: string;
  export let multiple: boolean = false;

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

  let dragging = false;
  let input: HTMLInputElement;
  let names: string[] = [];
</script>

<button
  type="button"
  id="template-dropzone"
  class="h-72 flex flex-col items-center justify-center rounded-lg border-4 border-pink-500 transition-colors flex-1 relative p-8 {dragging
    ? 'bg-slate-100'
    : 'hover:bg-slate-100'}"
  on:click={() => input.click()}
  on:dragover|preventDefault
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:drop|preventDefault={onDrop}
>
  {#if dragging}
    <div
      class="absolute pointer-events-none flex items-center justify-center bg-opacity-80 top-0 left-0 w-full h-full bg-white"
    >
      <strong class="text-xl">DROP YOUR FILES HERE</strong>
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
    {multiple}
    on:change={onChange}
  />
  {#if names.length}
    <ul class="pointer-events-none text-black">
      {#each names as name}
        <li>{name}</li>
      {/each}
    </ul>
  {:else}
    <p class="text-gray-400 italic">Upload or drop files</p>
  {/if}
</button>
