export default function shuffler(text: string): string {
    const insert: string = process.env.BUFFER || '';
    const pepper: string = process.env.PEPPER || '';
    let result: string = '';
    let insertIndex: number = 0;

    for (let i = 0; i < text.length; i++) {
        result += text[i] + (insert[insertIndex] || '');
        insertIndex = (insertIndex + 1) % insert.length;
    }

    return result + pepper;
}
