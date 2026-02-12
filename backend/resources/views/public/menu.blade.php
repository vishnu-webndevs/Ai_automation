@php
  $items = $items ?? [];
@endphp

<ul class="{{ $class ?? 'menu' }}">
  @foreach ($items as $item)
    @if (!($item['is_visible'] ?? true))
      @continue
    @endif
    @php $showOn = $item['show_on'] ?? 'all'; @endphp
    @php $liClass = $showOn === 'mobile' ? 'show-mobile' : ($showOn === 'desktop' ? 'show-desktop' : 'show-all'); @endphp
    <li class="{{ $liClass }}">
      @php $url = $item['url'] ?? '#'; @endphp
      @if (!empty($item['children']))
        <details class="menu-group">
          <summary class="menu-summary">
            <span>{{ $item['label'] }}</span>
          </summary>
          <div class="menu-children">
            @include('public.menu', ['items' => $item['children'], 'class' => 'menu submenu'])
          </div>
        </details>
      @else
        <a href="{{ $url }}" class="menu-link">{{ $item['label'] }}</a>
      @endif
    </li>
  @endforeach
</ul>

