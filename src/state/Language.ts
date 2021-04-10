import { DataTypes } from '@etsoo/shared';
import { IState } from './State';

/**
 * Language labels/settings, simple i18n solution
 * For premium solution: https://www.i18next.com/
 * Indexable type
 */
export interface LanguageLabels {
    readonly [key: string]: DataTypes.SimpleType;
}

/**
 * Language state
 */
export interface ILanguage extends IState {
    /**
     * Labels of the language
     */
    labels: LanguageLabels;

    /**
     * Language cid, like 'zh-CN'
     */
    name: string;
}
