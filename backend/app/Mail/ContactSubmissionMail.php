<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class ContactSubmissionMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function build()
    {
        $subject = isset($this->data['subject']) && is_string($this->data['subject']) && trim($this->data['subject']) !== ''
            ? trim($this->data['subject'])
            : 'New inquiry';

        $mailable = $this->from(config('mail.from.address'), config('mail.from.name'))
            ->subject($subject)
            ->view('emails.contact_submission')
            ->text('emails.contact_submission_text')
            ->with(['data' => $this->data]);

        if (isset($this->data['email']) && is_string($this->data['email']) && trim($this->data['email']) !== '') {
            $mailable->replyTo(trim($this->data['email']));
        }

        return $mailable;
    }
}
