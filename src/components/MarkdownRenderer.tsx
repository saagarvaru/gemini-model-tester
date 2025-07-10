import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple, secure markdown renderer
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = ''
}) => {
  if (!content?.trim()) {
    return null;
  }

  return (
    <div className={`markdown-renderer ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          // Open external links in new tab
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                {...props}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            );
          },
          // Responsive images
          img: ({ src, alt, ...props }) => (
            <img
              {...props}
              src={src}
              alt={alt || 'Image'}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 