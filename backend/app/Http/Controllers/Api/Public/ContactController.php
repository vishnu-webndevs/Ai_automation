<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use App\Models\AppSetting;
use App\Mail\ContactSubmissionMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'required|email:rfc,dns|max:255',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
            'source' => 'nullable|string|max:100',
            'source_url' => 'nullable|string|max:2048',
        ]);

        ContactSubmission::create([
            ...$validated,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        $to = AppSetting::getValue('contact_to_email') ?? env('CONTACT_TO_EMAIL') ?? config('mail.from.address');
        if ($to) {
            try {
                Mail::to($to)->send(new ContactSubmissionMail($validated));
            } catch (\Throwable $e) {
                // Do not fail the request if mail transport fails
                // Optionally log: \Log::warning('Contact mail failed', ['error' => $e->getMessage()]);
            }
        }

        return response()->json(['message' => 'Submitted'], 201);
    }
}
