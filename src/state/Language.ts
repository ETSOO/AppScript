import { DataTypes } from '@etsoo/shared';
import { IState } from './State';

/**
 * Culture resources state, simple i18n solution
 * For premium solution: https://www.i18next.com/
 * Indexable type
 */
export interface ICulture extends DataTypes.CultureDefinition, IState {}
