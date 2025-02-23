export function transformUrl(url: string): string {
    return url.replace(/\/u\/FFBB\//, '/data/').replace(/\/$/, '') + '/data.json';
}

