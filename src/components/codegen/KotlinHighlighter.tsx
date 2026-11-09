import React from 'react';

interface KotlinHighlighterProps {
  code: string;
  language?: 'kotlin' | 'xml';
}

/**
 * High-performance regex-based syntax highlighter for Kotlin and XML
 */
export const KotlinHighlighter: React.FC<KotlinHighlighterProps> = ({
  code,
  language = 'kotlin',
}) => {
  const highlightKotlin = (text: string): React.ReactNode[] => {
    // Regex tokens
    const tokenRegex = /(package|import|public|private|val|var|fun|get|return|by|lazy|null|\?\?|apply|build)|(@Composable|@Preview)|(ImageVector|Builder|PathBuilder|Color|Brush|SolidColor|Offset|StrokeCap|StrokeJoin|PathFillType|dp)|(0x[0-9a-fA-F]+|[0-9]+\.?[0-9]*f?)|("[^"]*")|(\/\/[^\n]*)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const [, kw, annot, type, num, str, comment] = match;

      if (kw) {
        parts.push(<span key={match.index} className="code-keyword">{kw}</span>);
      } else if (annot) {
        parts.push(<span key={match.index} className="code-annotation">{annot}</span>);
      } else if (type) {
        parts.push(<span key={match.index} className="code-type">{type}</span>);
      } else if (num) {
        parts.push(<span key={match.index} className="code-number">{num}</span>);
      } else if (str) {
        parts.push(<span key={match.index} className="code-string">{str}</span>);
      } else if (comment) {
        parts.push(<span key={match.index} className="code-comment">{comment}</span>);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const highlightXml = (text: string): React.ReactNode[] => {
    const tokenRegex = /(<\/?[a-zA-Z0-9:-]+)|(\/?>)|([a-zA-Z0-9:-]+)=|("[^"]*")|(<!--[\s\S]*?-->)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const [, tag, tagEnd, attrName, str, comment] = match;

      if (tag || tagEnd) {
        parts.push(<span key={match.index} className="code-keyword">{tag || tagEnd}</span>);
      } else if (attrName) {
        parts.push(<span key={match.index} className="code-type">{attrName}=</span>);
      } else if (str) {
        parts.push(<span key={match.index} className="code-string">{str}</span>);
      } else if (comment) {
        parts.push(<span key={match.index} className="code-comment">{comment}</span>);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  const label = language === 'kotlin' ? 'Generated Kotlin ImageVector code' : 'Cleaned SVG XML code';

  return (
    <pre
      className="code-scroll-area"
      tabIndex={0}
      role="region"
      aria-label={label}
    >
      <code>{language === 'kotlin' ? highlightKotlin(code) : highlightXml(code)}</code>
    </pre>
  );
};
