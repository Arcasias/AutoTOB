<script lang="ts">
  import type { EventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import FileInput from "./FileInput.svelte";
  import { ReportProcessor } from "./ReportProcessor";
  import {
    BANK_INFO,
    renderQrCode,
    sep,
    storageGet,
    storageSet,
    validateNationalNumber,
  } from "./utils";

  const onSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (ev) => {
    const data = new FormData(ev.currentTarget);

    const templateFile = data.get("template") as File;
    const reportFiles = data.getAll("reports") as File[];

    const processor = new ReportProcessor(templateFile, reportFiles);

    try {
      await processor.process({
        preview: ev.submitter?.id === "preview",
        send: ev.submitter?.id === "send",
      });
      errors = [];
      lastProcessor = processor;
    } catch (err) {
      errors = [err instanceof Error ? err : new Error(String(err))];
    }
  };

  const renderQrCodeToCanvas = (canvas: HTMLCanvasElement) => {
    renderQrCode(canvas, lastProcessor.total, lastProcessor.reference);
  };

  const onNationalNumberChange = () => {
    errors = [];
    const error = validateNationalNumber();
    if (error) {
      errors.push(error);
    }
  };

  let errors: Error[] = [];
  let lastProcessor: ReportProcessor;

  // Storage values
  let fullName = storageGet("full-name");
  let nationalNumber = storageGet("national-number");

  $: storageSet("full-name", fullName.trim());
  $: storageSet("national-number", nationalNumber.trim());
</script>

<main class="flex flex-col gap-5 min-w-72 max-w-2xl w-full px-3">
  {#if errors.length}
    <ul
      class="w-full font-bold p-4 rounded-lg text-red-500 bg-red-100 dark:bg-red-950"
      transition:slide={{ duration: 150 }}
    >
      {#each errors as error (error)}
        <li>{error.message}</li>
      {/each}
    </ul>
  {/if}
  <details
    class="flex flex-col w-full"
    open={!storageGet("full-name") && !storageGet("national-number")}
  >
    <summary class="flex cursor-pointer">
      <h3
        class="text-lg font-bold px-3 py-2 w-full rounded-t-lg border-b-2 border-pink-500 hover:bg-slate-100 hover:text-pink-500 dark:hover:bg-slate-900"
      >
        Personnal information
      </h3>
    </summary>
    <label class="flex flex-col w-full gap-2 mt-3 sm:flex-row sm:items-center">
      <span>Full name:</span>
      <input
        type="text"
        class="font-bold px-2 py-1 flex-1 bg-slate-100 dark:bg-slate-800"
        placeholder="Full name"
        bind:value={fullName}
      />
    </label>
    <label class="flex flex-col w-full gap-2 mt-2 sm:flex-row :items-center">
      <span>National registration number:</span>
      <input
        type="text"
        class="font-bold px-2 py-1 flex-1 bg-slate-100 dark:bg-slate-800"
        placeholder="National registration number"
        bind:value={nationalNumber}
        on:change={onNationalNumberChange}
      />
    </label>
  </details>
  <form
    action="/"
    class="flex flex-col items-center justify-center gap-4"
    on:submit|preventDefault={onSubmit}
  >
    <div class="flex gap-3 w-full sm:gap-5">
      <FileInput color="orange" name="template" maxFiles={1}>
        <h3 class="text-orange-500 font-bold text-xl">TOB template</h3>
      </FileInput>
      <FileInput color="purple" name="reports" maxFiles={2}>
        <h3 class="text-purple-500 font-bold text-xl">Tax reports</h3>
      </FileInput>
    </div>
    <div class="flex w-full gap-2">
      <button
        id="preview"
        class="flex-1 px-4 py-2 rounded-lg text-lg text-white border-pink-500 border-4 bg-pink-100 dark:bg-pink-950 sm:bg-pink-500 dark:sm:bg-pink-500 transition-all hover:bg-pink-600"
      >
        <strong class="hidden sm:block">Preview</strong>
        <span class="sm:hidden">👁️</span>
      </button>
      <button
        id="process"
        class="flex-1 px-4 py-2 rounded-lg text-lg text-white border-pink-500 border-4 bg-pink-100 dark:bg-pink-950 sm:bg-pink-500 dark:sm:bg-pink-500 transition-all hover:bg-pink-600"
      >
        <strong class="hidden sm:block">Download</strong>
        <span class="sm:hidden">⬇️</span>
      </button>
      <button
        id="send"
        class="flex-1 px-4 py-2 rounded-lg text-lg text-white border-pink-500 border-4 bg-pink-100 dark:bg-pink-950 sm:bg-pink-500 dark:sm:bg-pink-500 transition-all hover:bg-pink-600"
      >
        <strong class="hidden sm:block">Download & Send</strong>
        <span class="sm:hidden">⬇️ 📩</span>
      </button>
    </div>
    {#if lastProcessor}
      <div
        class="flex flex-col justify-between rounded-lg px-3 py-2 w-full border-2 border-pink-500 sm:flex-row"
      >
        <div class="flex flex-col justify-around">
          <h3 class="text-2xl font-bold mb-2">
            {lastProcessor.fileName} is ready
          </h3>
          <div>
            <p>
              Total to pay: <strong>{sep(lastProcessor.total)}€</strong>
            </p>
            <p>
              Holder: <strong>{BANK_INFO.name}</strong>
            </p>
            <p>IBAN: <strong>{BANK_INFO.iban}</strong></p>
            <p>BIC: <strong>{BANK_INFO.bic}</strong></p>
            <p>
              Reference: <strong>{lastProcessor.reference}</strong>
            </p>
          </div>
        </div>
        {#key lastProcessor}
          <canvas
            class="self-center"
            width="200"
            height="200"
            use:renderQrCodeToCanvas
          ></canvas>
        {/key}
      </div>
    {/if}
  </form>
</main>
