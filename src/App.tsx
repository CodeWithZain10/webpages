import { useState, useEffect } from 'react';
import { Sparkles, Loader, RefreshCw, Wand2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

interface ContentBlock {
  type: 'paragraph' | 'bullet' | 'numbered' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  text: string;
}

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: ContentBlock[];
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numberedListCounter, setNumberedListCounter] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [generationLoading, setGenerationLoading] = useState(false);

  const generateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      setError('Please enter a keyword');
      return;
    }

    try {
      setGenerationLoading(true);
      setError(null);
      const response = await fetch('https://n8n.fishhook.info/webhook-test/b37093af-efaa-4746-9b83-0e89e03d983e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate article');
      }

      setKeyword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating article');
    } finally {
      setGenerationLoading(false);
    }
  };

  const fetchLatestArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/receive-article`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }

      const data = await response.json();

      if (data && data.id) {
        setArticle(data);
        setDisplayedIndex(0);
        setCharIndex(0);
        setIsComplete(false);
        setNumberedListCounter(0);
      } else {
        setError('No articles found.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading article');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!article) return;

    if (displayedIndex >= article.content.length) {
      setIsComplete(true);
      return;
    }

    const currentBlock = article.content[displayedIndex];
    const blockLength = currentBlock.text.length;

    if (charIndex < blockLength) {
      const timeout = setTimeout(() => {
        setCharIndex(charIndex + 1);
      }, 0);
      return () => clearTimeout(timeout);
    } else {
      const delay = setTimeout(() => {
        if (currentBlock.type === 'numbered') {
          setNumberedListCounter(prev => prev + 1);
        }
        setDisplayedIndex(displayedIndex + 1);
        setCharIndex(0);
      }, 0);
      return () => clearTimeout(delay);
    }
  }, [charIndex, displayedIndex, article]);


  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-2xl mx-auto px-6 pt-20 pb-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <Wand2 className="w-10 h-10 text-slate-900 mr-3" />
              <h1 className="text-5xl font-serif font-bold text-slate-900">AI AutoBlogger</h1>
            </div>
            <p className="text-lg text-slate-600">Outperform Competitors With AI-Driven SEO Article Generation</p>
          </div>

          <form onSubmit={generateArticle} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="mb-6">
              <label htmlFor="keyword" className="block text-sm font-medium text-slate-700 mb-2">
                Enter a keyword
              </label>
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g., Machine Learning, Web Design, Climate Change..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                disabled={generationLoading}
              />
            </div>
            <button
              type="submit"
              disabled={generationLoading}
              className="w-full px-6 py-3 bg-slate-900 text-white rounded-lg text-base font-medium hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {generationLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Article</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Or fetch existing article</h2>
            <p className="text-slate-600 mb-6">Load the most recently generated article to view it.</p>
            <button
              onClick={fetchLatestArticle}
              disabled={loading}
              className="w-full px-6 py-3 bg-slate-100 text-slate-900 rounded-lg text-base font-medium hover:bg-slate-200 transition-all border border-slate-300 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Fetch Article</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentBlock = article.content[displayedIndex];
  const displayedText = currentBlock ? currentBlock.text.slice(0, charIndex) : '';

  const getHeadingClass = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    const classes = {
      h1: 'text-4xl font-bold mb-6 mt-8',
      h2: 'text-3xl font-bold mb-4 mt-6',
      h3: 'text-2xl font-bold mb-3 mt-5',
      h4: 'text-xl font-bold mb-2 mt-4',
      h5: 'text-lg font-bold mb-2 mt-3',
      h6: 'text-base font-bold mb-2 mt-2',
    };
    return classes[level];
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const isCurrentBlock = index === displayedIndex;
    const text = isCurrentBlock ? displayedText : block.text;
    const showCursor = isCurrentBlock && !isComplete;

    if (block.type.startsWith('h')) {
      const level = block.type as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      return (
        <div key={index} className={`text-gray-900 font-serif ${getHeadingClass(level)}`}>
          {text}
          {showCursor && <span className="inline-block w-0.5 h-6 bg-gray-900 ml-1 animate-pulse" />}
        </div>
      );
    }

    if (block.type === 'bullet') {
      return (
        <div key={index} className="flex items-start space-x-4">
          <div className="w-2 h-2 rounded-full bg-gray-400 mt-3 flex-shrink-0" />
          <p className="text-xl leading-relaxed text-gray-800 font-serif">
            {text}
            {showCursor && <span className="inline-block w-0.5 h-6 bg-gray-900 ml-1 animate-pulse" />}
          </p>
        </div>
      );
    }

    if (block.type === 'numbered') {
      const itemNumber = article.content.slice(0, index).filter(b => b.type === 'numbered').length + 1;
      return (
        <div key={index} className="flex items-start space-x-4">
          <span className="text-xl font-serif text-gray-600 flex-shrink-0 min-w-[2rem]">{itemNumber}.</span>
          <p className="text-xl leading-relaxed text-gray-800 font-serif">
            {text}
            {showCursor && <span className="inline-block w-0.5 h-6 bg-gray-900 ml-1 animate-pulse" />}
          </p>
        </div>
      );
    }

    return (
      <p key={index} className="text-xl leading-relaxed text-gray-800 font-serif">
        {text}
        {showCursor && <span className="inline-block w-0.5 h-6 bg-gray-900 ml-1 animate-pulse" />}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-3xl mx-auto px-6 pt-20 pb-20">
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>
          <h2 className="text-2xl md:text-3xl font-serif text-gray-600 leading-relaxed">
            {article.subtitle}
          </h2>
        </div>

        <div className="space-y-6">
          {article.content.map((block, index) => (
            <div
              key={index}
              className={index > displayedIndex ? 'invisible' : index < displayedIndex ? 'opacity-100' : ''}
            >
              {renderBlock(block, index)}
            </div>
          ))}
        </div>
      </article>

      <div className="fixed bottom-8 right-8 flex flex-col gap-3">
        <button
          onClick={() => {
            setDisplayedIndex(0);
            setCharIndex(0);
            setIsComplete(false);
            setNumberedListCounter(0);
          }}
          className="px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Replay</span>
        </button>

        <button
          onClick={fetchLatestArticle}
          disabled={loading}
          className="px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Fetch</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
