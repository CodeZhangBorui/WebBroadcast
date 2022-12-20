import path from 'path';

export const __dirname = path.resolve('./');
export const __staticPath = getPath('web/public');

export function getPath(p) {
    return path.join(__dirname, './src/', p);
}
export function getPageFilePath(pageName) {
    return getPath('web/page/', pageName + '.html');
}