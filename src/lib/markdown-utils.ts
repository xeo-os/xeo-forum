export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // 转换标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // 转换粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 转换斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 转换行内代码
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // 转换链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // 转换引用
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

  // 转换无序列表
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  // 转换有序列表
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
  
  // 转换换行
  html = html.replace(/\n/g, '<br>');

  return html;
}
