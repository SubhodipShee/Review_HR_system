
export default function MarkdownRenderer({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let currentTable = null // Accumulate table: { headers: [], rows: [] }
  let currentList = null // Accumulate list: { type: 'ul' | 'ol', items: [] }

  const parseInlineStyles = (text) => {
    // Splits by **bold** tags
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-extrabold text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  const flushTable = () => {
    if (currentTable) {
      elements.push(
        <div key={`table-${elements.length}`} className="my-4 overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0c1329] border-b border-slate-800">
                {currentTable.headers.map((h, i) => (
                  <th key={i} className="p-3 font-bold text-slate-300 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTable.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-slate-800/50 hover:bg-slate-900/40 transition-colors duration-150">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 text-slate-200 font-medium">
                      {parseInlineStyles(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      currentTable = null
    }
  }

  const flushList = () => {
    if (currentList) {
      const Tag = currentList.type
      elements.push(
        <Tag
          key={`list-${elements.length}`}
          className={
            Tag === 'ul'
              ? 'list-disc pl-5 my-2 space-y-1 text-slate-300'
              : 'list-decimal pl-5 my-2 space-y-1 text-slate-300'
          }
        >
          {currentList.items.map((item, i) => (
            <li key={i} className="text-sm text-slate-300 leading-relaxed">
              {parseInlineStyles(item)}
            </li>
          ))}
        </Tag>
      )
      currentList = null
    }
  }

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim()

    if (!line) {
      flushTable()
      flushList()
      continue
    }

    // Check for table line
    if (line.startsWith('|')) {
      flushList()
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter((_, i, arr) => i > 0 && i < arr.length - 1)
      const isSeparator = cells.every((c) => /^:-*:?$/.test(c) || /^-+$/.test(c))
      if (isSeparator) {
        continue
      }
      if (!currentTable) {
        currentTable = { headers: cells, rows: [] }
      } else {
        currentTable.rows.push(cells)
      }
      continue
    } else {
      flushTable()
    }

    // Check for list item
    const isUnordered = line.startsWith('- ') || line.startsWith('* ')
    const isOrdered = /^\d+\.\s/.test(line)
    if (isUnordered || isOrdered) {
      const type = isUnordered ? 'ul' : 'ol'
      const cleanText = isUnordered ? line.substring(2) : line.substring(line.indexOf(' ') + 1)
      if (!currentList || currentList.type !== type) {
        flushList()
        currentList = { type, items: [cleanText] }
      } else {
        currentList.items.push(cleanText)
      }
      continue
    } else {
      flushList()
    }

    // Check for headers
    if (line.startsWith('#')) {
      const level = line.match(/^#+/)[0].length
      const cleanText = line.substring(level).trim()
      if (level === 1) {
        elements.push(
          <h2 key={idx} className="text-base font-extrabold text-white mt-4 mb-2 tracking-wide uppercase">
            {parseInlineStyles(cleanText)}
          </h2>
        )
      } else if (level === 2) {
        elements.push(
          <h3 key={idx} className="text-sm font-bold text-slate-200 mt-3 mb-2 tracking-wide uppercase">
            {parseInlineStyles(cleanText)}
          </h3>
        )
      } else {
        elements.push(
          <h4 key={idx} className="text-xs font-semibold text-slate-300 mt-2 mb-1 uppercase">
            {parseInlineStyles(cleanText)}
          </h4>
        )
      }
      continue
    }

    // Default paragraph
    elements.push(
      <p key={idx} className="text-sm text-slate-300 leading-relaxed my-2">
        {parseInlineStyles(line)}
      </p>
    )
  }

  flushTable()
  flushList()

  return <div className="space-y-1">{elements}</div>
}
