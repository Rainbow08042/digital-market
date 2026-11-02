"""Extract the final screening sheet without executing workbook content."""
import json
import sys
from pathlib import Path

import openpyxl

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / "src" / "data" / "employees.json"
workbook = openpyxl.load_workbook(source, read_only=True, data_only=True)
sheet = workbook["二次筛选表"]
records = []
for row_number, row in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
    marker, name, description, repository, contributor = row
    if not name:
        continue
    records.append({
        "id": f"employee-{row_number - 1:02d}",
        "name": str(name).strip(),
        "description": str(description or "").strip(),
        "sourceRepository": str(repository or "").strip(),
        "sourceMarker": marker,
        "sourceRow": row_number,
    })
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Extracted {len(records)} records from final screening sheet.")
