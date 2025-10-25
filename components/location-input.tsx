"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Location = { label: string; lat: number; lon: number }

type Props = {
  value: Location | null
  onChange: (loc: Location | null) => void
  placeholder?: string
}

export default function LocationInput({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState<string>(value?.label || "")
  const [results, setResults] = useState<Location[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    setQuery(value?.label || "")
  }, [value])

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (!query || query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        const j = await res.json()
        setResults(j?.results || [])
        setOpen((j?.results || []).length > 0)
      } catch (e) {
        setResults([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [query])

  function handleSelect(r: Location) {
    onChange(r)
    setQuery(r.label)
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(null)
        }}
        placeholder={placeholder || "City, State or ZIP"}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="location-listbox"
      />
      {open && (
        <Card className="absolute z-20 mt-1 w-full border bg-white shadow-lg">
          <ul id="location-listbox" role="listbox" className="max-h-64 overflow-auto divide-y">
            {results.map((r) => (
              <li
                key={`${r.lat},${r.lon}`}
                role="option"
                aria-selected={value?.lat === r.lat && value?.lon === r.lon}
                className="px-3 py-2 cursor-pointer hover:bg-muted/40"
                onClick={() => handleSelect(r)}
              >
                {r.label}
                <span className="ml-2 text-xs text-muted-foreground">({r.lat.toFixed(3)}, {r.lon.toFixed(3)})</span>
              </li>
            ))}
            {loading && <li className="px-3 py-2 text-sm text-muted-foreground">Searching…</li>}
            {!loading && results.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
            )}
          </ul>
        </Card>
      )}
    </div>
  )
}
