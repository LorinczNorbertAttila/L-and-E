import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { ChevronDown } from "lucide-react";

export default function LocationSelector({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
      searchRef.current.select();
    }
  }, [open]);

  // Outside click closes the dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      const inContainer = containerRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inContainer && !inDropdown) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //Scroll / windos resize closes the dropdown too
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setOpen((o) => !o);
    setSearch("");
  };

  const handleSelect = (opt) => {
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="w-full sm:w-1/2 sm:pr-2">
      <label htmlFor={selectId} className="mt-2 px-2">
        {label}
      </label>
      <div ref={containerRef} className="relative">
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className="inline-flex justify-between items-center w-full bg-white rounded-lg px-3 py-2 text-sm border-2 border-gray-300 text-slate-700 focus:outline-none  focus:border-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">
            {selectedOption ? (
              selectedOption.label
            ) : (
              <span className="text-stone-400">
                Selectează {label.toLowerCase()}
              </span>
            )}
          </span>
          <ChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform duration-200 text-slate-500 ${
              open ? "-rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      {open &&
        ReactDOM.createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 99999,
            }}
            className="rounded-lg bg-white border-2 border-green-600 shadow-lg text-slate-700"
          >
            <div className="relative">
              <input
                id="addressSearch"
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={`Căută: ${label.toLowerCase()}...`}
                className="block w-full px-4 py-2 text-sm text-gray-800 rounded-t border-b border-gray-200 focus:outline-none"
              />
              {search.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-2 px-2 flex items-center"
                />
              )}
            </div>

            <div className="rounded-b max-h-44 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">
                  Nu s-au găsit opțiuni
                </div>
              ) : (
                filteredOptions.map((opt, i) => (
                  <div
                    key={`${opt.value}-${i}`}
                    onClick={() => handleSelect(opt)}
                    className="px-4 py-2 text-sm cursor-pointer flex items-center gap-2"
                  >
                    <span
                      className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        opt.value === value
                          ? "border-teal-800 bg-teal-800"
                          : "border-gray-300"
                      }`}
                    >
                      {opt.value === value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                      )}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
