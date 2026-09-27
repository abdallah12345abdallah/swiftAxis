/* ── v-card-labels ────────────────────────────────────────────────────
   On a phone a soft-well table is drawn as a stack of cards (see the card
   block in main.css), where every field needs the name of its column beside
   it. DataTable writes those names itself from its `columns`; a hand-written
   table gets them here, copied off its own header row, so the name on a card
   and the name in the header can never drift apart — including when the
   locale switches.

   Put it on the element that wraps the table:
     <div class="soft-table" v-card-labels><table>…</table></div>

   A header that spans rows or columns has no single name per column, so such a
   table is left alone: give its cells `:data-label` by hand. */

function applyLabels(el) {
  const table = el.tagName === 'TABLE' ? el : el.querySelector('table')
  const headRow = table?.tHead?.rows.length === 1 ? table.tHead.rows[0] : null
  if (!headRow) return

  const heads = [...headRow.cells]
  if (heads.some((th) => th.colSpan > 1 || th.rowSpan > 1)) return
  const names = heads.map((th) => th.textContent.trim())

  for (const section of [...table.tBodies, table.tFoot]) {
    for (const row of section?.rows ?? []) {
      // walk the columns, not the cells: a spanned cell (a totals line's
      // "Total", a group heading, an empty state) covers several columns and
      // names none of them, and the cells after it must still line up
      let col = 0
      for (const cell of row.cells) {
        const name = cell.colSpan > 1 ? '' : names[col]
        if (!name) delete cell.dataset.label
        else if (cell.dataset.label !== name) cell.dataset.label = name
        col += cell.colSpan
      }
    }
  }
}

export const vCardLabels = { mounted: applyLabels, updated: applyLabels }
