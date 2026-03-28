<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Industry;
use App\Models\Integration;
use App\Models\Page;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Solution;
use App\Models\UseCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class SitemapController extends Controller
{
    public function index()
    {
        $generate = function () {
            try {
                $baseUrl = $this->getBaseUrl();
                $locs = $this->getSitemapLocs($baseUrl);

                $items = [];
                foreach ($locs as $name => $loc) {
                    $items[] = [
                        'loc' => $loc,
                        'lastmod' => $this->computeLastmod($name),
                    ];
                }

                return $this->toSitemapIndexXml($items);
            } catch (\Throwable $e) {
                $this->safeReport($e);
                $baseUrl = $this->getBaseUrl();
                return $this->toSitemapIndexXml([
                    [
                        'loc' => rtrim($baseUrl, '/') . '/sitemaps/pages.xml',
                        'lastmod' => now()->toAtomString(),
                    ],
                ]);
            }
        };

        try {
            $xml = Cache::remember('public_sitemap_index_xml', 600, $generate);
        } catch (\Throwable $e) {
            $this->safeReport($e);
            $xml = $generate();
        }

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function show(string $name)
    {
        $allowed = ['pages', 'services', 'blogs'];
        if (!in_array($name, $allowed, true)) {
            abort(404);
        }

        $generate = function () use ($name) {
            try {
                return $this->generateUrlsetXml($name);
            } catch (\Throwable $e) {
                $this->safeReport($e);
                $baseUrl = $this->getBaseUrl();
                return $this->toUrlsetXml([
                    [
                        'loc' => rtrim($baseUrl, '/'),
                        'lastmod' => now()->toAtomString(),
                    ],
                ]);
            }
        };

        try {
            $xml = Cache::remember("public_sitemap_{$name}_xml", 600, $generate);
        } catch (\Throwable $e) {
            $this->safeReport($e);
            $xml = $generate();
        }

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function xsl()
    {
        $xsl = <<<'XSL'
<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <title>Sitemap</title>
        <style>
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:24px;color:#111827}
          h1{font-size:20px;margin:0 0 16px}
          table{border-collapse:collapse;width:100%}
          th,td{border-bottom:1px solid #e5e7eb;padding:10px 8px;text-align:left;font-size:14px;vertical-align:top}
          th{background:#f9fafb;font-weight:600}
          a{color:#2563eb;text-decoration:none}
          a:hover{text-decoration:underline}
          .muted{color:#6b7280;font-size:12px}
        </style>
      </head>
      <body>
        <xsl:choose>
          <xsl:when test="s:sitemapindex">
            <h1>Sitemap Index</h1>
            <div class="muted">
              <xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sitemaps
            </div>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:sitemapindex/s:sitemap">
                  <tr>
                    <td>
                      <a>
                        <xsl:attribute name="href"><xsl:value-of select="s:loc"/></xsl:attribute>
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td><xsl:value-of select="s:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:when>
          <xsl:when test="s:urlset">
            <h1>Sitemap</h1>
            <div class="muted">
              <xsl:value-of select="count(s:urlset/s:url)"/> URLs
            </div>
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td>
                      <a>
                        <xsl:attribute name="href"><xsl:value-of select="s:loc"/></xsl:attribute>
                        <xsl:value-of select="s:loc"/>
                      </a>
                    </td>
                    <td><xsl:value-of select="s:lastmod"/></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </xsl:when>
          <xsl:otherwise>
            <h1>Sitemap</h1>
            <div class="muted">Unsupported XML format</div>
          </xsl:otherwise>
        </xsl:choose>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
XSL;

        return response($xsl, 200)->header('Content-Type', 'text/xsl; charset=UTF-8');
    }

    private function getBaseUrl(): string
    {
        return rtrim(env('FRONTEND_URL') ?: env('PUBLIC_SITE_URL') ?: request()->getSchemeAndHttpHost(), '/');
    }

    private function safeReport(\Throwable $e): void
    {
        try {
            report($e);
        } catch (\Throwable $ignored) {
        }
    }

    private function getSitemapLocs(string $baseUrl): array
    {
        $baseUrl = rtrim($baseUrl, '/');
        return [
            'pages' => $baseUrl . '/sitemaps/pages.xml',
            'services' => $baseUrl . '/sitemaps/services.xml',
            'blogs' => $baseUrl . '/sitemaps/blogs.xml',
        ];
    }

    private function toSitemapIndexXml(array $sitemaps): string
    {
        $lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
            '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ];

        foreach ($sitemaps as $item) {
            $loc = isset($item['loc']) ? (string) $item['loc'] : '';
            $loc = rtrim($loc, '/');
            if ($loc === '') {
                continue;
            }

            $lines[] = '  <sitemap>';
            $lines[] = '    <loc>' . htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>';

            $lastmod = $item['lastmod'] ?? null;
            if (!empty($lastmod)) {
                $lines[] = '    <lastmod>' . htmlspecialchars((string) $lastmod, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</lastmod>';
            }

            $lines[] = '  </sitemap>';
        }

        $lines[] = '</sitemapindex>';
        return implode("\n", $lines);
    }

    private function toUrlsetXml(array $urls): string
    {
        $lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ];

        foreach ($urls as $url) {
            $loc = isset($url['loc']) ? (string) $url['loc'] : '';
            $loc = rtrim($loc, '/');
            if ($loc === '') {
                continue;
            }

            $lines[] = '  <url>';
            $lines[] = '    <loc>' . htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>';

            $lastmod = $url['lastmod'] ?? null;
            if (!empty($lastmod)) {
                $lines[] = '    <lastmod>' . htmlspecialchars((string) $lastmod, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</lastmod>';
            }

            $lines[] = '  </url>';
        }

        $lines[] = '</urlset>';
        return implode("\n", $lines);
    }

    private function selectColumns(string $table, array $columns): array
    {
        $selected = [];
        foreach ($columns as $column) {
            if (Schema::hasColumn($table, $column)) {
                $selected[] = $column;
            }
        }
        return $selected;
    }

    private function applyIsActiveFilter($query, string $table)
    {
        if (Schema::hasTable($table) && Schema::hasColumn($table, 'is_active')) {
            $query->where('is_active', true);
        }
        return $query;
    }

    private function computeLastmod(string $name): ?string
    {
        try {
            if ($name === 'pages' && Schema::hasTable('pages') && Schema::hasColumn('pages', 'updated_at')) {
                $q = Page::query();
                if (Schema::hasColumn('pages', 'status')) {
                    $q->where('status', 'published');
                }
                if (Schema::hasColumn('pages', 'type')) {
                    $q->where('type', '!=', 'blog');
                }
                if (Schema::hasTable('seo_meta') && Schema::hasColumn('seo_meta', 'noindex')) {
                    $q->whereDoesntHave('seo', function ($sub) {
                        $sub->where('noindex', true);
                    });
                }
                return $this->toAtom($q->max('updated_at'));
            }

            if ($name === 'services') {
                $lastmods = [];
                if (Schema::hasTable('services') && Schema::hasColumn('services', 'updated_at')) {
                    $q = $this->applyIsActiveFilter(Service::query(), 'services');
                    $lastmods[] = $q->max('updated_at');
                }
                if (Schema::hasTable('service_categories') && Schema::hasColumn('service_categories', 'updated_at')) {
                    $q = $this->applyIsActiveFilter(ServiceCategory::query(), 'service_categories');
                    $lastmods[] = $q->max('updated_at');
                }
                return $this->toAtom(collect($lastmods)->filter()->max());
            }

            if ($name === 'blogs') {
                $lastmods = [];
                if (Schema::hasTable('pages') && Schema::hasColumn('pages', 'updated_at') && Schema::hasColumn('pages', 'type')) {
                    $q = Page::query()->where('type', 'blog');
                    if (Schema::hasColumn('pages', 'status')) {
                        $q->where('status', 'published');
                    }
                    if (Schema::hasTable('seo_meta') && Schema::hasColumn('seo_meta', 'noindex')) {
                        $q->whereDoesntHave('seo', function ($sub) {
                            $sub->where('noindex', true);
                        });
                    }
                    $lastmods[] = $q->max('updated_at');
                }
                if (Schema::hasTable('blog_categories') && Schema::hasColumn('blog_categories', 'updated_at')) {
                    $q = $this->applyIsActiveFilter(BlogCategory::query(), 'blog_categories');
                    $lastmods[] = $q->max('updated_at');
                }
                if (Schema::hasTable('blog_tags') && Schema::hasColumn('blog_tags', 'updated_at')) {
                    $q = $this->applyIsActiveFilter(BlogTag::query(), 'blog_tags');
                    $lastmods[] = $q->max('updated_at');
                }
                return $this->toAtom(collect($lastmods)->filter()->max());
            }
        } catch (\Throwable $e) {
            $this->safeReport($e);
        }

        return null;
    }

    private function toAtom($value): ?string
    {
        if (empty($value)) {
            return null;
        }
        try {
            return Carbon::parse($value)->toAtomString();
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function generateUrlsetXml(string $name): string
    {
        $baseUrl = $this->getBaseUrl();
        $urlsByLoc = [];

        $addUrl = function (string $loc, $lastmod = null) use (&$urlsByLoc) {
            $loc = rtrim($loc, '/');
            if ($loc === '') {
                return;
            }
            if (isset($urlsByLoc[$loc])) {
                return;
            }
            $urlsByLoc[$loc] = [
                'loc' => $loc,
                'lastmod' => $lastmod,
            ];
        };

        if ($name === 'pages' && Schema::hasTable('pages') && Schema::hasColumn('pages', 'slug')) {
            $pageColumns = $this->selectColumns('pages', ['id', 'slug', 'updated_at', 'type']);
            $pagesQuery = Page::query()->select($pageColumns);

            if (Schema::hasColumn('pages', 'status')) {
                $pagesQuery->where('status', 'published');
            }
            if (Schema::hasColumn('pages', 'type')) {
                $pagesQuery->where('type', '!=', 'blog');
            }
            if (Schema::hasTable('seo_meta') && Schema::hasColumn('seo_meta', 'noindex')) {
                $pagesQuery->whereDoesntHave('seo', function ($q) {
                    $q->where('noindex', true);
                });
            }
            if (Schema::hasColumn('pages', 'updated_at')) {
                $pagesQuery->orderBy('updated_at', 'desc');
            }

            $pages = $pagesQuery->get();
            foreach ($pages as $page) {
                $loc = $baseUrl . '/' . ltrim($page->slug, '/');
                $lastmod = Schema::hasColumn('pages', 'updated_at') ? optional($page->updated_at)->toAtomString() : null;
                $addUrl($loc, $lastmod);
            }
        }

        if ($name === 'services') {
            if (Schema::hasTable('services') && Schema::hasColumn('services', 'slug')) {
                $servicesColumns = $this->selectColumns('services', ['slug', 'updated_at']);
                $servicesQuery = $this->applyIsActiveFilter(Service::query(), 'services')->select($servicesColumns);
                if (Schema::hasColumn('services', 'updated_at')) {
                    $servicesQuery->orderBy('updated_at', 'desc');
                }
                $services = $servicesQuery->get();

                foreach ($services as $service) {
                    $addUrl(
                        $baseUrl . '/services/' . ltrim($service->slug, '/'),
                        Schema::hasColumn('services', 'updated_at') ? optional($service->updated_at)->toAtomString() : null
                    );
                }
            }

            if (Schema::hasTable('service_categories') && Schema::hasColumn('service_categories', 'slug')) {
                $serviceCategoryColumns = $this->selectColumns('service_categories', ['slug', 'updated_at']);
                $serviceCategoriesQuery = $this->applyIsActiveFilter(ServiceCategory::query(), 'service_categories')->select($serviceCategoryColumns);
                if (Schema::hasColumn('service_categories', 'updated_at')) {
                    $serviceCategoriesQuery->orderBy('updated_at', 'desc');
                }
                $serviceCategories = $serviceCategoriesQuery->get();

                foreach ($serviceCategories as $category) {
                    $addUrl(
                        $baseUrl . '/services/category/' . ltrim($category->slug, '/'),
                        Schema::hasColumn('service_categories', 'updated_at') ? optional($category->updated_at)->toAtomString() : null
                    );
                }
            }
        }

        if ($name === 'blogs') {
            if (Schema::hasTable('pages') && Schema::hasColumn('pages', 'slug') && Schema::hasColumn('pages', 'type')) {
                $pageColumns = $this->selectColumns('pages', ['id', 'slug', 'updated_at', 'type']);
                $blogsQuery = Page::query()->select($pageColumns)->where('type', 'blog');

                if (Schema::hasColumn('pages', 'status')) {
                    $blogsQuery->where('status', 'published');
                }
                if (Schema::hasTable('seo_meta') && Schema::hasColumn('seo_meta', 'noindex')) {
                    $blogsQuery->whereDoesntHave('seo', function ($q) {
                        $q->where('noindex', true);
                    });
                }
                if (Schema::hasColumn('pages', 'updated_at')) {
                    $blogsQuery->orderBy('updated_at', 'desc');
                }

                $blogs = $blogsQuery->get();
                foreach ($blogs as $blog) {
                    $addUrl(
                        $baseUrl . '/blog/' . ltrim($blog->slug, '/'),
                        Schema::hasColumn('pages', 'updated_at') ? optional($blog->updated_at)->toAtomString() : null
                    );
                }
            }

            if (Schema::hasTable('blog_categories') && Schema::hasColumn('blog_categories', 'slug')) {
                $blogCategoryColumns = $this->selectColumns('blog_categories', ['slug', 'updated_at']);
                $blogCategoriesQuery = $this->applyIsActiveFilter(BlogCategory::query(), 'blog_categories')->select($blogCategoryColumns);
                if (Schema::hasColumn('blog_categories', 'updated_at')) {
                    $blogCategoriesQuery->orderBy('updated_at', 'desc');
                }
                $blogCategories = $blogCategoriesQuery->get();

                foreach ($blogCategories as $blogCategory) {
                    $addUrl(
                        $baseUrl . '/blog/category/' . ltrim($blogCategory->slug, '/'),
                        Schema::hasColumn('blog_categories', 'updated_at') ? optional($blogCategory->updated_at)->toAtomString() : null
                    );
                }
            }

            if (Schema::hasTable('blog_tags') && Schema::hasColumn('blog_tags', 'slug')) {
                $blogTagColumns = $this->selectColumns('blog_tags', ['slug', 'updated_at']);
                $blogTagsQuery = $this->applyIsActiveFilter(BlogTag::query(), 'blog_tags')->select($blogTagColumns);
                if (Schema::hasColumn('blog_tags', 'updated_at')) {
                    $blogTagsQuery->orderBy('updated_at', 'desc');
                }
                $blogTags = $blogTagsQuery->get();

                foreach ($blogTags as $blogTag) {
                    $addUrl(
                        $baseUrl . '/blog/tag/' . ltrim($blogTag->slug, '/'),
                        Schema::hasColumn('blog_tags', 'updated_at') ? optional($blogTag->updated_at)->toAtomString() : null
                    );
                }
            }
        }

        return $this->toUrlsetXml(array_values($urlsByLoc));
    }
}
