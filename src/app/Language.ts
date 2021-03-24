/**
 * Language labels, simple i18n solution
 * For premium solution: https://www.i18next.com/
 * Indexable type
 */
 export interface LanguageLabels {
    readonly [key: string]: string;
}

/**
 * Language state
 */
export interface ILanguage {
    /**
     * Labels of the language
     */
     labels: LanguageLabels;

     /**
      * Language cid, like 'zh-CN'
      */
     name: string;
}