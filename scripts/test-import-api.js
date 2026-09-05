// Test endpoint import penduduk via HTTP POST.
// Pakai Node built-in fetch + FormData (Node 18+).

const path = require("path");
const fs = require("fs");

const FILE = path.join(__dirname, "..", "bahan", "lemahjaya", "format-impor-excel.xlsx");
const URL = "http://localhost:3000/api/admin/import/penduduk";

async function main() {
  const blob = new Blob([fs.readFileSync(FILE)]);
  const form = new FormData();
  form.append("file", blob, "format-impor-excel.xlsx");
  const res = await fetch(URL, { method: "POST", body: form });
  const json = await res.json();
  console.log("HTTP", res.status);
  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});