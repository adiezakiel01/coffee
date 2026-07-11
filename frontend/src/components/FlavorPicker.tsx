"use client";

import { useState } from "react";

export interface FlavorCategory {
  label: string;
  color: string;
  subcategories: Record<string, string[]>;
}

// Own taxonomy, inspired by the general concept of a coffee flavor wheel
// (broad category -> subcategory -> specific descriptor). Not a reproduction
// of any specific published wheel's structure, wording, or colors.
export const FLAVOR_CATEGORIES: Record<string, FlavorCategory> = {
  fruity: {
    label: "Fruity",
    color: "#c0392b",
    subcategories: {
      Berry: ["Blackberry", "Raspberry", "Strawberry", "Blueberry"],
      Citrus: ["Lemon", "Orange", "Grapefruit", "Lime"],
      "Dried fruit": ["Raisin", "Prune", "Fig", "Date"],
      "Other fruit": ["Apple", "Peach", "Pear", "Cherry", "Grape"],
    },
  },
  floral: {
    label: "Floral",
    color: "#a1477a",
    subcategories: {
      Floral: ["Jasmine", "Rose", "Chamomile", "Hibiscus"],
    },
  },
  sweet: {
    label: "Sweet",
    color: "#b5772e",
    subcategories: {
      "Brown sugar": ["Caramel", "Molasses", "Honey", "Maple syrup"],
      Vanilla: ["Vanilla"],
    },
  },
  nutty: {
    label: "Nutty/Cocoa",
    color: "#7a5230",
    subcategories: {
      Nutty: ["Almond", "Hazelnut", "Peanut"],
      Cocoa: ["Chocolate", "Dark chocolate"],
    },
  },
  spices: {
    label: "Spices",
    color: "#8b3a3a",
    subcategories: {
      Spice: ["Cinnamon", "Clove", "Nutmeg", "Anise"],
    },
  },
  sour: {
    label: "Sour/Fermented",
    color: "#b8960c",
    subcategories: {
      Sour: ["Citric", "Malic", "Winey", "Fermented"],
    },
  },
  green: {
    label: "Green/Vegetative",
    color: "#4a7c3f",
    subcategories: {
      Vegetative: ["Herb-like", "Fresh", "Grassy", "Under-ripe"],
    },
  },
  roasted: {
    label: "Roasted",
    color: "#6b4a35",
    subcategories: {
      Roasted: ["Smoky", "Toasted", "Ashy", "Burnt"],
    },
  },
};

interface FlavorPickerProps {
  value: string[] | null;
  onChange: (tags: string[]) => void;
}

export default function FlavorPicker({ value, onChange }: FlavorPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const selected = value ?? [];

  function toggleTag(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  function removeTag(tag: string) {
    onChange(selected.filter((t) => t !== tag));
  }

  const activeCategoryData = activeCategory
    ? FLAVOR_CATEGORIES[activeCategory]
    : null;

  return (
    <div>
      <label className="text-xs text-card-ink-muted text-accent-roast font-bold block mb-1.5">
        Flavor tags
      </label>

      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[26px]">
        {selected.length === 0 ? (
          <span className="text-xs text-card-ink-muted/60 text-accent-strong italic">
            No flavor tags selected yet
          </span>
        ) : (
          selected.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-accent-strong text-card-ink font-medium inline-flex items-center gap-1.5"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap text-accent-roast gap-1.5 mb-1.5">
        {Object.entries(FLAVOR_CATEGORIES).map(([key, cat]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setActiveCategory(activeCategory === key ? null : key);
              setActiveSub(null);
            }}
            className="text-xs px-2.5 py-1 rounded-full border transition-colors"
            style={{
              borderColor: cat.color,
              background: activeCategory === key ? cat.color : "transparent",
              color:
                activeCategory === key
                  ? "#fff"
                  : "var(--tw-text-opacity, #3d2a1f)",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Subcategory chips */}
      {activeCategoryData && (
        <div className="border-t border-card-card-ink-muted/15 pt-2 mb-1.5">
          <div className="flex flex-wrap text-accent-roast gap-1.5">
            {Object.keys(activeCategoryData.subcategories).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setActiveSub(activeSub === sub ? null : sub)}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors"
                style={{
                  borderColor: activeCategoryData.color,
                  background:
                    activeSub === sub
                      ? activeCategoryData.color
                      : "transparent",
                  color:
                    activeSub === sub
                      ? "#fff"
                      : "var(--tw-text-opacity, #3d2a1f)",
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tag chips */}
      {activeCategoryData && activeSub && (
        <div className="border-t border-card-card-ink-muted/15 pt-2">
          <div className="flex flex-wrap text-accent-roast gap-1.5">
            {activeCategoryData.subcategories[activeSub].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selected.includes(tag)
                    ? "bg-accent-strong text-card-ink border-accent-strong"
                    : "bg-white text-card-ink border-card-ink-muted/20"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
