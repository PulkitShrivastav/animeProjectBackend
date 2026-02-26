export interface SaveFile {
    userID: number,
    fileName: string,
    js_code: string,
    css_code: string,
    html_code: string,
    butoons: Array<string>,
    action: 'save' | 'update'
}