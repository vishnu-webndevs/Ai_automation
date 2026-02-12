<?php

namespace App\Services\AI;

interface AIServiceInterface
{
    public function generatePageContent(array $context): array;
}
