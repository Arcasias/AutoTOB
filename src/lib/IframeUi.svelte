<script lang="ts">
  function populateIFrame(iframe: HTMLIFrameElement) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://example.org/");
    xhr.onreadystatechange = function handler() {
      if (this.readyState === this.DONE) {
        if (this.status === 200) {
          iframe.src = URL.createObjectURL(this.response);
        } else {
          console.error("Request failed", this);
        }
      }
    };
    xhr.responseType = "blob";
    xhr.withCredentials = true;
    for (const [header, value] of HEADERS) {
      xhr.setRequestHeader(header, value);
    }
    xhr.send();
  }

  const MYMINFIN_LANDING_URL =
    "https://www.minfin.fgov.be/myminfin-web/pages/public";
  const HEADERS = [
    ["Content-Type", "application/x-www-form-urlencoded"],
    ["Access-Control-Allow-Origin", "*"],
  ];

  let iframe: HTMLIFrameElement;
</script>

<iframe
  bind:this={iframe}
  use:populateIFrame
  class="w-full h-full m-0"
  frameborder="0"
  is="x-frame-bypass"
>
</iframe>
