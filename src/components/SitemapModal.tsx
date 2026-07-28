import React, { useState } from 'react';
import { X, Globe, Copy, Check, Download, ExternalLink, Search, FileCode } from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SitemapModal: React.FC<SitemapModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'xml'>('visual');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const baseUrl = 'https://kmpalace.com';
  const today = new Date().toISOString().split('T')[0];

  const coreUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', title: 'KM PALACE Home & Virtual Tour', type: 'Core Landing' },
    { loc: `${baseUrl}/#book`, priority: '0.9', changefreq: 'daily', title: 'Online Hall Booking Engine', type: 'Core Feature' },
    { loc: `${baseUrl}/#tariff`, priority: '0.9', changefreq: 'weekly', title: '24 Hours Hall Tariff Packages', type: 'Pricing' },
    { loc: `${baseUrl}/#facilities`, priority: '0.8', changefreq: 'weekly', title: 'Hall Amenities & 11 AC Guest Rooms', type: 'Facilities' },
    { loc: `${baseUrl}/#gallery`, priority: '0.8', changefreq: 'weekly', title: 'Grand Stage & Hall Photo Gallery', type: 'Media' },
    { loc: `${baseUrl}/#location`, priority: '0.8', changefreq: 'monthly', title: 'Google Maps Driving Directions & Location', type: 'Location' },
  ];

  const blogUrls = BLOG_POSTS.map((post) => ({
    loc: `${baseUrl}/blog/${post.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    title: post.seoTitle || post.slug.replace(/-/g, ' '),
    type: 'Wedding Guide Blog',
  }));

  const allUrls = [...coreUrls, ...blogUrls];

  const filteredUrls = allUrls.filter(
    (item) =>
      item.loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-[24px] border border-[rgba(199,168,109,0.4)] shadow-2xl max-w-4xl w-full p-6 space-y-5 relative my-8 text-xs text-[#2E2A26]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(199,168,109,0.25)] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,#E8D8B0_0%,#C7A86D_100%)] text-[#2E2A26] flex items-center justify-center font-bold shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2E2A26]">Google Sitemap XML Generator</h3>
              <p className="text-[11px] text-[#6F655B]">
                Official Search Engine Indexing Map for KM PALACE ({allUrls.length} Indexed URLs)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200/60 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-[16px] border border-[rgba(199,168,109,0.3)] shadow-xs">
          <div className="flex items-center space-x-1 bg-[#F5EFE6] p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white text-[#2E2A26] shadow-xs font-bold'
                  : 'text-[#6F655B] hover:text-[#2E2A26]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>URL Index ({allUrls.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('xml')}
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'xml'
                  ? 'bg-white text-[#2E2A26] shadow-xs font-bold'
                  : 'text-[#6F655B] hover:text-[#2E2A26]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>Raw XML Code</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-[#F5EFE6] hover:bg-[#E8D8B0] text-[#2E2A26] font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-[rgba(199,168,109,0.3)]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#9B7A46]" />}
              <span>{copied ? 'Copied XML!' : 'Copy XML'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-[#2E2A26] hover:bg-black text-[#E8D8B0] font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#C7A86D]" />
              <span>Download sitemap.xml</span>
            </button>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl bg-[#7A0019] hover:bg-[#5C0013] text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open /sitemap.xml</span>
            </a>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'visual' ? (
          <div className="space-y-3">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#A09384] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search sitemap URLs, titles, or page types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(199,168,109,0.3)] bg-white text-xs text-[#2E2A26] focus:outline-none focus:border-[#C7A86D]"
              />
            </div>

            {/* List Table */}
            <div className="bg-white rounded-[16px] border border-[rgba(199,168,109,0.3)] overflow-hidden max-h-[50vh] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F5EFE6] text-[11px] font-bold text-[#6F655B] uppercase tracking-wider sticky top-0 z-10 border-b border-[rgba(199,168,109,0.3)]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Page / Article Title</th>
                    <th className="p-3">URL Location</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Priority</th>
                    <th className="p-3 text-center">Freq</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(199,168,109,0.15)] text-xs">
                  {filteredUrls.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#A09384]">
                        No sitemap entries match "{searchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredUrls.map((item, idx) => (
                      <tr key={item.loc} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3 font-num font-semibold text-[#A09384]">{idx + 1}</td>
                        <td className="p-3 font-semibold text-[#2E2A26] max-w-xs truncate" title={item.title}>
                          {item.title}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#7A0019]">
                          <a href={item.loc} target="_blank" rel="noreferrer" className="hover:underline flex items-center space-x-1">
                            <span className="truncate max-w-[220px]">{item.loc}</span>
                            <ExternalLink className="w-3 h-3 text-[#A09384] shrink-0" />
                          </a>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5EFE6] text-[#9B7A46]">
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3 text-center font-num font-bold text-emerald-700">{item.priority}</td>
                        <td className="p-3 text-center text-[#6F655B] font-num">{item.changefreq}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* XML Code View */
          <div className="relative">
            <pre className="bg-[#1E1E1E] text-emerald-400 p-4 rounded-[16px] text-[11px] font-mono overflow-x-auto max-h-[50vh] leading-relaxed select-all">
              {xmlString}
            </pre>
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-2 border-t border-[rgba(199,168,109,0.2)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A09384] gap-2">
          <span>Google Search Console XML Schema 0.9 Compliant</span>
          <span>Sitemap URL: <code className="text-[#2E2A26] font-bold">https://kmpalace.com/sitemap.xml</code></span>
        </div>

      </div>
    </div>
  );
};
