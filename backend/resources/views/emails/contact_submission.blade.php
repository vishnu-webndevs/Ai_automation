<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Submission</title>
    <style>
        body { font-family: Arial, sans-serif; color: #0f172a; }
        .card { max-width: 640px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
        .row { margin-bottom: 10px; }
        .label { font-weight: bold; color: #334155; display: inline-block; width: 140px; }
        .value { color: #0f172a; }
        .muted { color: #64748b; font-size: 12px; margin-top: 12px; }
    </style>
</head>
<body>
    <div class="card">
        <h2>New Contact Submission</h2>
        <div class="row"><span class="label">Name:</span> <span class="value">{{ $data['name'] ?? '-' }}</span></div>
        <div class="row"><span class="label">Email:</span> <span class="value">{{ $data['email'] ?? '-' }}</span></div>
        <div class="row"><span class="label">Company:</span> <span class="value">{{ $data['company'] ?? '-' }}</span></div>
        <div class="row"><span class="label">Phone:</span> <span class="value">{{ $data['phone'] ?? '-' }}</span></div>
        <div class="row"><span class="label">Subject:</span> <span class="value">{{ $data['subject'] ?? '-' }}</span></div>
        <div class="row"><span class="label">Message:</span></div>
        <div class="row"><div class="value">{{ $data['message'] ?? '-' }}</div></div>
        <div class="row"><span class="label">Source:</span> <span class="value">{{ $data['source'] ?? '-' }}</span></div>
        <div class="row"><span class="label">Source URL:</span> <span class="value">{{ $data['source_url'] ?? '-' }}</span></div>
        <p class="muted">You received this email because someone submitted the contact form on your website.</p>
    </div>
</body>
</html>
