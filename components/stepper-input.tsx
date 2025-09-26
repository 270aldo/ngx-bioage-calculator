import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  id: string
  label?: string
  value: number | ""
  onChange: (n: number | "") => void
  min?: number
  max?: number
  step?: number
}

export function StepperInput({ id, value, onChange, min = 0, max = 999, step = 1 }: Props) {
  function add(delta: number) {
    if (value === "") return onChange(0)
    const v = Math.min(max, Math.max(min, Number(value) + delta))
    onChange(Number.isNaN(v) ? 0 : v)
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" className="rounded-full size-9" onClick={() => add(-step)}>-</Button>
      <Input id={id} type="number" value={value} onChange={(e) => {
        const v = e.target.value
        onChange(v === "" ? "" : Number(v))
      }} className="text-center" />
      <Button type="button" variant="outline" className="rounded-full size-9" onClick={() => add(step)}>+</Button>
    </div>
  )
}
