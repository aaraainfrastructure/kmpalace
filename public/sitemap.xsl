<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Google XML Sitemap - KM PALACE</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px;
            color: #2E2A26;
            background-color: #FAF8F5;
            margin: 0;
            padding: 30px;
          }
          .header {
            background: #ffffff;
            border: 1px solid rgba(199,168,109,0.4);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          }
          h1 {
            font-size: 20px;
            color: #7A0019;
            margin: 0 0 8px 0;
          }
          p {
            margin: 0;
            color: #6F655B;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #ffffff;
            border: 1px solid rgba(199,168,109,0.3);
            border-radius: 12px;
            overflow: hidden;
          }
          th {
            background-color: #F5EFE6;
            color: #6F655B;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 12px 16px;
            text-align: left;
            border-bottom: 1px solid rgba(199,168,109,0.3);
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(199,168,109,0.15);
            font-size: 12px;
          }
          tr:hover {
            background-color: #FAF8F5;
          }
          a {
            color: #7A0019;
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority {
            font-weight: bold;
            color: #059669;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>KM PALACE Google XML Sitemap</h1>
          <p>Official Indexing Map for Search Engines (Google, Bing) and AI Models (ChatGPT, Perplexity, Claude). Total pages: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>URL Location</th>
              <th>Last Modified</th>
              <th>Change Frequency</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="sitemap:urlset/sitemap:url">
              <tr>
                <td><xsl:value-of select="position()"/></td>
                <td>
                  <xsl:variable name="itemURL">
                    <xsl:value-of select="sitemap:loc"/>
                  </xsl:variable>
                  <a href="{$itemURL}"><xsl:value-of select="sitemap:loc"/></a>
                </td>
                <td><xsl:value-of select="sitemap:lastmod"/></td>
                <td><xsl:value-of select="sitemap:changefreq"/></td>
                <td class="priority"><xsl:value-of select="sitemap:priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
