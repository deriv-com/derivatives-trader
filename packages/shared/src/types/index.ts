// Type definitions for shared package

import { EMPLOYMENT_VALUES } from '../utils/constants/signup_fields';

// Employment status type based on EMPLOYMENT_VALUES constant
export type TEmploymentStatus = (typeof EMPLOYMENT_VALUES)[keyof typeof EMPLOYMENT_VALUES];
