<script lang="ts">
  import { toCanvas } from "qrcode";
  import FileInput from "./lib/FileInput.svelte";
  import { ReportProcessor } from "./lib/ReportProcessor";
  import { sep, storageGet, storageSet } from "./lib/utils";

  const onSubmit = async (ev: SubmitEvent) => {
    const data = new FormData(ev.target as HTMLFormElement);

    const templateFile = data.get("template") as File;
    const reportFiles = data.getAll("reports") as File[];

    const processor = new ReportProcessor(templateFile, reportFiles);

    try {
      await processor.process({
        preview: ev.submitter?.id === "preview",
        send: ev.submitter?.id === "send",
      });
    } catch (err) {
      errors = [err instanceof Error ? err : new Error(String(err))];
    }

    lastProcessor = processor;
  };

  const renderQrCode = async (canvas: HTMLCanvasElement) => {
    const text = [
      "BCD", // Service Tag
      "001", // Version
      "1", // Character set
      "SCT", // Identification
      BANK_INFO.bic, // BIC
      BANK_INFO.name, // Name
      BANK_INFO.iban, // IBAN
      `EUR${sep(lastProcessor.total || 0)}`, // Amount
      "", // Reason
      "", // Ref of invoice
      lastProcessor.reference, // Or text
    ].join("\n");
    await toCanvas(canvas, text, { width: 200 });
  };

  const validateNationalNumber = () => {
    const number = storageGet("national-number");
    if (number && !R_NATIONAL_NUMBER.test(number)) {
      alert("National number must be an 11-digit number");
    }
  };

  const BANK_INFO = {
    bic: "PCHQBEBB",
    iban: "BE39679200229319",
    name: "Centre de perception - section taxes diverses",
  };
  const R_NATIONAL_NUMBER = /^\d{11}$/;

  let errors: Error[] = [];
  let fullName = storageGet("full-name");
  let lastProcessor: ReportProcessor;
  let nationalNumber = storageGet("national-number");

  $: storageSet("full-name", fullName.trim());
  $: storageSet("national-number", nationalNumber.trim());
</script>

<main class="p-4 min-w-80 max-w-2xl w-svw">
  <h1 class="text-4xl font-bold">AutoTOB</h1>
  <details class="my-3">
    <summary class="flex cursor-pointer">
      <h3
        class="text-lg font-bold px-3 py-2 transition-colors w-full rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-pink-700"
      >
        How to use?
      </h3>
    </summary>
    <p class="mt-2">
      Get the <a
        href="https://finances.belgium.be/sites/default/files/TD-OB1-FR.pdf"
        class="font-bold text-pink-500 underline">TOB report document</a
      > and pre-fill any static information: first section with name, NN and address,
      and the final section's location and signature. From then you can use that
      file as the "template" (on the left), and simply feed 1 or 2 tax report(s)
      to the input on the right.
    </p>
    <p class="mt-2">
      You can then either <strong class="text-pink-500">Download</strong> the
      generated TOB report, or
      <strong class="text-pink-500">Download & send</strong> to also be redirected
      to a prepared email template in which you'll simply need to attach the document
      and press "send".
    </p>
  </details>
  <form
    action="/"
    class="flex flex-col items-center justify-center gap-4"
    on:submit|preventDefault={onSubmit}
  >
    {#if errors.length}
      <ul class="w-full p-4 text-red-500 bg-red-100 rounded-lg">
        {#each errors as error}
          <li>{error.message}</li>
        {/each}
      </ul>
    {/if}
    <div class="flex gap-4 w-full">
      <FileInput name="template">
        <h3 class="text-pink-500 font-bold">TOB template</h3>
      </FileInput>
      <FileInput name="reports" multiple={true}>
        <h3 class="text-pink-500 font-bold">Tax reports</h3>
      </FileInput>
    </div>
    <details class="flex flex-col w-full" open>
      <summary class="flex cursor-pointer">
        <h3
          class="text-lg font-bold px-3 py-2 transition-colors w-full rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-pink-700"
        >
          Personnal infos
        </h3>
      </summary>
      <label class="flex items-center gap-2 mt-2">
        Full name:
        <input
          type="text"
          class="font-bold px-2 py-1 flex-1"
          placeholder="Full name"
          bind:value={fullName}
        />
      </label>
      <label class="flex items-center gap-2">
        National registration number:
        <input
          type="text"
          class="font-bold px-2 py-1 flex-1"
          placeholder="National registration number"
          bind:value={nationalNumber}
          on:change={validateNationalNumber}
        />
      </label>
    </details>
    <div class="flex w-full gap-2">
      <button
        id="preview"
        class="px-4 py-2 rounded-lg text-lg font-bold text-white bg-pink-500 transition-all hover:bg-pink-600"
        >Preview</button
      >
      <button
        id="process"
        class="px-4 py-2 rounded-lg text-lg font-bold text-white bg-pink-500 transition-all hover:bg-pink-600"
        >Download</button
      >
      <button
        id="send"
        class="px-4 py-2 rounded-lg text-lg font-bold text-white bg-pink-500 transition-all hover:bg-pink-600"
        >Download & send</button
      >
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
              Total to pay: <strong>{sep(lastProcessor.total || 7.97)}€</strong>
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
          <canvas width="200" height="200" use:renderQrCode></canvas>
        {/key}
      </div>
    {/if}
  </form>
</main>
