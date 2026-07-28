import { useEffect, useMemo, useState } from "react";
import { usePlannerData } from "../hooks/usePlannerData";
import { defaultEventCategories, defaultTaskCategories } from "../data/defaultCategories";
import { updateUserSettingsAction } from "../reducers/plannerActions";
import {
  CloseIcon,
  PlusIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  TaskTabIcon,
  EventTabIcon,
} from "./Icons";

const emptyCategory = (kind) => ({
  id: crypto.randomUUID(),
  kind,
  label: "",
  baseColor: "#6568f1",
});

export default function SettingsModal({ onClose, updateUserSettings, userSettings, setTheme }) {
  const fallbackCategories = [...defaultTaskCategories, ...defaultEventCategories];
  const [categories, setCategories] = useState(userSettings?.categories?.length ? userSettings.categories : fallbackCategories);
  const [themeValue, setThemeValue] = useState(userSettings?.theme ?? "light");

  const taskCategories = useMemo(
    () => categories.filter((cat) => cat.kind === "task"),
    [categories],
  );

  const eventCategories = useMemo(
    () => categories.filter((cat) => cat.kind === "event"),
    [categories],
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function updateCategory(id, patch) {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat)),
    );
  }

  function addCategory(kind) {
    setCategories((prev) => [...prev, emptyCategory(kind)]);
  }

  function removeCategory(id) {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  }

  function save() {
    console.log("SAVE CLICKED");
    console.log("categories before save", categories);

    updateUserSettings({
      theme: themeValue,
      categories,
    });

    setTheme(themeValue);
    onClose();
  }

  function renderCategoryRow(cat) {
    return (
      <div className="settings-row" key={cat.id}>
        <div className="settings-row-main">
          <span
            className="settings-color-preview"
            style={{ backgroundColor: cat.baseColor }}
            aria-hidden="true"
          />

          <input
            value={cat.label}
            onChange={(e) => updateCategory(cat.id, { label: e.target.value })}
            placeholder="Category name"
          />

          <span
            className="settings-chip-preview"
            style={{
              backgroundColor: `color-mix(in srgb, ${cat.baseColor} 18%, var(--color-surface))`,
              borderColor: `color-mix(in srgb, ${cat.baseColor} 42%, var(--color-border))`,
            }}
          >
            {cat.label.trim() || "Preview"}
          </span>
        </div>

        <div className="settings-row-actions">
          <label className="settings-color-field" title="Choose color">
            <span className="sr-only">Category color</span>
            <input
              type="color"
              value={cat.baseColor}
              onChange={(e) => updateCategory(cat.id, { baseColor: e.target.value })}
            />
          </label>

          <button
            type="button"
            className="settings-icon-btn settings-delete-btn"
            onClick={() => removeCategory(cat.id)}
            aria-label={`Delete ${cat.label || "category"}`}
            title="Delete category"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="settings-modal-header">
          <div className="settings-modal-title-wrap">
            <p className="settings-eyebrow">Preferences</p>
            <h2 id="settings-modal-title">Settings</h2>
            <p className="settings-intro">
              Adjust the theme and manage custom categories for tasks and events.
            </p>
          </div>

          <button
            type="button"
            className="settings-icon-btn settings-close-btn"
            onClick={onClose}
            aria-label="Close settings"
            title="Close settings"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="settings-modal-body">
          <section className="settings-section">
            <div className="settings-section-head">
              <div className="settings-section-label">
                <h3>Theme</h3>
                <p>Switch between light and dark mode.</p>
              </div>
            </div>

            <div className="settings-theme-toggle" role="group" aria-label="Theme">
              <button
                type="button"
                className={themeValue === "light" ? "is-active" : ""}
                onClick={() => setThemeValue("light")}
                aria-pressed={themeValue === "light"}
                title="Light theme"
              >
                <SunIcon />
                <span>Light</span>
              </button>

              <button
                type="button"
                className={themeValue === "dark" ? "is-active" : ""}
                onClick={() => setThemeValue("dark")}
                aria-pressed={themeValue === "dark"}
                title="Dark theme"
              >
                <MoonIcon />
                <span>Dark</span>
              </button>
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-head">
              <div className="settings-section-label">
                <div className="settings-section-title">
                  <TaskTabIcon />
                  <h3>Task Categories</h3>
                </div>
                <p>Used in task cards, backlog and weekly planning.</p>
              </div>

              <button
                type="button"
                className="settings-icon-btn"
                onClick={() => addCategory("task")}
                aria-label="Add task category"
                title="Add task category"
              >
                <PlusIcon />
              </button>
            </div>

            <div className="settings-list">
              {taskCategories.length === 0 ? (
                <p className="settings-empty">No task categories yet.</p>
              ) : (
                taskCategories.map(renderCategoryRow)
              )}
            </div>
          </section>

          <section className="settings-section">
            <div className="settings-section-head">
              <div className="settings-section-label">
                <div className="settings-section-title">
                  <EventTabIcon />
                  <h3>Event Categories</h3>
                </div>
                <p>Used in the calendar and event cards.</p>
              </div>

              <button
                type="button"
                className="settings-icon-btn"
                onClick={() => addCategory("event")}
                aria-label="Add event category"
                title="Add event category"
              >
                <PlusIcon />
              </button>
            </div>

            <div className="settings-list">
              {eventCategories.length === 0 ? (
                <p className="settings-empty">No event categories yet.</p>
              ) : (
                eventCategories.map(renderCategoryRow)
              )}
            </div>
          </section>
        </div>

        <div className="settings-actions">
          <button
            type="button"
            className="settings-footer-btn ghost-btn"
            onClick={onClose}
            aria-label="Cancel"
            title="Cancel"
          >
            <CloseIcon />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            className="settings-footer-btn"
            onClick={save}
            aria-label="Save changes"
            title="Save changes"
          >
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}