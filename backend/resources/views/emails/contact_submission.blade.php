<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ ($data['subject'] ?? null) ? $data['subject'] : 'New inquiry' }}</title>
    <style>
        body { margin: 0; padding: 0; background: #0b1220; font-family: Arial, sans-serif; color: #0f172a; }
        .wrap { width: 100%; padding: 28px 14px; }
        .card { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
        .header { padding: 18px 20px; background: linear-gradient(135deg, #111827, #0b1220); color: #ffffff; }
        .brand { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.72); }
        .title { font-size: 22px; margin: 8px 0 0; line-height: 1.25; }
        .body { padding: 18px 20px 8px; }
        .grid { width: 100%; border-collapse: collapse; }
        .grid td { padding: 10px 0; vertical-align: top; border-bottom: 1px solid #eef2f7; }
        .label { width: 140px; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; }
        .value { color: #0f172a; font-size: 14px; }
        .message { white-space: pre-wrap; color: #0f172a; font-size: 14px; line-height: 1.5; }
        .footer { padding: 12px 20px 18px; color: #64748b; font-size: 12px; }
        .link { color: #2563eb; text-decoration: none; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="card">
            <div class="header">
                <div class="brand">Totan.ai</div>
                <div class="title">{{ ($data['subject'] ?? null) ? $data['subject'] : 'New inquiry' }}</div>
            </div>
            <div class="body">
                <table class="grid" role="presentation">
                    @php
                        $name = trim((string)($data['name'] ?? ''));
                        $email = trim((string)($data['email'] ?? ''));
                        $company = trim((string)($data['company'] ?? ''));
                        $phone = trim((string)($data['phone'] ?? ''));
                        $message = trim((string)($data['message'] ?? ''));
                        $sourceUrl = trim((string)($data['source_url'] ?? ''));
                    @endphp

                    @if ($name !== '')
                    <tr>
                        <td class="label">Name</td>
                        <td class="value">{{ $name }}</td>
                    </tr>
                    @endif

                    @if ($email !== '')
                    <tr>
                        <td class="label">Email</td>
                        <td class="value">{{ $email }}</td>
                    </tr>
                    @endif

                    @if ($company !== '')
                    <tr>
                        <td class="label">Company</td>
                        <td class="value">{{ $company }}</td>
                    </tr>
                    @endif

                    @if ($phone !== '')
                    <tr>
                        <td class="label">Phone</td>
                        <td class="value">{{ $phone }}</td>
                    </tr>
                    @endif

                    @if ($message !== '')
                    <tr>
                        <td class="label">Message</td>
                        <td class="message">{{ $message }}</td>
                    </tr>
                    @endif

                    @if ($sourceUrl !== '')
                    <tr>
                        <td class="label">Page</td>
                        <td class="value">
                            <a class="link" href="{{ $sourceUrl }}">{{ $sourceUrl }}</a>
                        </td>
                    </tr>
                    @endif
                </table>
            </div>
            <div class="footer">
                This email was generated from a website form submission.
            </div>
        </div>
    </div>
</body>
</html>
