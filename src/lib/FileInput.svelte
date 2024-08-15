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
  class="dropzone {dragging ? 'dragging' : ''}"
  on:click={() => input.click()}
  on:dragover|preventDefault
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:drop|preventDefault={onDrop}
>
  {#if dragging}
    <div class="drophandle">DROP YOUR FILES HERE</div>
  {/if}
  <slot />
  <input
    bind:this={input}
    {name}
    type="file"
    accept="application/pdf"
    required
    {multiple}
    on:change={onChange}
  />
  {#if names.length}
    <ul>
      {#each names as name}
        <li>{name}</li>
      {/each}
    </ul>
  {/if}
</button>

<style>
  button {
    height: 300px;
    flex: 1;
    position: relative;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    border: 0.25rem var(--primary) solid;
    color: var(--primary);
    transition: 0.15s;
  }

  button.dragging,
  button:hover {
    background-color: #ff008020;
  }

  input[type="file"] {
    width: 1px;
    height: 1px;
  }

  ul {
    pointer-events: none;
    color: black;
  }

  .drophandle {
    position: absolute;
    pointer-events: none;
    top: 0;
    font-size: 24pt;
    font-weight: bold;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
