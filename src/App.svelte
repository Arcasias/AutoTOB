<script lang="ts">
  import type { MouseEventHandler } from "svelte/elements";
  import PdfUi from "./lib/PdfUi.svelte";
  import { storageGet, storageSet } from "./lib/utils";
  import IframeUi from "./lib/IframeUi.svelte";

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

  const toggleVersion = () => {
    version = version === "pdf" ? "iframe" : "pdf";
    location.hash = `#${version}`;
  };

  let howToUsePdfDialog: HTMLDialogElement;
  let theme = storageGet<Theme>("theme", getDefaultTheme());
  let version = location.hash.includes("pdf") ? "pdf" : "iframe";

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
        title="Use PDF version"
        on:click={toggleVersion}
      >
        📝
      </button>
      <button
        class="w-10 h-10 rounded-full select-none transition-colors shadow-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        title="How to use?"
        on:click={() => howToUsePdfDialog.showModal()}
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

  {#if version === "pdf"}
    <PdfUi />
  {:else}
    <IframeUi />
  {/if}

  <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
  <dialog
    class="p-5 w-screen h-min shadow-lg md:w-1/2 backdrop:bg-opacity-70 backdrop:bg-slate-50 text-slate-900 bg-slate-50 dark:text-slate-100 dark:bg-slate-950 dark:backdrop:bg-opacity-70 dark:backdrop:bg-slate-950"
    bind:this={howToUsePdfDialog}
    on:click={onDialogClick}
  >
    <header
      class="flex items-center pb-2 w-full rounded-t-lg border-b-2 border-pink-500"
    >
      <h3 class="text-lg font-bold">How to use?</h3>
      <button
        class="ms-auto w-8 h-8 rounded-full select-none transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        title="Close"
        on:click={() => howToUsePdfDialog.close()}
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
