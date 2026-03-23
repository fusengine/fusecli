/**
 * Validates an IR structure for completeness and correctness.
 * @module
 */

import type { IR } from "./types.js";

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate an IR for required fields and structural correctness.
 * @param ir - The IR to validate
 * @returns Validation result with errors list
 */
export function validateIR(ir: IR): ValidationResult {
  const errors: string[] = [];

  if (!ir.meta.title) errors.push("meta.title is required");
  if (!ir.meta.baseUrl) errors.push("meta.baseUrl is required");
  if (!ir.meta.version) errors.push("meta.version is required");
  if (ir.resources.length === 0) errors.push("IR must have at least one resource");

  for (const resource of ir.resources) {
    if (!resource.name) errors.push("Resource name is required");
    if (resource.actions.length === 0) {
      errors.push(`Resource "${resource.name}" must have at least one action`);
    }
    for (const action of resource.actions) {
      if (!action.name) errors.push(`Action in "${resource.name}" missing name`);
      if (!action.method) errors.push(`Action "${action.name}" missing method`);
      if (!action.path) errors.push(`Action "${action.name}" missing path`);
    }
  }

  return { valid: errors.length === 0, errors };
}
