<script lang="ts">
  import { toCanvas } from "qrcode";
  import type { EventHandler, MouseEventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import colors from "tailwindcss/colors";
  import FileInput from "./lib/FileInput.svelte";
  import { ReportProcessor } from "./lib/ReportProcessor";
  import { sep, storageGet, storageSet } from "./lib/utils";

  type Theme = "dark" | "light";

  const getDefaultTheme = () =>
    matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const onDialogClick: MouseEventHandler<HTMLDialogElement> = (ev) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    if (
      ev.clientX < rect.x ||
      ev.clientX > rect.x + rect.width ||
      ev.clientY < rect.y ||
      ev.clientY > rect.y + rect.height
    ) {
      ev.currentTarget.close();
    }
  };

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

  const renderQrCode = (canvas: HTMLCanvasElement) => {
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

    const qrColors = [colors.slate[950], colors.slate[50]];
    if (theme === "dark") {
      qrColors.reverse();
    }
    toCanvas(canvas, text, {
      width: 200,
      color: { dark: qrColors[0], light: qrColors[1] },
    });
  };

  const validateNationalNumber = () => {
    const number = storageGet("national-number");
    if (number && !R_NATIONAL_NUMBER.test(number)) {
      errors = [new Error("National number must be an 11-digit number")];
    } else {
      errors = [];
    }
  };

  const BANK_INFO = {
    bic: "PCHQBEBB",
    iban: "BE39679200229319",
    name: "Centre de perception - section taxes diverses",
  };
  const R_NATIONAL_NUMBER = /^\d{11}$/;

  let errors: Error[] = [];
  let lastProcessor: ReportProcessor;

  // Storage values
  let fullName = storageGet("full-name");
  let theme = storageGet<Theme>("theme", getDefaultTheme());
  let nationalNumber = storageGet("national-number");

  // Dialogs
  let howToUseDialog: HTMLDialogElement;

  $: storageSet("full-name", fullName.trim());
  $: storageSet("national-number", nationalNumber.trim());
  $: storageSet("theme", theme);

  $: document.body.classList.toggle("dark", theme === "dark");
</script>

<div
  class="flex flex-col items-center w-screen h-screen overflow-auto transition-colors text-slate-900 bg-slate-50 dark:text-slate-100 dark:bg-slate-950"
>
  <header
    class="flex items-center min-w-72 max-w-2xl w-full p-4 top-0 transition-colors bg-slate-50 dark:bg-slate-950 sm:sticky"
  >
    <h1 class="flex gap-3 items-end mb-3">
      <strong class="text-4xl">AutoTOB</strong>
      <em class="hidden text-2xl text-slate-400 sm:flex">for Trade Republic</em>
    </h1>
    <div class="ms-auto flex gap-2">
      <button
        class="w-10 h-10 rounded-full select-none transition-colors shadow-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        title="How to use?"
        on:click={() => howToUseDialog.showModal()}
      >
        <strong>?</strong>
      </button>
      <button
        class="w-10 h-10 rounded-full select-none transition-colors shadow-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        title="Toggle theme"
        on:click={() => (theme = theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>
    </div>
  </header>
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
      <label
        class="flex flex-col w-full gap-2 mt-3 sm:flex-row sm:items-center"
      >
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
          on:change={validateNationalNumber}
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
              use:renderQrCode
            ></canvas>
          {/key}
        </div>
      {/if}
    </form>
  </main>
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
  <dialog
    class="p-5 w-screen h-min shadow-lg md:w-1/2 backdrop:bg-opacity-70 backdrop:bg-slate-50 text-slate-900 bg-slate-50 dark:text-slate-100 dark:bg-slate-950 dark:backdrop:bg-opacity-70 dark:backdrop:bg-slate-950"
    bind:this={howToUseDialog}
    on:click={onDialogClick}
  >
    <header
      class="flex items-center pb-2 w-full rounded-t-lg border-b-2 border-pink-500"
    >
      <h3 class="text-lg font-bold">How to use?</h3>
      <button
        class="ms-auto w-8 h-8 rounded-full select-none transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        title="Close"
        on:click={() => howToUseDialog.close()}
      >
        <strong>×</strong>
      </button>
    </header>
    <article class="flex flex-col gap-3 overflow-auto mt-3">
      <section>
        <h4 class="font-bold">Step 1</h4>
        <p>
          Get the <a
            href="https://finances.belgium.be/sites/default/files/TD-OB1-FR.pdf"
            target="_blank"
            class="font-bold text-orange-500 underline">TOB report document</a
          >
          and pre-fill any static information: first section with name, national
          registration number and address, and the final section's location and signature
          (there are multiple ways to fill in a PDF file, I personnaly use Firefox's
          <a
            href="https://github.com/mozilla/pdf.js"
            target="_blank"
            class=" text-pink-500 hover:underline">built-in PDF viewer</a
          > that provides basic editing features).
        </p>
      </section>
      <section>
        <h4 class="font-bold">Step 2</h4>
        <p>
          Grab the <strong class="text-purple-500">tax report(s)</strong> from your
          Trade Republic application (tap on your profile > Activity > "Monthly tax
          report" of the month you want to settle)
        </p>
      </section>
      <section>
        <h4 class="font-bold">Step 3</h4>
        <p>
          Fill in your <strong class="text-pink-500">Full name</strong> and
          <strong class="text-pink-500">National registration number</strong> in
          the "Personnal information" section (these will be used when filling
          the bank transfer reference and the subject of the email). You can
          then feed the pre-filled
          <strong class="text-orange-500">template</strong>
          and the <strong class="text-purple-500">tax report(s)</strong> in the related
          squares below.
        </p>
      </section>
      <section>
        <h4 class="font-bold">Step 4</h4>
        <p>From then you can hit:</p>
        <ul class="flex flex-col gap-3 ml-10 mt-3 list-disc">
          <li>
            <strong
              class="px-2 py-1 text-slate-50 rounded bg-pink-500 text-nowrap"
              >Preview</strong
            >
            to get the payment information;
          </li>
          <li>
            <strong
              class="px-2 py-1 text-slate-50 rounded bg-pink-500 text-nowrap"
              >Download</strong
            >
            to download the generated tax report to send to the SPF finances;
          </li>
          <li>
            <strong
              class="px-2 py-1 text-slate-50 rounded bg-pink-500 text-nowrap"
              >Download & Send</strong
            >
            to download the report and open a pre-filled email form, in which you'll
            simply have to attach the generated report and hit "Send"!
          </li>
        </ul>
      </section>
    </article>
  </dialog>
</div>
