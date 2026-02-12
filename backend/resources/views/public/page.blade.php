<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ $metaTitle }}</title>
    <meta name="description" content="{{ $metaDescription }}">
    <link rel="canonical" href="{{ $canonical }}">

    <meta property="og:type" content="website">
    <meta property="og:title" content="{{ $metaTitle }}">
    <meta property="og:description" content="{{ $metaDescription }}">
    <meta property="og:url" content="{{ $canonical }}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $metaTitle }}">
    <meta name="twitter:description" content="{{ $metaDescription }}">

    <script type="application/ld+json">{!! json_encode($structuredData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>

    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"; margin: 0; color: #111827; }
      main { max-width: 1000px; margin: 0 auto; padding: 32px 16px 48px; }
      h1, h2, h3 { line-height: 1.15; }
      p { line-height: 1.7; color: #374151; }
      .section { margin: 28px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; }
      .links a { display: inline-block; margin-right: 12px; color: #2563eb; text-decoration: none; }
      .links a:hover { text-decoration: underline; }
      ul { padding-left: 20px; }
      .faq details { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
      .faq summary { cursor: pointer; font-weight: 600; }
      img { max-width: 100%; height: auto; border-radius: 12px; }
      header, footer { border-bottom: 1px solid #e5e7eb; background: #ffffff; }
      footer { border-top: 1px solid #e5e7eb; border-bottom: none; }
      .shell { max-width: 1000px; margin: 0 auto; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .brand { font-weight: 800; letter-spacing: -0.02em; color: #111827; text-decoration: none; }
      .menu { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 14px; }
      .submenu { padding-left: 0; display: grid; gap: 8px; }
      .menu-link { color: #111827; text-decoration: none; font-weight: 600; }
      .menu-link:hover { text-decoration: underline; }
      .menu-group { position: relative; }
      .menu-summary { cursor: pointer; list-style: none; font-weight: 700; }
      .menu-summary::-webkit-details-marker { display: none; }
      .menu-children { padding-top: 10px; }
      .show-all { display: block; }
      .show-mobile { display: none; }
      .show-desktop { display: block; }
      @media (max-width: 720px) {
        .shell { flex-direction: column; align-items: flex-start; }
        .menu { width: 100%; flex-direction: column; }
        .show-mobile { display: block; }
        .show-desktop { display: none; }
      }
    </style>
  </head>
  <body>
    <header>
      <div class="shell">
        <a class="brand" href="/">Totan.ai</a>
        @include('public.menu', ['items' => $headerMenu ?? [], 'class' => 'menu'])
      </div>
    </header>
    <main>
      <h1>{{ $page->title }}</h1>

      @foreach ($page->sections->sortBy('order') as $section)
        <section class="section" id="{{ $section->section_key }}">
          @foreach ($section->blocks->sortBy('order') as $block)
            @php
              $type = $block->block_type;
              $content = $block->content_json;
            @endphp

            @if ($type === 'heading')
              <h2>{{ is_string($content) ? $content : '' }}</h2>
            @elseif ($type === 'paragraph')
              <p>{{ is_string($content) ? $content : '' }}</p>
            @elseif ($type === 'list')
              @php $items = is_array($content) ? $content : (is_string($content) ? json_decode($content, true) : []); @endphp
              @if (is_array($items))
                <ul>
                  @foreach ($items as $item)
                    <li>{{ is_string($item) ? $item : '' }}</li>
                  @endforeach
                </ul>
              @endif
            @elseif ($type === 'button')
              <p><a href="/contact" class="links">{{ is_string($content) ? $content : 'Contact' }}</a></p>
            @elseif ($type === 'faq_list')
              @php $faqs = is_array($content) ? $content : []; @endphp
              @if (count($faqs) > 0)
                <div class="faq">
                  <h2>FAQs</h2>
                  @foreach ($faqs as $faq)
                    @php $q = is_array($faq) ? ($faq['question'] ?? '') : ''; @endphp
                    @php $a = is_array($faq) ? ($faq['answer'] ?? '') : ''; @endphp
                    @if ($q && $a)
                      <details>
                        <summary>{{ $q }}</summary>
                        <p>{{ $a }}</p>
                      </details>
                    @endif
                  @endforeach
                </div>
              @endif
            @elseif ($type === 'internal_links')
              @php $links = is_array($content) ? $content : []; @endphp
              @if (count($links) > 0)
                <div class="links">
                  <h2>Related</h2>
                  @foreach ($links as $link)
                    @php $text = is_array($link) ? ($link['text'] ?? '') : ''; @endphp
                    @php $url = is_array($link) ? ($link['url'] ?? '') : ''; @endphp
                    @if ($text && $url)
                      <a href="{{ $url }}">{{ $text }}</a>
                    @endif
                  @endforeach
                </div>
              @endif
            @elseif ($type === 'image')
              @php $src = is_array($content) ? ($content['src'] ?? '') : (is_string($content) ? $content : ''); @endphp
              @php $alt = is_array($content) ? ($content['alt'] ?? '') : ''; @endphp
              @if ($src)
                <img src="{{ $src }}" alt="{{ $alt }}" loading="lazy">
              @endif
            @endif
          @endforeach
        </section>
      @endforeach
    </main>
    <footer>
      <div class="shell">
        <div class="text-sm" style="color:#6b7280;">© {{ date('Y') }} Totan.ai</div>
        @include('public.menu', ['items' => $footerMenu ?? [], 'class' => 'menu'])
      </div>
    </footer>
  </body>
</html>

