document.addEventListener("DOMContentLoaded", () => {
  const regionSelect = document.getElementById("region-select");
  if (!regionSelect) return;

  const storedRegion = localStorage.getItem("planner-selected-region") || "us";
  regionSelect.value = storedRegion;

  function setRegion(region) {
    localStorage.setItem("planner-selected-region", region);
    document.documentElement.dataset.plannerRegion = region;
    const event = new CustomEvent("plannerRegionChanged", { detail: { region } });
    document.dispatchEvent(event);
  }

  regionSelect.addEventListener("change", (event) => {
    const selected = event.target.value;
    setRegion(selected);
  });

  setRegion(storedRegion);
});
