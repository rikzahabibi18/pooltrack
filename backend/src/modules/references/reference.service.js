import * as referenceRepository from './reference.repository.js';

/**
 * Referensi tidak punya aturan bisnis; service tetap ada supaya alur
 * route → controller → service → repository sama di semua modul.
 */

export const getUnitStatuses = () => referenceRepository.findUnitStatuses();

export const getInspectionGrades = () => referenceRepository.findInspectionGrades();
