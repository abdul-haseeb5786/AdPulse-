import { useSearchParams, useOutletContext } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { useDarkMode } from '../hooks/useDarkMode';
import { CopyGenerator } from '../components/aitools/CopyGenerator';
import { SocialGenerator } from '../components/aitools/SocialGenerator';
import { HashtagGenerator } from '../components/aitools/HashtagGenerator';

const tabs = [
  { key: 'copy', label: 'Ad Copy', icon: '✍️' },
  { key: 'social', label: 'Social Captions', icon: '📱' },
  { key: 'hashtags', label: 'Hashtags', icon: '#' },
];

interface AIToolsContext {
  onMenuToggle: () => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

export const AITools = () => {
  const { onMenuToggle, showToast } = useOutletContext<AIToolsContext>();
  const [isDark, toggleDark] = useDarkMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'copy';

  const renderContent = () => {
    switch (activeTab) {
      case 'copy':     return <CopyGenerator />;
      case 'social':   return <SocialGenerator />;
      case 'hashtags': return <HashtagGenerator />;
      default:         return <CopyGenerator />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-page)] transition-all duration-200">
      <TopBar
        isDark={isDark}
        toggleDark={toggleDark}
        activeDate=""
        onDateChange={() => {}}
        onMenuToggle={onMenuToggle}
        title="AI Tools"
        subtitle="Generate ad copy, captions, and hashtags with AI"
        showToast={showToast}
      />

      {/* Tab Bar */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border)] px-4 lg:px-8">
        <div className="flex items-center gap-1 max-w-[1600px] mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSearchParams({ tab: tab.key })}
              className={`
                h-[44px] px-4 flex items-center gap-2 text-[13px] font-medium border-b-2 transition-all duration-150 whitespace-nowrap
                ${activeTab === tab.key
                  ? 'border-[var(--primary)] text-[var(--primary)] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full animate-fadeIn">
        {renderContent()}
      </div>
    </div>
  );
};
