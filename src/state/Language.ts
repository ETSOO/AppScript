import { DataTypes } from '@etsoo/shared';
import { IState } from './State';

/**
 * Language labels/settings state, simple i18n solution
 * For premium solution: https://www.i18next.com/
 * Indexable type
 */
export interface ILanguage extends DataTypes.LanguageDefinition, IState {}
