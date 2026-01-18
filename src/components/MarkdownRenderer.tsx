"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  darkMode?: boolean;
}

export function MarkdownRenderer({ content, darkMode = false }: MarkdownRendererProps) {
  const d = darkMode;

  return (
    <div className={`prose max-w-none ${d ? "prose-invert" : "prose-slate"}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className={`text-3xl sm:text-4xl font-bold mt-8 mb-4 ${d ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-2xl sm:text-3xl font-bold mt-6 mb-3 ${d ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-xl sm:text-2xl font-semibold mt-5 mb-2 ${d ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={`text-lg sm:text-xl font-semibold mt-4 mb-2 ${d ? "text-gray-100" : "text-gray-800 dark:text-gray-100"}`}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className={`text-base leading-relaxed mb-4 ${d ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc list-inside mb-4 space-y-2 ${d ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-inside mb-4 space-y-2 ${d ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`ml-4 ${d ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}`}>{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className={`hover:underline ${d ? "text-blue-400" : "text-blue-600 dark:text-blue-400"}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold ${d ? "text-white" : "text-gray-900 dark:text-white"}`}>
              {children}
            </strong>
          ),
          code: ({ children }) => (
            <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${d ? "bg-gray-800 text-gray-200" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"}`}>
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 pl-4 italic my-4 ${d ? "border-gray-600 text-gray-400" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}>
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className={`my-8 border-t ${d ? "border-gray-700" : "border-gray-300 dark:border-gray-700"}`} />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className={`min-w-full divide-y ${d ? "divide-gray-700" : "divide-gray-300 dark:divide-gray-700"}`}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={d ? "bg-gray-800" : "bg-gray-50 dark:bg-gray-800"}>{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className={`divide-y ${d ? "divide-gray-700 bg-gray-900" : "divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900"}`}>
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider ${d ? "text-gray-400" : "text-gray-500 dark:text-gray-400"}`}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={`px-3 py-4 text-sm ${d ? "text-gray-300" : "text-gray-700 dark:text-gray-300"}`}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
