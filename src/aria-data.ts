/** Valid ARIA roles and attributes (WAI-ARIA 1.2 subset, declarative). */

export const VALID_ROLES = new Set<string>([
  // Landmark
  "banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search",
  // Document structure
  "article", "cell", "columnheader", "definition", "directory", "document", "feed", "figure",
  "group", "heading", "img", "list", "listitem", "math", "none", "note", "presentation", "row",
  "rowgroup", "rowheader", "separator", "table", "term", "toolbar", "tooltip",
  // Widget
  "alert", "alertdialog", "button", "checkbox", "dialog", "gridcell", "link", "log", "marquee",
  "menuitem", "menuitemcheckbox", "menuitemradio", "option", "progressbar", "radio", "scrollbar",
  "searchbox", "slider", "spinbutton", "status", "switch", "tab", "tabpanel", "textbox", "timer",
  "treeitem",
  // Composite
  "combobox", "grid", "listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid",
  // Live region / application
  "application", "tabpanel",
]);

export const VALID_ARIA_ATTRS = new Set<string>([
  "aria-activedescendant", "aria-atomic", "aria-autocomplete", "aria-busy", "aria-checked",
  "aria-colcount", "aria-colindex", "aria-colspan", "aria-controls", "aria-current",
  "aria-describedby", "aria-details", "aria-disabled", "aria-dropeffect", "aria-errormessage",
  "aria-expanded", "aria-flowto", "aria-grabbed", "aria-haspopup", "aria-hidden", "aria-invalid",
  "aria-keyshortcuts", "aria-label", "aria-labelledby", "aria-level", "aria-live", "aria-modal",
  "aria-multiline", "aria-multiselectable", "aria-orientation", "aria-owns", "aria-placeholder",
  "aria-posinset", "aria-pressed", "aria-readonly", "aria-relevant", "aria-required",
  "aria-roledescription", "aria-rowcount", "aria-rowindex", "aria-rowspan", "aria-selected",
  "aria-setsize", "aria-sort", "aria-valuemax", "aria-valuemin", "aria-valuenow", "aria-valuetext",
]);
