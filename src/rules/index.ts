/** Registry of all rules, in report order. */

import type { Rule } from "./context.js";
import { imgAlt, imgRedundantAlt } from "./images.js";
import { inputLabel, labelEmpty } from "./forms.js";
import {
  headingEmpty,
  headingOrder,
  landmarkMain,
  listStructure,
  pageHasH1,
} from "./structure.js";
import { buttonName, linkHref, linkName, positiveTabindex } from "./controls.js";
import { ariaAttrValid, ariaHiddenFocus, ariaRoleValid } from "./aria.js";
import {
  duplicateId,
  htmlLang,
  metaViewportScalable,
  pageTitle,
} from "./language.js";
import { tableCaption, tableHeaders } from "./tables.js";
import { contrastInline } from "./color.js";

export const RULES_REGISTRY: Rule[] = [
  // images
  imgAlt,
  imgRedundantAlt,
  // forms
  inputLabel,
  labelEmpty,
  // structure
  pageHasH1,
  headingOrder,
  headingEmpty,
  landmarkMain,
  listStructure,
  // controls
  buttonName,
  linkName,
  linkHref,
  positiveTabindex,
  // aria
  ariaRoleValid,
  ariaAttrValid,
  ariaHiddenFocus,
  // language
  htmlLang,
  pageTitle,
  metaViewportScalable,
  duplicateId,
  // tables
  tableHeaders,
  tableCaption,
  // color
  contrastInline,
];

export type { Rule, RuleContext } from "./context.js";
