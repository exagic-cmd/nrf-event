"use client"

import { useState, useEffect } from "react"
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete"
import { X } from "lucide-react"

export default function GooglePlacesInput({
  placeholder,
  onSelect,
  value,
  onChange,
  onClear,
}) {
  const {
    ready,
    value: internalValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 400,
    requestOptions: {
      componentRestrictions: { country: "sg" },
    },
    defaultValue: value,
  })

  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (value !== internalValue) {
      setValue(value, false)
    }
  }, [value, internalValue, setValue])

  const handleInput = (e) => {
    setValue(e.target.value)
    if (onChange) {
      onChange(e.target.value)
    }
    setShowSuggestions(true)
  }

  const handleSelect =
    ({ description }) =>
    async () => {
      setValue(description, false)
      clearSuggestions()
      setShowSuggestions(false)

      const results = await getGeocode({ address: description })
      const { lat, lng } = await getLatLng(results[0])

      onSelect({ description, lat, lng })
    }

  const handleClear = () => {
    setValue("", false)
    if (onClear) {
      onClear()
    }
  }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={handleInput}
        disabled={!ready}
        placeholder={placeholder}
        className="h-12 w-full border rounded-md px-3 pr-10 focus:ring-2 focus:ring-orange-200"
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        onFocus={() => setShowSuggestions(true)}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      {showSuggestions && status === "OK" && (
        <ul className="absolute z-10 bg-white border rounded-md mt-1 w-full shadow-md max-h-60 overflow-y-auto">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={handleSelect({ description })}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}