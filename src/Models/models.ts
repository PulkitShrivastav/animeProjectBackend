export interface SaveFile {
    userID: number,
    fileName: string,
    js_code: string,
    css_code: string,
    html_code: string,
    butoons: Array<string>,
    action: 'save' | 'update'
}

export interface CloseFile {
    userID: number,
    openFiles: string
}

export interface OpenFiles {
    userID: number,
    fileID: number,
    openFiles: string
}

export interface SendOTP {
    email_address: string,
    firstname: string
}