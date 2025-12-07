
import React from 'react';

interface MarkdownRendererProps {
  text: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-1 my-2">{currentList}</ul>);
      currentList = [];
    }
  };

  text.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('* ')) {
      currentList.push(<li key={i}>{line.trim().substring(2)}</li>);
    } else {
      flushList();
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-base font-semibold mt-4 mb-2 text-text-primary">{line.substring(4)}</h3>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={i} className="my-1"><strong>{line.substring(2, line.length - 2)}</strong></p>);
      } else if (line.trim() !== '') {
        elements.push(<p key={i} className="my-1">{line}</p>);
      }
    }
  });

  flushList();

  return <>{elements}</>;
};

export default MarkdownRenderer;
