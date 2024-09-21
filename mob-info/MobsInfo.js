export async function GetMobList() {
  let resp = undefined;

  try {
    // Make sure the path is correct and accessible
    const module = await import('/mob-info/mobs.js'); // Adjust this path as needed
    resp = module.mobs; // Ensure this matches the named export in mobs.js
  } catch (error) {
    console.error("Failed to fetch the module:", error);
    return {};
  }

  var mobList = {};

  if (resp == undefined) return mobList;

  function addItem(id, tier, type, loc) {
    if (!mobList[id]) mobList[id] = [];
    else return;

    mobList[id][0] = tier;
    mobList[id][1] = type;
    mobList[id][2] = loc;
  }

  for (const [key, value] of Object.entries(resp)) {
    addItem(parseInt(key), value[0], value[1], value[2]);
  }

  return mobList;
}
