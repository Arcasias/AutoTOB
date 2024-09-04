<script lang="ts">
  import FileInput from "./lib/FileInput.svelte";
  import { ReportProcessor } from "./lib/ReportProcessor";
  import { nationalNumberValidator, sep } from "./lib/utils";

  const updateStorage = () => {
    localStorage.setItem("full-name", fullName || "");
    localStorage.setItem("national-number", nationalNumber || "");
  };

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
      nationalNumberValidator(nationalNumber);
    } catch (err) {
      errors = [err instanceof Error ? err : new Error(String(err))];
    }

    lastProcessor = processor;
  };

  let errors: Error[] = [];
  let fullName = localStorage.getItem("full-name") || "";
  let lastProcessor: ReportProcessor;
  let nationalNumber = localStorage.getItem("national-number") || "";
</script>

<main>
  <h1>AutoTOB</h1>
  <details>
    <summary class="mb-1">
      <h3>How to use?</h3>
    </summary>
    <p class="mb-1">
      Get the <a
        href="https://finances.belgium.be/sites/default/files/TD-OB1-FR.pdf"
        class="text-primary">TOB report document</a
      > and pre-fill any static information: first section with name, NN and address,
      and the final section's location and signature. From then you can use that
      file as the "template" (on the left), and simply feed 1 or 2 tax report(s)
      to the input on the right.
    </p>
    <p class="mb-1">
      You can then either <strong class="text-primary">Download</strong> the
      generated TOB report, or
      <strong class="text-primary">Download & send</strong> to also be redirected
      to a prepared email template in which you'll simply need to attach the document
      and press "send".
    </p>
  </details>
  <form action="/" class="form" on:submit|preventDefault={onSubmit}>
    {#if errors.length}
      <ul class="errors">
        {#each errors as error}
          <li>{error.message}</li>
        {/each}
      </ul>
    {/if}
    <div class="file-dropzones">
      <FileInput name="template">
        <h3>TOB template</h3>
      </FileInput>
      <FileInput name="reports" multiple={true}>
        <h3>Tax reports</h3>
      </FileInput>
    </div>
    <div class="infos">
      <label>
        Full name:
        <input
          type="text"
          placeholder="Full name"
          bind:value={fullName}
          on:input={updateStorage}
        />
      </label>
      <label>
        National Number:
        <input
          type="text"
          placeholder="National Number"
          bind:value={nationalNumber}
          on:input={updateStorage}
        />
      </label>
    </div>
    <div class="actions">
      <button id="preview">Preview</button>
      <button id="process">Download</button>
      <button id="send">Download & send</button>
    </div>
    {#if lastProcessor}
      <div class="result">
        <h3>{lastProcessor.fileName} is ready</h3>
        <p>
          Total to pay: <strong>{sep(lastProcessor.total)}€</strong>
        </p>
        <p>
          Holder: <strong>Centre de perception - section taxes diverses</strong>
        </p>
        <p>IBAN: <strong>BE39 6792 0022 9319</strong></p>
        <p>BIC: <strong>PCHQ BE BB</strong></p>
        <p>Reference: TOB - {nationalNumber} - {lastProcessor.months}/{lastProcessor.year}</p>
      </div>
    {/if}
  </form>
</main>

<style>
  main {
    width: clamp(300px, 100vw, 680px);
    padding: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  input[type="text"] {
    padding: 0.25rem 0.25rem;
  }

  summary {
    display: flex;
    cursor: pointer;
  }

  .file-dropzones {
    display: flex;
    width: 100%;
    gap: 1rem;
  }

  .infos {
    display: flex;
    width: 100%;
  }

  .actions {
    display: flex;
    width: 100%;
    gap: 0.5rem;
  }

  .actions button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 16pt;
    color: white;
    background-color: var(--primary);
  }

  .errors {
    width: 100%;
    padding: 1rem;
    border: 3px #ee0000 solid;
    color: #ee0000;
    background-color: #ffefef;
    border-radius: 0.5rem;
  }

  .result {
    border-radius: 0.5rem;
    padding: 0.5rem 0.8rem;
    border: 2px var(--primary) solid;
    width: 100%;
  }
</style>
