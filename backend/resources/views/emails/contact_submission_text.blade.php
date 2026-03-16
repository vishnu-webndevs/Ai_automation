{{ isset($data['subject']) && is_string($data['subject']) && trim($data['subject']) !== '' ? trim($data['subject']) : 'New inquiry' }}

@php
    $name = trim((string)($data['name'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $company = trim((string)($data['company'] ?? ''));
    $phone = trim((string)($data['phone'] ?? ''));
    $message = trim((string)($data['message'] ?? ''));
    $sourceUrl = trim((string)($data['source_url'] ?? ''));
@endphp

@if ($name !== '')
Name: {{ $name }}
@endif
@if ($email !== '')
Email: {{ $email }}
@endif
@if ($company !== '')
Company: {{ $company }}
@endif
@if ($phone !== '')
Phone: {{ $phone }}
@endif

@if ($message !== '')
Message:
{{ $message }}
@endif

@if ($sourceUrl !== '')
Page: {{ $sourceUrl }}
@endif

