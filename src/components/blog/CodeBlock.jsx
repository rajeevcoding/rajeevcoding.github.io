import { CopyBlock, dracula } from 'react-code-blocks';

export default function CodeBlock({ children, className, node, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  // Inline code — leave unstyled
  if (!match) {
    return <code className={className} {...props}>{children}</code>;
  }

  // Fenced code block — use CopyBlock
  const codeText = typeof children === 'string'
    ? children.replace(/\n$/, '')
    : String(children).replace(/\n$/, '');

  return (
    <div className="not-prose my-6">
      <CopyBlock
        text={codeText}
        language={language}
        showLineNumbers={false}
        theme={dracula}
        codeBlock
      />
    </div>
  );
}
