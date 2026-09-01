const captureButton = document.getElementById("capture");
const exportButton = document.getElementById("export");
const status = document.getElementById("status");

captureButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const results = await chrome.scripting.executeScript({
    target: {
      tabId: tab.id,
    },

    func: () => {
      return {
        html: document.documentElement.outerHTML,
        url: window.location.href,
        title: document.title,
      };
    },
  });

  const page = results[0].result;

  const snapshot = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),

    url: page.url,
    title: page.title,
    html: page.html,
  };

  const storage = await chrome.storage.local.get("snapshots");

  const snapshots = storage.snapshots || [];

  snapshots.push(snapshot);

  await chrome.storage.local.set({
    snapshots,
  });

  status.textContent = `Snapshot salvo. Total: ${snapshots.length}`;
});

exportButton.addEventListener("click", async () => {
  const storage = await chrome.storage.local.get("snapshots");

  const snapshots = storage.snapshots || [];

  const json = JSON.stringify(snapshots, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  await chrome.downloads.download({
    url,
    filename: `html-snapshots-${Date.now()}.json`,
    saveAs: true,
  });
});
