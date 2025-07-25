'use client'

import React, { useEffect, useState } from "react";
import { unifiedProcessor, SubSection } from "./book-card-section";

// Layout configuration types
type LayoutType = 
  | '1x1' 
  | '1x2' 
  | '2x1' 
  | '2x2' 
  | '1x2-1' 
  | '1x2-2' 
  | '2x1-1' 
  | '2x1-2' 
  | 'others';

interface LayoutConfig {
  type: LayoutType;
  containerClass: string;
  itemConfigs: Array<{
    selector?: string;
    className: string;
    isColumn?: boolean;
    children?: Array<{
      selector: string;
      className: string;
    }>;
  }>;
}

// Layout configurations for each type
const LAYOUT_CONFIGS: Record<LayoutType, LayoutConfig> = {
  '1x1': {
    type: '1x1',
    containerClass: '',
    itemConfigs: [
      { className: 'book-subsection' }
    ]
  },
  '1x2': {
    type: '1x2',
    containerClass: 'flex flex-row flex-wrap',
    itemConfigs: [
      { className: 'basis-1/2' },
      { className: 'basis-1/2' }
    ]
  },
  '2x1': {
    type: '2x1',
    containerClass: 'flex flex-col flex-wrap',
    itemConfigs: [
      { className: 'book-subsection' },
      { className: 'book-subsection' }
    ]
  },
  '2x2': {
    type: '2x2',
    containerClass: 'flex flex-row flex-wrap',
    itemConfigs: [
      { className: 'basis-1/2' },
      { className: 'basis-1/2' },
      { className: 'basis-1/2' },
      { className: 'basis-1/2' }
    ]
  },
  '1x2-1': {
    type: '1x2-1',
    containerClass: 'flex flex-row flex-wrap',
    itemConfigs: [
      {
        className: 'basis-1/2 flex flex-col',
        isColumn: true,
        children: [
          { selector: '1.1', className: 'book-subsection' },
          { selector: '2.1', className: 'book-subsection' }
        ]
      },
      {
        className: 'basis-1/2',
        children: [
          { selector: '1.2-2.2', className: 'book-subsection' }
        ]
      }
    ]
  },
  '1x2-2': {
    type: '1x2-2',
    containerClass: 'flex flex-row flex-wrap',
    itemConfigs: [
      {
        className: 'basis-1/2',
        children: [
          { selector: '1.1-2.1', className: 'book-subsection' }
        ]
      },
      {
        className: 'basis-1/2 flex flex-col',
        isColumn: true,
        children: [
          { selector: '1.2', className: 'book-subsection' },
          { selector: '2.2', className: 'book-subsection' }
        ]
      }
    ]
  },
  '2x1-1': {
    type: '2x1-1',
    containerClass: 'flex flex-col',
    itemConfigs: [
      {
        className: 'flex flex-row flex-wrap',
        children: [
          { selector: '1.1', className: 'basis-1/2 book-subsection' },
          { selector: '1.2', className: 'basis-1/2 book-subsection' }
        ]
      },
      {
        className: '',
        children: [
          { selector: '2.1-2.2', className: 'book-section' }
        ]
      }
    ]
  },
  '2x1-2': {
    type: '2x1-2',
    containerClass: 'flex flex-col',
    itemConfigs: [
      {
        className: '',
        children: [
          { selector: '1.1-1.2', className: 'book-section' }
        ]
      },
      {
        className: 'flex flex-row flex-wrap',
        children: [
          { selector: '2.1', className: 'basis-1/2 book-subsection' },
          { selector: '2.2', className: 'basis-1/2 book-subsection' }
        ]
      }
    ]
  },
  'others': {
    type: 'others',
    containerClass: '',
    itemConfigs: []
  }
};

interface BookSectionContentProps {
  subsections: SubSection[];
  layoutType: LayoutType;
  title?: string;
  section?: string;
}

// Helper function to determine layout type from positions
export function determineLayoutType(positions: string[]): LayoutType {
  if (positions.length === 1) {
    return '1x1';
  } else if (positions.length === 2 && positions[1] === '1.2') {
    return '1x2';
  } else if (positions.length === 2 && positions[1] === '2.1') {
    return '2x1';
  } else if (positions.length === 3 && positions[1] === '1.2-2.2') {
    return '1x2-1';
  } else if (positions.length === 3 && positions[0] === '1.1-2.1') {
    return '1x2-2';
  } else if (positions.length === 3 && positions[2] === '2.1-2.2') {
    return '2x1-1';
  } else if (positions.length === 3 && positions[0] === '1.1-1.2') {
    return '2x1-2';
  } else if (positions.length === 4) {
    return '2x2';
  } else {
    return 'others';
  }
}

export default function BookSectionContent({
  subsections,
  layoutType,
  title,
  section
}: BookSectionContentProps) {
  const [processedContent, setProcessedContent] = useState<Record<string, string>>({});
  const config = LAYOUT_CONFIGS[layoutType];

  // Process content for 1x1 layout (async processing)
  useEffect(() => {
    if (layoutType === '1x1' && subsections[0]) {
      unifiedProcessor.process(subsections[0].content).then(v => {
        setProcessedContent({ '0': v.toString() });
      });
    }
  }, [subsections, layoutType]);

  const findSubsection = (selector: string): SubSection | undefined => {
    return subsections.find(ss => ss.subSectionTitle.startsWith(selector));
  };

  const processContent = (content: string): string => {
    return unifiedProcessor.processSync(content).toString();
  };

  const renderSubsection = (subsection: SubSection, className: string): React.JSX.Element => {
    const content = layoutType === '1x1' ? 
      processedContent['0'] || '' : 
      processContent(subsection.content);

    return (
      <div
        className={`book-subsection ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  const renderOthersLayout = (): React.JSX.Element => {
    return (
      <div>
        {[...Array(10).keys().map(x => x++)].map(i => {
          const rowSections = subsections.filter(s => s.subSectionTitle.startsWith(`${i}.`));

          if (!rowSections.length) return null;

          rowSections.sort();

          let columns = 0;
          const spans: number[] = [];
          const indexWithHyphenRegex = /(\d+)-(\d+)\s/;
          const indexWithoutHyphenRegex = /\.(\s*(\d+))\s/;

          for (let j = 0; j < rowSections.length; j++) {
            const matchHypen = rowSections[j]?.subSectionTitle.match(indexWithHyphenRegex);

            if (matchHypen) {
              spans.push(Number(matchHypen[2]) - Number(matchHypen[1]) + 1);
              columns = Math.max(columns, Number(matchHypen[2]));
              continue;
            }

            const matchDot = rowSections[j]?.subSectionTitle.match(indexWithoutHyphenRegex);
            if (matchDot) {
              spans.push(1);
              columns = Math.max(columns, Number(matchDot[2]));
              continue;
            }

            throw `Wrong title format: ${rowSections[j]?.subSectionTitle}`;
          }

          return (
            <div key={`${title}-${section}-${i}`} className="flex flex-row">
              {rowSections.map((s, j) => (
                <div
                  key={`${s.subSectionTitle}-${i}-${j}`}
                  className={`book-subsection px-6 py-6 border bg-yellow-50 rounded-lg mx-3 my-3 ${
                    columns > 1 ? `basis-${spans[j]}/${columns} border-r` : 'w-full'
                  }`}
                  dangerouslySetInnerHTML={{ __html: processContent(s.content) }}
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderComplexLayout = (): React.JSX.Element => {
    return (
      <div className={config.containerClass}>
        {config.itemConfigs.map((itemConfig, index) => {
          if (itemConfig.children) {
            // Complex nested structure
            return (
              <div key={index} className={itemConfig.className}>
                {itemConfig.children.map((child, childIndex) => {
                  const subsection = findSubsection(child.selector);
                  if (!subsection) {
                    return <div key={childIndex}>Error! Cannot match! {subsections[0]?.subSectionTitle}</div>;
                  }
                  return (
                    <div
                      key={childIndex}
                      className={child.className}
                      dangerouslySetInnerHTML={{ __html: processContent(subsection.content) }}
                    />
                  );
                })}
              </div>
            );
          } else {
            // Simple layout
            const subsection = subsections[index];
            if (!subsection) return null;
            return (
              <div key={index} className={itemConfig.className}>
                {renderSubsection(subsection, '')}
              </div>
            );
          }
        })}
      </div>
    );
  };

  if (layoutType === 'others') {
    return renderOthersLayout();
  }

  if (layoutType === '1x1') {
    return (
      <div>
        {subsections[0] && renderSubsection(subsections[0], '')}
      </div>
    );
  }

  return renderComplexLayout();
}